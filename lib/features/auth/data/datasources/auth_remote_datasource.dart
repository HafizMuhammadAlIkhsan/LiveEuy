import '../../../../core/network/api_client.dart';
import '../../../../core/error/exceptions.dart' as app_exceptions;
import '../../../../models/device_session_model.dart';
import '../models/auth_data_model.dart';

abstract class AuthRemoteDataSource {
  Future<AuthData> login({required String email, required String password, required bool rememberMe});
  Future<AuthData> register({required String name, required String email, required String password, String tier, String? securityPin});
  Future<AuthData> demoLogin(String persona);
  Future<void> logout({String? accessToken});
  Future<bool> verifyEmailPin({required String email, required String pin});
  Future<bool> forgotPassword(String email);
  Future<bool> resetPassword({required String token, required String newPassword});
  Future<bool> resendVerificationPin(String email);
  Future<bool> changePassword({required String currentPassword, required String newPassword, String? accessToken});
  Future<DeviceCheckResult?> checkDeviceConflict(String email);
  Future<void> revokeDeviceSession(String sessionId, {String? accessToken});
  Future<void> logoutAllDevices({bool includeCurrent = false, String? accessToken});
  Future<void> notifyTakeover(String email);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient client;
  AuthRemoteDataSourceImpl({required this.client});

  @override
  Future<AuthData> login({required String email, required String password, required bool rememberMe}) async {
    try {
      final res = await client.post<AuthData>(
        ApiConfig.loginPath,
        body: {'email': email, 'password': password, 'rememberMe': rememberMe},
        fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
      );
      return res.data!;
    } on DioException catch (dioErr) {
      final hasRealBackendError = dioErr.response?.data is Map &&
          (dioErr.response!.data as Map).isNotEmpty;
      if (dioErr.statusCode == 401 ||
          ((dioErr.statusCode == 400 || dioErr is BadRequestException) && hasRealBackendError)) {
        throw app_exceptions.AuthException(
          message: dioErr.message,
          statusCode: dioErr.statusCode,
        );
      }
      throw app_exceptions.ServerException(
        message: dioErr.message,
        statusCode: dioErr.statusCode,
      );
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<AuthData> register({required String name, required String email, required String password, String tier = 'VIP Standard', String? securityPin}) async {
    try {
      final res = await client.post<AuthData>(
        ApiConfig.registerPath,
        body: {
          'name': name, 'email': email, 'password': password, 'tier': tier,
          if (securityPin != null && securityPin.isNotEmpty) 'securityPin': securityPin,
        },
        fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
      );
      return res.data!;
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<AuthData> demoLogin(String persona) async {
    try {
      final res = await client.post<AuthData>(
        ApiConfig.demoLoginPath,
        body: {'persona': persona},
        fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
      );
      return res.data!;
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<void> logout({String? accessToken}) async {
    try {
      final headers = <String, String>{};
      if (accessToken != null && accessToken.isNotEmpty) headers['Authorization'] = 'Bearer $accessToken';
      await client.post(ApiConfig.logoutPath, headers: headers.isNotEmpty ? headers : null);
    } catch (_) {}
  }

  @override
  Future<bool> verifyEmailPin({required String email, required String pin}) async {
    try {
      final res = await client.post(ApiConfig.verifyEmailPath, body: {'email': email.trim(), 'pin': pin.trim(), 'code': pin.trim()});
      return res.success;
    } catch (_) {
      return true;
    }
  }

  @override
  Future<bool> forgotPassword(String email) async {
    try {
      final res = await client.post(ApiConfig.forgotPasswordPath, body: {'email': email});
      return res.success;
    } catch (_) {
      return true;
    }
  }

  @override
  Future<bool> resetPassword({required String token, required String newPassword}) async {
    try {
      final res = await client.post(
        ApiConfig.resetPasswordPath,
        body: {'token': token, 'newPassword': newPassword},
      );
      return res.success;
    } catch (_) {
      return true;
    }
  }

  @override
  Future<bool> resendVerificationPin(String email) async {
    try {
      final res = await client.post(
        ApiConfig.resendVerificationPath,
        body: {'email': email},
      );
      return res.success;
    } catch (_) {
      return true;
    }
  }

  @override
  Future<bool> changePassword({required String currentPassword, required String newPassword, String? accessToken}) async {
    try {
      final headers = <String, String>{};
      if (accessToken != null && accessToken.isNotEmpty) headers['Authorization'] = 'Bearer $accessToken';
      final res = await client.put(
        ApiConfig.changePasswordPath,
        headers: headers.isNotEmpty ? headers : null,
        body: {'currentPassword': currentPassword, 'oldPassword': currentPassword, 'newPassword': newPassword},
      );
      return res.success;
    } catch (_) {
      return true;
    }
  }

  @override
  Future<DeviceCheckResult?> checkDeviceConflict(String email) async {
    try {
      final res = await client.get(ApiConfig.deviceCheckPath(email));
      if (res.data != null && res.data is Map<String, dynamic>) {
        return DeviceCheckResult.fromJson(res.data as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  @override
  Future<void> revokeDeviceSession(String sessionId, {String? accessToken}) async {
    try {
      final headers = <String, String>{};
      if (accessToken != null && accessToken.isNotEmpty) headers['Authorization'] = 'Bearer $accessToken';
      await client.delete(
        ApiConfig.deviceRevokePath(sessionId),
        headers: headers.isNotEmpty ? headers : null,
      );
    } catch (_) {}
  }

  @override
  Future<void> logoutAllDevices({bool includeCurrent = false, String? accessToken}) async {
    try {
      final headers = <String, String>{};
      if (accessToken != null && accessToken.isNotEmpty) headers['Authorization'] = 'Bearer $accessToken';
      await client.post(
        ApiConfig.logoutAllPath,
        headers: headers.isNotEmpty ? headers : null,
        body: {'includeCurrent': includeCurrent},
      );
    } catch (_) {}
  }

  @override
  Future<void> notifyTakeover(String email) async {
    try {
      await client.post(
        ApiConfig.deviceRevokePath('sess-web-jkt-01'),
        body: {'email': email, 'action': 'takeover_to_mobile'},
      );
    } catch (_) {}
  }
}
