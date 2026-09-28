import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../core/storage/local_storage_service.dart';
import '../models/device_session_model.dart';

class UserProfile {
  final String name;
  final String email;
  final String avatarUrl;
  final bool isLoggedIn;
  final bool isVip;
  final bool rememberMe;
  final String deviceType;
  final String currentDeviceName;
  final List<DeviceSession> activeSessions;

  const UserProfile({
    required this.name,
    required this.email,
    required this.avatarUrl,
    required this.isLoggedIn,
    this.isVip = false,
    this.rememberMe = true,
    this.deviceType = 'Mobile',
    this.currentDeviceName = 'Smartphone (Android)',
    this.activeSessions = const [],
  });

  UserProfile copyWith({
    String? name,
    String? email,
    String? avatarUrl,
    bool? isLoggedIn,
    bool? isVip,
    bool? rememberMe,
    String? deviceType,
    String? currentDeviceName,
    List<DeviceSession>? activeSessions,
  }) {
    return UserProfile(
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isVip: isVip ?? this.isVip,
      rememberMe: rememberMe ?? this.rememberMe,
      deviceType: deviceType ?? this.deviceType,
      currentDeviceName: currentDeviceName ?? this.currentDeviceName,
      activeSessions: activeSessions ?? this.activeSessions,
    );
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    var rawSessions = json['activeSessions'];
    List<DeviceSession> parsedSessions = [];
    if (rawSessions is List) {
      parsedSessions = rawSessions
          .whereType<Map<String, dynamic>>()
          .map((m) => DeviceSession.fromJson(m))
          .toList();
    }
    return UserProfile(
      name: json['name'] as String? ?? 'User',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String? ??
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: json['isLoggedIn'] as bool? ?? false,
      isVip: json['isVip'] as bool? ?? false,
      rememberMe: json['rememberMe'] as bool? ?? true,
      deviceType: json['deviceType'] as String? ?? 'Mobile',
      currentDeviceName: json['currentDeviceName'] as String? ?? 'Smartphone (Android)',
      activeSessions: parsedSessions,
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
      'deviceType': deviceType,
      'currentDeviceName': currentDeviceName,
      'activeSessions': activeSessions.map((s) => s.toJson()).toList(),
    };
  }
}

class AuthNotifier extends StateNotifier<UserProfile> {
  final LocalStorageService? _storageService;
  final ApiClient _apiClient;

  AuthNotifier([this._storageService, ApiClient? apiClient])
      : _apiClient = apiClient ?? ApiClient(),
        super(const UserProfile(
          name: 'Hafiz Muhammad',
          email: 'hafiz@streamflix.id',
          avatarUrl:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: false,
          isVip: false,
          deviceType: 'Mobile',
          currentDeviceName: 'Smartphone (Android)',
          activeSessions: [],
        )) {
    _restoreSavedSession();
  }

  static List<DeviceSession> generateDefaultSessions({
    required String currentDeviceName,
  }) {
    return [
      DeviceSession(
        sessionId: 'sess-mob-current',
        deviceName: currentDeviceName,
        deviceType: DeviceType.mobile,
        os: 'Android 14',
        browserOrApp: 'LiveEuy Mobile App v2.4',
        ipAddress: '182.253.14.82',
        location: 'Jakarta Selatan, Indonesia',
        lastActive: 'Aktif Sekarang',
        isCurrentDevice: true,
      ),
      const DeviceSession(
        sessionId: 'sess-web-jkt-01',
        deviceName: 'Google Chrome (Windows 11)',
        deviceType: DeviceType.desktop,
        os: 'Windows 11 Pro',
        browserOrApp: 'Google Chrome v128',
        ipAddress: '180.252.164.218',
        location: 'Jakarta, Indonesia',
        lastActive: '15 menit yang lalu',
        isCurrentDevice: false,
      ),
      const DeviceSession(
        sessionId: 'sess-web-mac-02',
        deviceName: 'Apple Safari (macOS)',
        deviceType: DeviceType.desktop,
        os: 'macOS Sequoia',
        browserOrApp: 'Apple Safari 18.0',
        ipAddress: '114.124.201.45',
        location: 'Surabaya, Indonesia',
        lastActive: '1 jam yang lalu',
        isCurrentDevice: false,
      ),
    ];
  }

  Future<void> _restoreSavedSession() async {
    if (_storageService == null) return;
    try {
      final rememberMe = _storageService.getRememberMe();
      if (!rememberMe) return;

      final session = await _storageService.getUserSession();
      if (session != null) {
        state = UserProfile.fromJson(session);
        // Pastikan ada sesi perangkat aktif jika user logged in
        if (state.isLoggedIn && state.activeSessions.isEmpty) {
          state = state.copyWith(
            activeSessions: generateDefaultSessions(
              currentDeviceName: state.currentDeviceName,
            ),
          );
        }
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
    final deviceName = 'Smartphone (Android)';
    final sessions = generateDefaultSessions(currentDeviceName: deviceName);

    final profile = UserProfile(
      name: email.contains('@') ? email.split('@')[0].toUpperCase() : email,
      email: email,
      avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: true,
      isVip: isVipUser,
      rememberMe: rememberMe,
      deviceType: 'Mobile',
      currentDeviceName: deviceName,
      activeSessions: sessions,
    );

    state = profile;

    if (_storageService != null) {
      await _storageService.setRememberMe(rememberMe);
      if (rememberMe) {
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
    final deviceName = 'Smartphone (Android)';
    final sessions = [
      DeviceSession(
        sessionId: 'sess-mob-current',
        deviceName: deviceName,
        deviceType: DeviceType.mobile,
        os: 'Android 14',
        browserOrApp: 'LiveEuy Mobile App v2.4',
        ipAddress: '182.253.14.82',
        location: 'Jakarta Selatan, Indonesia',
        lastActive: 'Aktif Sekarang',
        isCurrentDevice: true,
      ),
    ];

    final profile = UserProfile(
      name: name,
      email: email,
      avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: true,
      isVip: false,
      rememberMe: true,
      deviceType: 'Mobile',
      currentDeviceName: deviceName,
      activeSessions: sessions,
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

  Future<bool> revokeDeviceSession(String sessionId) async {
    final sessionToRevoke = state.activeSessions.firstWhere(
      (s) => s.sessionId == sessionId,
      orElse: () => const DeviceSession(
        sessionId: '',
        deviceName: '',
        deviceType: DeviceType.desktop,
        os: '',
        browserOrApp: '',
        ipAddress: '',
        location: '',
        lastActive: '',
      ),
    );

    if (sessionToRevoke.isCurrentDevice || sessionToRevoke.sessionId == 'sess-mob-current') {
      logout();
      return true;
    }

    final updated = state.activeSessions.where((s) => s.sessionId != sessionId).toList();
    state = state.copyWith(activeSessions: updated);

    if (state.rememberMe && _storageService != null) {
      await _storageService.saveUserSession(state.toJson());
    }

    try {
      await _apiClient.delete(ApiConfig.revokeDevicePath(sessionId));
    } catch (_) {}

    return true;
  }

  Future<bool> logoutAllDevices({bool includeCurrent = false}) async {
    try {
      await _apiClient.post(
        ApiConfig.logoutAllPath,
        body: {'includeCurrent': includeCurrent},
      );
    } catch (_) {}

    if (includeCurrent) {
      logout();
      return true;
    }

    final remaining = state.activeSessions.where((s) => s.isCurrentDevice).toList();
    state = state.copyWith(activeSessions: remaining);

    if (state.rememberMe && _storageService != null) {
      await _storageService.saveUserSession(state.toJson());
    }

    return true;
  }

  void logout() {
    state = UserProfile(
      name: state.name,
      email: state.email,
      avatarUrl: state.avatarUrl,
      isLoggedIn: false,
      isVip: false,
      deviceType: 'Mobile',
      currentDeviceName: state.currentDeviceName,
      activeSessions: const [],
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

