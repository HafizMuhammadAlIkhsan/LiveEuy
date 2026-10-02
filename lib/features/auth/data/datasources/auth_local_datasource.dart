import '../../../../core/storage/local_storage_service.dart';
import '../models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<UserModel?> getCachedUser();
  Future<void> cacheUser(UserModel user);
  Future<void> cacheTokens({required String accessToken, required String refreshToken});
  Future<String?> getAccessToken();
  Future<void> setRememberMe(bool value);
  bool getRememberMe();
  Future<void> clearCache();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final LocalStorageService storageService;
  AuthLocalDataSourceImpl({required this.storageService});

  @override
  Future<UserModel?> getCachedUser() async {
    final session = await storageService.getUserSession();
    if (session == null) return null;
    return UserModel.fromJson(session);
  }

  @override
  Future<void> cacheUser(UserModel user) async {
    await storageService.saveUserSession(user.toJson());
  }

  @override
  Future<void> cacheTokens({required String accessToken, required String refreshToken}) async {
    await storageService.saveAuthTokens(accessToken: accessToken, refreshToken: refreshToken);
  }

  @override
  Future<String?> getAccessToken() => storageService.getAccessToken();

  @override
  Future<void> setRememberMe(bool value) => storageService.setRememberMe(value);

  @override
  bool getRememberMe() => storageService.getRememberMe();

  @override
  Future<void> clearCache() => storageService.clearAuth();
}
