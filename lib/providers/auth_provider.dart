import 'package:flutter_riverpod/flutter_riverpod.dart';

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
}

class AuthNotifier extends StateNotifier<UserProfile> {
  AuthNotifier()
      : super(const UserProfile(
          name: 'Hafiz Muhammad',
          email: 'hafiz@streamflix.id',
          avatarUrl:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: false,
          isVip: false,
        ));

  Future<bool> login(String email, String password, bool rememberMe) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final isVipUser = email.toLowerCase().contains('hafiz') || email.toLowerCase().contains('vip');
    state = UserProfile(
      name: email.contains('@') ? email.split('@')[0].toUpperCase() : email,
      email: email,
      avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: true,
      isVip: isVipUser,
      rememberMe: rememberMe,
    );
    return true;
  }

  Future<bool> register(String name, String email, String password) async {
    await Future.delayed(const Duration(milliseconds: 700));
    // Pengguna baru terdaftar sebagai Member Standar (VIP dapat dibeli di halaman profil)
    state = UserProfile(
      name: name,
      email: email,
      avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: true,
      isVip: false,
      rememberMe: true,
    );
    return true;
  }

  void upgradeToVip() {
    state = state.copyWith(isVip: true);
  }

  void logout() {
    state = UserProfile(
      name: state.name,
      email: state.email,
      avatarUrl: state.avatarUrl,
      isLoggedIn: false,
      isVip: false,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, UserProfile>((ref) {
  return AuthNotifier();
});
