import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/storage/local_storage_service.dart';

class UserProfile {
  final String name;
  final String email;
  final String avatarUrl;
  final bool isLoggedIn;
  final bool isVip;
  final bool rememberMe;

  const UserProfile({
    required this.name,
    required this.email,
    required this.avatarUrl,
    required this.isLoggedIn,
    this.isVip = false,
    this.rememberMe = true,
  });

  UserProfile copyWith({
    String? name,
    String? email,
    String? avatarUrl,
    bool? isLoggedIn,
    bool? isVip,
    bool? rememberMe,
  }) {
    return UserProfile(
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isVip: isVip ?? this.isVip,
      rememberMe: rememberMe ?? this.rememberMe,
    );
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      name: json['name'] as String? ?? 'User',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String? ??
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: json['isLoggedIn'] as bool? ?? false,
      isVip: json['isVip'] as bool? ?? false,
      rememberMe: json['rememberMe'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'isLoggedIn': isLoggedIn,
      'isVip': isVip,
      'rememberMe': rememberMe,
    };
  }
}

class AuthNotifier extends StateNotifier<UserProfile> {
  final LocalStorageService? _storageService;

  AuthNotifier([this._storageService])
      : super(const UserProfile(
          name: 'Hafiz Muhammad',
          email: 'hafiz@streamflix.id',
          avatarUrl:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: false,
          isVip: false,
        )) {
    _restoreSavedSession();
  }

  Future<void> _restoreSavedSession() async {
    if (_storageService == null) return;
    try {
      final rememberMe = _storageService.getRememberMe();
      if (!rememberMe) return;

      final session = await _storageService.getUserSession();
      if (session != null) {
        state = UserProfile.fromJson(session);
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Gagal me-restore sesi login: $e');
      }
    }
  }

  Future<bool> login(String email, String password, bool rememberMe) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final isVipUser = email.toLowerCase().contains('hafiz') || email.toLowerCase().contains('vip');
    final profile = UserProfile(
      name: email.contains('@') ? email.split('@')[0].toUpperCase() : email,
      email: email,
      avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: true,
      isVip: isVipUser,
      rememberMe: rememberMe,
    );

    state = profile;

    if (_storageService != null) {
      await _storageService.setRememberMe(rememberMe);
      if (rememberMe) {
        // Simpan token simulasi selaras dengan Go auth-service
        await _storageService.saveAuthTokens(
          accessToken: 'liveeuy_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
          refreshToken: 'liveeuy_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
        );
        await _storageService.saveUserSession(profile.toJson());
      } else {
        await _storageService.clearAuth();
      }
    }

    return true;
  }

  Future<bool> register(String name, String email, String password) async {
    await Future.delayed(const Duration(milliseconds: 700));
    // Pengguna baru terdaftar sebagai Member Standar (VIP dapat dibeli di halaman profil)
    final profile = UserProfile(
      name: name,
      email: email,
      avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: true,
      isVip: false,
      rememberMe: true,
    );

    state = profile;

    if (_storageService != null) {
      await _storageService.setRememberMe(true);
      await _storageService.saveAuthTokens(
        accessToken: 'liveeuy_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
        refreshToken: 'liveeuy_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
      );
      await _storageService.saveUserSession(profile.toJson());
    }

    return true;
  }

  void upgradeToVip() {
    state = state.copyWith(isVip: true);
    if (state.rememberMe && _storageService != null) {
      _storageService.saveUserSession(state.toJson());
    }
  }

  void logout() {
    state = UserProfile(
      name: state.name,
      email: state.email,
      avatarUrl: state.avatarUrl,
      isLoggedIn: false,
      isVip: false,
    );
    _storageService?.clearAuth();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, UserProfile>((ref) {
  LocalStorageService? storage;
  try {
    storage = ref.watch(localStorageServiceProvider);
  } catch (_) {}
  return AuthNotifier(storage);
});
