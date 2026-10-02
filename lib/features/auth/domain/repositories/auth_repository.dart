import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../models/device_session_model.dart';
import '../entities/user_entity.dart';


abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
    required bool rememberMe,
    bool forceTakeover = false,
  });

  Future<Either<Failure, UserEntity>> register({
    required String name,
    required String email,
    required String password,
    String tier = 'VIP Standard',
    String? securityPin,
  });

  Future<Either<Failure, UserEntity>> demoLogin({
    required String persona,
    bool rememberMe = true,
  });

  Future<Either<Failure, void>> logout();

  Future<Either<Failure, UserEntity>> upgradeToVip({String tier = 'VIP Cinema Ultra'});

  Future<Either<Failure, bool>> verifyEmailPin({required String email, required String pin});

  Future<Either<Failure, bool>> forgotPassword({required String email});

  Future<Either<Failure, bool>> changePassword({required String currentPassword, required String newPassword});

  Future<Either<Failure, bool>> resetPassword({required String token, required String newPassword});

  Future<Either<Failure, bool>> resendVerificationPin(String email);

  Future<Either<Failure, DeviceCheckResult>> checkDeviceConflict(String email);

  Future<Either<Failure, void>> revokeDeviceSession(String sessionId);

  Future<Either<Failure, void>> logoutAllDevices({bool includeCurrent = false});

  Future<Either<Failure, UserEntity?>> restoreSession();
}

