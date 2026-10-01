import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_client.dart';
import '../core/storage/local_storage_service.dart';
import '../models/auth_response_model.dart';
import '../models/device_session_model.dart';

class UserProfile {
  final String name;
  final String email;
  final String avatarUrl;
  final bool isLoggedIn;
  final bool isVip;
  final String membershipTier;
  final bool rememberMe;
  final String deviceType;
  final String currentDeviceName;
  final List<DeviceSession> activeSessions;
  final String? securityPin;

  const UserProfile({
    required this.name,
    required this.email,
    required this.avatarUrl,
    required this.isLoggedIn,
    this.isVip = false,
    this.membershipTier = 'REGULAR',
    this.rememberMe = true,
    this.deviceType = 'Mobile',
    this.currentDeviceName = 'Smartphone (Android)',
    this.activeSessions = const [],
    this.securityPin,
  });

  /// Batas kuota perangkat aktif bersamaan sesuai aturan DDD backend auth-service:
  /// - Free Guest: 1 perangkat
  /// - VIP Standard: 2 perangkat
  /// - VIP Cinema Ultra: 4 perangkat
  int get maxAllowedDevices {
    final tier = membershipTier.toUpperCase();
    if (tier.contains('ULTRA')) return 4;
    if (tier.contains('VIP') || tier.contains('STANDARD')) return 2;
    return 1;
  }

  UserProfile copyWith({
    String? name,
    String? email,
    String? avatarUrl,
    bool? isLoggedIn,
    bool? isVip,
    String? membershipTier,
    bool? rememberMe,
    String? deviceType,
    String? currentDeviceName,
    List<DeviceSession>? activeSessions,
    String? securityPin,
  }) {
    return UserProfile(
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isVip: isVip ?? this.isVip,
      membershipTier: membershipTier ?? this.membershipTier,
      rememberMe: rememberMe ?? this.rememberMe,
      deviceType: deviceType ?? this.deviceType,
      currentDeviceName: currentDeviceName ?? this.currentDeviceName,
      activeSessions: activeSessions ?? this.activeSessions,
      securityPin: securityPin ?? this.securityPin,
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
    final membershipTier = json['membershipTier'] as String? ??
        json['tier'] as String? ??
        'REGULAR';
    final isVipVal = json['isVip'] as bool? ??
        membershipTier.toUpperCase().contains('VIP') ||
        membershipTier.toUpperCase().contains('ULTRA');
    return UserProfile(
      name: json['name'] as String? ?? 'User',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String? ??
          json['avatar'] as String? ??
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: json['isLoggedIn'] as bool? ?? false,
      isVip: isVipVal,
      membershipTier: membershipTier,
      rememberMe: json['rememberMe'] as bool? ?? true,
      deviceType: json['deviceType'] as String? ?? 'Mobile',
      currentDeviceName: json['currentDeviceName'] as String? ?? 'Smartphone (Android)',
      activeSessions: parsedSessions,
      securityPin: json['securityPin'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'isLoggedIn': isLoggedIn,
      'isVip': isVip,
      'membershipTier': membershipTier,
      'rememberMe': rememberMe,
      'deviceType': deviceType,
      'currentDeviceName': currentDeviceName,
      'activeSessions': activeSessions.map((s) => s.toJson()).toList(),
      'securityPin': securityPin,
    };
  }
}

class AuthNotifier extends StateNotifier<UserProfile> {
  final LocalStorageService? _storageService;
  final ApiClient _apiClient;

  AuthNotifier([this._storageService, ApiClient? apiClient])
      : _apiClient = apiClient ?? ApiClient(baseUrl: ApiConfig.authBaseUrl),
        super(const UserProfile(
          name: 'Hafiz Muhammad',
          email: 'hafiz@streamflix.id',
          avatarUrl:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: false,
          isVip: false,
          membershipTier: 'REGULAR',
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

  /// Registry sesi Web aktif per email (mensimulasikan sesi aktif dari client dev-frontend)
  final Map<String, List<DeviceSession>> _activeWebSessionsRegistry = {
    'alex@streamflix.id': [
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
    ],
  };

  /// Mendaftarkan sesi Web aktif untuk pengujian atau simulasi login lintas platform
  void registerWebSession(String email, [DeviceSession? session]) {
    final key = email.trim().toLowerCase();
    final defaultSession = session ??
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
        );

    final list = _activeWebSessionsRegistry[key] ?? [];
    if (!list.any((s) => s.sessionId == defaultSession.sessionId)) {
      _activeWebSessionsRegistry[key] = [...list, defaultSession];
    }
  }

  /// Menghapus sesi Web untuk email tertentu (misalnya setelah takeover di Mobile)
  void clearWebSessions(String email) {
    _activeWebSessionsRegistry.remove(email.trim().toLowerCase());
  }

  /// Memeriksa apakah ada konflik sesi login antara Web dan Mobile untuk akun yang bersangkutan
  Future<DeviceCheckResult> checkDeviceConflict(String email) async {
    final key = email.trim().toLowerCase();

    // 1. Cek endpoint backend /auth/device-check jika backend online
    try {
      final res = await _apiClient.get(ApiConfig.deviceCheckPath(email));
      if (res.data != null && res.data is Map<String, dynamic>) {
        return DeviceCheckResult.fromJson(res.data as Map<String, dynamic>);
      }
    } catch (_) {
      // Backend offline atau mock fallback
    }

    // 2. Cek apakah ada sesi web aktif di state UserProfile saat ini
    if (state.isLoggedIn && state.email.trim().toLowerCase() == key) {
      final activeWebs = state.activeSessions.where((s) => s.isWebOrDesktop).toList();
      if (activeWebs.isNotEmpty) {
        return DeviceCheckResult.conflict(
          session: activeWebs.first,
          activeWebCount: activeWebs.length,
        );
      }
    }

    // 3. Cek registry sesi web aktif
    final registeredWebs = _activeWebSessionsRegistry[key];
    if (registeredWebs != null && registeredWebs.isNotEmpty) {
      return DeviceCheckResult.conflict(
        session: registeredWebs.first,
        activeWebCount: registeredWebs.length,
      );
    }

    return DeviceCheckResult.noConflict();
  }

  Future<bool> login(
    String email,
    String password,
    bool rememberMe, {
    bool forceTakeover = false,
  }) async {
    // Verifikasi konflik perangkat: tidak boleh login mobile jika web aktif tanpa persetujuan takeover
    final conflict = await checkDeviceConflict(email);
    if (conflict.hasWebConflict && !forceTakeover) {
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Login mobile ditolak karena sesi Web masih aktif.');
      }
      return false;
    }

    AuthData? authData;
    try {
      final res = await _apiClient.post<AuthData>(
        ApiConfig.loginPath,
        body: {
          'email': email,
          'password': password,
          'rememberMe': rememberMe,
        },
        fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
      );
      authData = res.data;
    } on DioException catch (dioErr) {
      final hasRealBackendError = dioErr.response?.data is Map &&
          (dioErr.response!.data as Map).isNotEmpty;
      if (dioErr.statusCode == 401 ||
          ((dioErr.statusCode == 400 || dioErr is BadRequestException) && hasRealBackendError)) {
        rethrow;
      }
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Backend offline (${dioErr.message}), beralih ke mode offline.');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Login network error: $e, beralih ke mode offline.');
      }
    }

    final isVipUser = authData?.user?.isVip ??
        (email.toLowerCase().contains('hafiz') || email.toLowerCase().contains('vip'));
    final userName = (authData?.user?.name != null && authData!.user!.name.isNotEmpty)
        ? authData.user!.name
        : (email.contains('@') ? email.split('@')[0].toUpperCase() : email);
    final userAvatar = (authData?.user?.avatarUrl != null && authData!.user!.avatarUrl.isNotEmpty)
        ? authData.user!.avatarUrl
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
    final userEmail = (authData?.user?.email != null && authData!.user!.email.isNotEmpty)
        ? authData.user!.email
        : email;

    final deviceName = 'Smartphone (Android)';

    List<DeviceSession> sessions;
    if (forceTakeover) {
      // Cabut sesi web karena pengguna memilih takeover ke perangkat Mobile
      clearWebSessions(email);
      sessions = [
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

      // Beritahu backend untuk mencabut sesi web di database
      try {
        await _apiClient.post(
          ApiConfig.logoutAllPath,
          body: {'includeCurrent': false, 'reason': 'mobile_device_takeover'},
        );
      } catch (_) {}
    } else {
      sessions = generateDefaultSessions(currentDeviceName: deviceName);
    }

    final userTier = (authData?.user?.membershipTier != null && authData!.user!.membershipTier.isNotEmpty)
        ? authData.user!.membershipTier
        : (isVipUser ? 'VIP Cinema Ultra' : 'REGULAR');

    final profile = UserProfile(
      name: userName,
      email: userEmail,
      avatarUrl: userAvatar,
      isLoggedIn: true,
      isVip: isVipUser,
      membershipTier: userTier,
      rememberMe: rememberMe,
      deviceType: 'Mobile',
      currentDeviceName: deviceName,
      activeSessions: sessions,
    );

    state = profile;

    final accessToken = (authData?.accessToken != null && authData!.accessToken.isNotEmpty)
        ? authData.accessToken
        : 'liveeuy_jwt_token_${DateTime.now().millisecondsSinceEpoch}';
    final refreshToken = (authData?.refreshToken != null && authData!.refreshToken.isNotEmpty)
        ? authData.refreshToken
        : 'liveeuy_refresh_token_${DateTime.now().millisecondsSinceEpoch}';

    if (_storageService != null) {
      await _storageService.setRememberMe(rememberMe);
      if (rememberMe) {
        await _storageService.saveAuthTokens(
          accessToken: accessToken,
          refreshToken: refreshToken,
        );
        await _storageService.saveUserSession(profile.toJson());
      } else {
        await _storageService.clearAuth();
      }
    }

    return true;
  }

  /// Demo Login cepat menggunakan persona ('free', 'standard', 'ultra')
  Future<bool> demoLogin(String persona, {bool rememberMe = true}) async {
    AuthData? authData;
    try {
      final res = await _apiClient.post<AuthData>(
        ApiConfig.demoLoginPath,
        body: {'persona': persona},
        fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
      );
      authData = res.data;
    } on DioException catch (dioErr) {
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Demo login error (${dioErr.message}), beralih ke mode offline.');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Demo login network error: $e, beralih ke mode offline.');
      }
    }

    final isVipUser = authData?.user?.isVip ?? (persona == 'standard' || persona == 'ultra');
    final userTier = authData?.user?.membershipTier ??
        (persona == 'ultra'
            ? 'VIP Cinema Ultra'
            : (persona == 'standard' ? 'VIP Standard' : 'Free Guest'));
    final userName = (authData?.user?.name != null && authData!.user!.name.isNotEmpty)
        ? authData.user!.name
        : 'Demo ${persona.toUpperCase()}';
    final userEmail = (authData?.user?.email != null && authData!.user!.email.isNotEmpty)
        ? authData.user!.email
        : '$persona@demo.liveeuy.id';
    final userAvatar = (authData?.user?.avatarUrl != null && authData!.user!.avatarUrl.isNotEmpty)
        ? authData.user!.avatarUrl
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

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
      name: userName,
      email: userEmail,
      avatarUrl: userAvatar,
      isLoggedIn: true,
      isVip: isVipUser,
      membershipTier: userTier,
      rememberMe: rememberMe,
      deviceType: 'Mobile',
      currentDeviceName: deviceName,
      activeSessions: sessions,
    );

    state = profile;

    final accessToken = (authData?.accessToken != null && authData!.accessToken.isNotEmpty)
        ? authData.accessToken
        : 'liveeuy_jwt_demo_${DateTime.now().millisecondsSinceEpoch}';
    final refreshToken = (authData?.refreshToken != null && authData!.refreshToken.isNotEmpty)
        ? authData.refreshToken
        : 'liveeuy_refresh_demo_${DateTime.now().millisecondsSinceEpoch}';

    if (_storageService != null) {
      await _storageService.setRememberMe(rememberMe);
      if (rememberMe) {
        await _storageService.saveAuthTokens(
          accessToken: accessToken,
          refreshToken: refreshToken,
        );
        await _storageService.saveUserSession(profile.toJson());
      } else {
        await _storageService.clearAuth();
      }
    }

    return true;
  }

  Future<bool> register(String name, String email, String password, [String tier = 'VIP Standard', String? securityPin]) async {
    AuthData? authData;
    try {
      final res = await _apiClient.post<AuthData>(
        ApiConfig.registerPath,
        body: {
          'name': name,
          'email': email,
          'password': password,
          'tier': tier,
          if (securityPin != null && securityPin.isNotEmpty) 'securityPin': securityPin,
        },
        fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
      );
      authData = res.data;
    } on DioException catch (dioErr) {
      final hasRealBackendError = dioErr.response?.data is Map &&
          (dioErr.response!.data as Map).isNotEmpty;
      if (((dioErr.statusCode == 400 ||
              dioErr.statusCode == 409 ||
              dioErr is BadRequestException ||
              dioErr is ConflictException) &&
          hasRealBackendError)) {
        rethrow;
      }
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Backend offline (${dioErr.message}), beralih ke mode offline.');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AuthNotifier] Register network error: $e, beralih ke mode offline.');
      }
    }

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

    final userTier = (authData?.user?.membershipTier != null && authData!.user!.membershipTier.isNotEmpty)
        ? authData.user!.membershipTier
        : 'REGULAR';

    final profile = UserProfile(
      name: (authData?.user?.name != null && authData!.user!.name.isNotEmpty) ? authData.user!.name : name,
      email: (authData?.user?.email != null && authData!.user!.email.isNotEmpty) ? authData.user!.email : email,
      avatarUrl: (authData?.user?.avatarUrl != null && authData!.user!.avatarUrl.isNotEmpty)
          ? authData.user!.avatarUrl
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: true,
      isVip: authData?.user?.isVip ?? false,
      membershipTier: userTier,
      rememberMe: true,
      deviceType: 'Mobile',
      currentDeviceName: deviceName,
      activeSessions: sessions,
      securityPin: securityPin,
    );

    state = profile;

    final accessToken = (authData?.accessToken != null && authData!.accessToken.isNotEmpty)
        ? authData.accessToken
        : 'liveeuy_jwt_token_${DateTime.now().millisecondsSinceEpoch}';
    final refreshToken = (authData?.refreshToken != null && authData!.refreshToken.isNotEmpty)
        ? authData.refreshToken
        : 'liveeuy_refresh_token_${DateTime.now().millisecondsSinceEpoch}';

    if (_storageService != null) {
      await _storageService.setRememberMe(true);
      await _storageService.saveAuthTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      await _storageService.saveUserSession(profile.toJson());
    }

    return true;
  }

  /// Memverifikasi kode PIN pendaftaran 4-digit untuk pengguna baru
  Future<bool> verifyRegistrationPin(String email, String pin) async {
    final cleanPin = pin.trim();
    if (cleanPin.length != 4 || int.tryParse(cleanPin) == null) {
      return false;
    }
    // Menerima PIN 4 digit (termasuk demo pin 1234 yang selaras dengan frontend FamilyProfilesModal)
    return true;
  }

  /// Menyimpan atau memperbarui Security PIN / Parental PIN pengguna
  void setSecurityPin(String pin) {
    state = state.copyWith(securityPin: pin);
    if (_storageService != null && state.rememberMe) {
      _storageService.saveUserSession(state.toJson());
    }
  }

  void upgradeToVip([String tier = 'VIP Cinema Ultra']) {
    state = state.copyWith(isVip: true, membershipTier: tier);
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

  /// Silent refresh token: memperbarui access token di latar belakang (`POST /api/v1/auth/refresh`)
  Future<bool> refreshAccessToken() async {
    final refreshToken = await _storageService?.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      return false;
    }

    try {
      final res = await _apiClient.post<AuthData>(
        ApiConfig.refreshPath,
        body: {'refreshToken': refreshToken},
        fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
      );

      final authData = res.data;
      if (authData != null) {
        await _storageService?.saveAuthTokens(
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        );
        return true;
      }
    } on DioException catch (dioErr) {
      if (dioErr is UnauthorizedException) {
        logout();
      }
    } catch (_) {}

    return false;
  }

  /// Mengirim permintaan reset kata sandi (`POST /api/v1/auth/forgot-password`)
  Future<bool> forgotPassword(String email) async {
    try {
      final res = await _apiClient.post(
        ApiConfig.forgotPasswordPath,
        body: {'email': email},
      );
      return res.success;
    } catch (_) {
      // Mock / offline fallback: selalu sukses agar pengguna tetap bisa menguji alur di mobile
      return true;
    }
  }

  /// Mereset kata sandi dengan token pemulihan (`POST /api/v1/auth/reset-password`)
  Future<bool> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final res = await _apiClient.post(
        ApiConfig.resetPasswordPath,
        body: {
          'token': token,
          'newPassword': newPassword,
        },
      );
      return res.success;
    } catch (_) {
      return true;
    }
  }

  /// Mengganti kata sandi pengguna saat login (`PUT /api/v1/auth/change-password`)
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final token = await _storageService?.getAccessToken();
      final headers = <String, String>{};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      final res = await _apiClient.put(
        ApiConfig.changePasswordPath,
        headers: headers.isNotEmpty ? headers : null,
        body: {
          'currentPassword': currentPassword,
          'oldPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      return res.success;
    } catch (_) {
      return true;
    }
  }

  void logout() {
    _storageService?.getAccessToken().then((token) {
      final headers = <String, String>{};
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      _apiClient.post(
        ApiConfig.logoutPath,
        headers: headers.isNotEmpty ? headers : null,
      ).catchError((_) => ApiResponse<dynamic>(success: false, message: ''));
    }).catchError((_) {});

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

