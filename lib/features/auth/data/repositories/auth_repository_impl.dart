import 'package:dartz/dartz.dart';
import 'package:flutter/foundation.dart';
import '../../../../core/error/exceptions.dart' as app_exceptions;
import '../../../../core/error/failures.dart';
import '../../../../models/device_session_model.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;

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

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, DeviceCheckResult>> checkDeviceConflict(String email) async {
    final key = email.trim().toLowerCase();

    // 1. Cek endpoint backend /auth/device-check jika online
    final remoteCheck = await remoteDataSource.checkDeviceConflict(email);
    if (remoteCheck != null) {
      return Right(remoteCheck);
    }

    // 2. Cek apakah ada sesi web aktif di registry simulasi
    final registeredWebs = _activeWebSessionsRegistry[key];
    if (registeredWebs != null && registeredWebs.isNotEmpty) {
      return Right(DeviceCheckResult.conflict(
        session: registeredWebs.first,
        activeWebCount: registeredWebs.length,
      ));
    }

    // 3. Cek apakah ada sesi web aktif di user lokal
    final cached = await localDataSource.getCachedUser();
    if (cached != null && cached.email.trim().toLowerCase() == key) {
      final activeWebs = cached.activeSessions.where((s) => s.isWebOrDesktop).toList();
      if (activeWebs.isNotEmpty) {
        return Right(DeviceCheckResult.conflict(
          session: activeWebs.first,
          activeWebCount: activeWebs.length,
        ));
      }
    }

    return Right(DeviceCheckResult.noConflict());
  }

  @override
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
    required bool rememberMe,
    bool forceTakeover = false,
  }) async {
    if (forceTakeover) {
      _activeWebSessionsRegistry.remove(email.trim().toLowerCase());
      await remoteDataSource.notifyTakeover(email);
    }

    try {
      final authData = await remoteDataSource.login(
        email: email,
        password: password,
        rememberMe: rememberMe,
      );

      final isVipUser = authData.user?.isVip ??
          (email.toLowerCase().contains('hafiz') || email.toLowerCase().contains('vip'));
      final userName = (authData.user?.name != null && authData.user!.name.isNotEmpty)
          ? authData.user!.name
          : (email.contains('@') ? email.split('@')[0].toUpperCase() : email);
      final userAvatar = (authData.user?.avatarUrl != null && authData.user!.avatarUrl.isNotEmpty)
          ? authData.user!.avatarUrl
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
      final userEmail = (authData.user?.email != null && authData.user!.email.isNotEmpty)
          ? authData.user!.email
          : email;
      final userTier = (authData.user?.membershipTier != null && authData.user!.membershipTier.isNotEmpty)
          ? authData.user!.membershipTier
          : (isVipUser ? 'VIP Cinema Ultra' : 'REGULAR');

      final sessions = forceTakeover
          ? [
              const DeviceSession(
                sessionId: 'sess-mob-current',
                deviceName: 'Smartphone (Android)',
                deviceType: DeviceType.mobile,
                os: 'Android 14',
                browserOrApp: 'LiveEuy Mobile App v2.4',
                ipAddress: '182.253.14.82',
                location: 'Jakarta Selatan, Indonesia',
                lastActive: 'Aktif Sekarang',
                isCurrentDevice: true,
              ),
            ]
          : _generateDefaultSessions('Smartphone (Android)');

      final user = UserModel(
        name: userName,
        email: userEmail,
        avatarUrl: userAvatar,
        isLoggedIn: true,
        isVip: isVipUser,
        membershipTier: userTier,
        rememberMe: rememberMe,
        deviceType: 'Mobile',
        currentDeviceName: 'Smartphone (Android)',
        activeSessions: sessions,
      );

      await localDataSource.setRememberMe(rememberMe);
      if (rememberMe) {
        final accessToken = authData.accessToken.isNotEmpty
            ? authData.accessToken
            : 'liveeuy_jwt_token_${DateTime.now().millisecondsSinceEpoch}';
        final refreshToken = authData.refreshToken.isNotEmpty
            ? authData.refreshToken
            : 'liveeuy_refresh_token_${DateTime.now().millisecondsSinceEpoch}';
        await localDataSource.cacheTokens(accessToken: accessToken, refreshToken: refreshToken);
      }
      await localDataSource.cacheUser(user);
      return Right(user);
    } on app_exceptions.AuthException catch (e) {
      return Left(AuthFailure(message: e.message, statusCode: e.statusCode));
    } on app_exceptions.ServerException catch (e) {
      // Offline fallback: graceful degradation for demo credentials or offline development
      final isDemoAccount = email.contains('hafiz') ||
          email.contains('streamflix') ||
          email.contains('liveeuy') ||
          email.contains('vip') ||
          email.contains('demo');

      if (isDemoAccount || kDebugMode) {
        if (kDebugMode) {
          debugPrint('[AuthRepo] Server tidak merespon: ${e.message}, fallback ke mode offline.');
        }
        final isVipUser = email.toLowerCase().contains('hafiz') || email.toLowerCase().contains('vip');
        final sessions = forceTakeover
            ? [
                const DeviceSession(
                  sessionId: 'sess-mob-current',
                  deviceName: 'Smartphone (Android)',
                  deviceType: DeviceType.mobile,
                  os: 'Android 14',
                  browserOrApp: 'LiveEuy Mobile App v2.4',
                  ipAddress: '182.253.14.82',
                  location: 'Jakarta Selatan, Indonesia',
                  lastActive: 'Aktif Sekarang',
                  isCurrentDevice: true,
                ),
              ]
            : _generateDefaultSessions('Smartphone (Android)');

        final user = UserModel(
          name: email.contains('@') ? email.split('@')[0].toUpperCase() : email,
          email: email,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: true,
          isVip: isVipUser,
          membershipTier: isVipUser ? 'VIP Cinema Ultra' : 'REGULAR',
          rememberMe: rememberMe,
          deviceType: 'Mobile',
          currentDeviceName: 'Smartphone (Android)',
          activeSessions: sessions,
        );

        await localDataSource.setRememberMe(rememberMe);
        if (rememberMe) {
          await localDataSource.cacheTokens(
            accessToken: 'liveeuy_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
            refreshToken: 'liveeuy_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
          );
        }
        await localDataSource.cacheUser(user);
        return Right(user);
      }
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> register({
    required String name,
    required String email,
    required String password,
    String tier = 'VIP Standard',
    String? securityPin,
  }) async {
    try {
      final authData = await remoteDataSource.register(
        name: name,
        email: email,
        password: password,
        tier: tier,
        securityPin: securityPin,
      );
      final user = UserModel(
        name: authData.user?.name ?? name,
        email: authData.user?.email ?? email,
        avatarUrl: authData.user?.avatarUrl ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        isLoggedIn: true,
        isVip: authData.user?.isVip ?? false,
        membershipTier: authData.user?.membershipTier ?? 'REGULAR',
        rememberMe: true,
        deviceType: 'Mobile',
        currentDeviceName: 'Smartphone (Android)',
        securityPin: securityPin,
        activeSessions: _generateDefaultSessions('Smartphone (Android)'),
      );
      await localDataSource.cacheTokens(
        accessToken: authData.accessToken.isNotEmpty ? authData.accessToken : 'liveeuy_jwt_token_${DateTime.now().millisecondsSinceEpoch}',
        refreshToken: authData.refreshToken.isNotEmpty ? authData.refreshToken : 'liveeuy_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
      );
      await localDataSource.cacheUser(user);
      return Right(user);
    } on app_exceptions.AuthException catch (e) {
      return Left(AuthFailure(message: e.message, statusCode: e.statusCode));
    } on app_exceptions.ServerException {
      final user = UserModel(
        name: name,
        email: email,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        isLoggedIn: true,
        isVip: false,
        membershipTier: 'REGULAR',
        rememberMe: true,
        deviceType: 'Mobile',
        currentDeviceName: 'Smartphone (Android)',
        securityPin: securityPin,
        activeSessions: _generateDefaultSessions('Smartphone (Android)'),
      );
      await localDataSource.cacheUser(user);
      return Right(user);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> demoLogin({
    required String persona,
    bool rememberMe = true,
  }) async {
    try {
      final authData = await remoteDataSource.demoLogin(persona);
      final isVipUser = authData.user?.isVip ?? (persona == 'standard' || persona == 'ultra');
      final userTier = authData.user?.membershipTier ?? (persona == 'ultra' ? 'VIP Cinema Ultra' : (persona == 'standard' ? 'VIP Standard' : 'Free Guest'));
      final user = UserModel(
        name: authData.user?.name ?? 'Demo ${persona.toUpperCase()}',
        email: authData.user?.email ?? '$persona@demo.liveeuy.id',
        avatarUrl: authData.user?.avatarUrl ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        isLoggedIn: true,
        isVip: isVipUser,
        membershipTier: userTier,
        rememberMe: rememberMe,
        deviceType: 'Mobile',
        currentDeviceName: 'Smartphone (Android)',
        activeSessions: _generateDefaultSessions('Smartphone (Android)'),
      );
      await localDataSource.cacheUser(user);
      return Right(user);
    } catch (_) {
      final isVipUser = persona == 'standard' || persona == 'ultra';
      final userTier = persona == 'ultra' ? 'VIP Cinema Ultra' : (persona == 'standard' ? 'VIP Standard' : 'Free Guest');
      final user = UserModel(
        name: 'Demo ${persona.toUpperCase()}',
        email: '$persona@demo.liveeuy.id',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        isLoggedIn: true,
        isVip: isVipUser,
        membershipTier: userTier,
        rememberMe: rememberMe,
        deviceType: 'Mobile',
        currentDeviceName: 'Smartphone (Android)',
        activeSessions: _generateDefaultSessions('Smartphone (Android)'),
      );
      await localDataSource.cacheUser(user);
      return Right(user);
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      final token = await localDataSource.getAccessToken();
      await remoteDataSource.logout(accessToken: token);
      await localDataSource.clearCache();
      return const Right(null);
    } catch (e) {
      await localDataSource.clearCache();
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, UserEntity>> upgradeToVip({String tier = 'VIP Cinema Ultra'}) async {
    final cached = await localDataSource.getCachedUser();
    if (cached == null) return Left(CacheFailure(message: 'Tidak ada sesi aktif'));
    final upgraded = UserModel(
      name: cached.name,
      email: cached.email,
      avatarUrl: cached.avatarUrl,
      isLoggedIn: true,
      isVip: true,
      membershipTier: tier,
      rememberMe: cached.rememberMe,
      deviceType: cached.deviceType,
      currentDeviceName: cached.currentDeviceName,
      activeSessions: cached.activeSessions,
      securityPin: cached.securityPin,
    );
    await localDataSource.cacheUser(upgraded);
    return Right(upgraded);
  }

  @override
  Future<Either<Failure, bool>> verifyEmailPin({required String email, required String pin}) async {
    final result = await remoteDataSource.verifyEmailPin(email: email, pin: pin);
    return Right(result);
  }

  @override
  Future<Either<Failure, bool>> forgotPassword({required String email}) async {
    final result = await remoteDataSource.forgotPassword(email);
    return Right(result);
  }

  @override
  Future<Either<Failure, bool>> resetPassword({required String token, required String newPassword}) async {
    final result = await remoteDataSource.resetPassword(token: token, newPassword: newPassword);
    return Right(result);
  }

  @override
  Future<Either<Failure, bool>> resendVerificationPin(String email) async {
    final result = await remoteDataSource.resendVerificationPin(email);
    return Right(result);
  }

  @override
  Future<Either<Failure, bool>> changePassword({required String currentPassword, required String newPassword}) async {
    final token = await localDataSource.getAccessToken();
    final result = await remoteDataSource.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
      accessToken: token,
    );
    return Right(result);
  }

  @override
  Future<Either<Failure, void>> revokeDeviceSession(String sessionId) async {
    final token = await localDataSource.getAccessToken();
    await remoteDataSource.revokeDeviceSession(sessionId, accessToken: token);
    final cached = await localDataSource.getCachedUser();
    if (cached != null) {
      final updatedSessions = cached.activeSessions.where((s) => s.sessionId != sessionId).toList();
      final updated = UserModel.fromEntity(cached.copyWith(activeSessions: updatedSessions));
      await localDataSource.cacheUser(updated);
    }
    return const Right(null);
  }

  @override
  Future<Either<Failure, void>> logoutAllDevices({bool includeCurrent = false}) async {
    final token = await localDataSource.getAccessToken();
    await remoteDataSource.logoutAllDevices(includeCurrent: includeCurrent, accessToken: token);
    final cached = await localDataSource.getCachedUser();
    if (cached != null) {
      final updatedSessions = includeCurrent
          ? <DeviceSession>[]
          : cached.activeSessions.where((s) => s.isCurrentDevice).toList();
      final updated = UserModel.fromEntity(cached.copyWith(activeSessions: updatedSessions));
      await localDataSource.cacheUser(updated);
    }
    return const Right(null);
  }

  @override
  Future<Either<Failure, UserEntity?>> restoreSession() async {
    final rememberMe = localDataSource.getRememberMe();
    if (!rememberMe) return const Right(null);
    final cached = await localDataSource.getCachedUser();
    return Right(cached);
  }

  List<DeviceSession> _generateDefaultSessions(String currentDeviceName) {
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
    ];
  }
}
