import 'package:get/get.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../core/utils/snackbar_helper.dart';
import '../../../../models/device_session_model.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import '../../domain/usecases/demo_login_usecase.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthController extends GetxController {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final LogoutUseCase _logoutUseCase;
  final DemoLoginUseCase _demoLoginUseCase;
  final AuthRepository _repository;

  AuthController({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required LogoutUseCase logoutUseCase,
    required DemoLoginUseCase demoLoginUseCase,
    required AuthRepository repository,
  })  : _loginUseCase = loginUseCase,
        _registerUseCase = registerUseCase,
        _logoutUseCase = logoutUseCase,
        _demoLoginUseCase = demoLoginUseCase,
        _repository = repository;

  final Rxn<UserEntity> user = Rxn<UserEntity>();
  final isLoading = false.obs;
  final isLoggedIn = false.obs;
  final isVip = false.obs;

  UserEntity? get currentUser => user.value;

  @override
  void onInit() {
    super.onInit();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final result = await _repository.restoreSession();
    result.fold(
      (failure) {},
      (restoredUser) {
        if (restoredUser != null) {
          user.value = restoredUser;
          isLoggedIn.value = restoredUser.isLoggedIn;
          isVip.value = restoredUser.isVip;
        }
      },
    );
  }

  Future<DeviceCheckResult> checkDeviceConflict(String email) async {
    final result = await _repository.checkDeviceConflict(email);
    return result.fold<DeviceCheckResult>(
      (_) => DeviceCheckResult.noConflict(),
      (checkResult) => checkResult,
    );
  }


  Future<bool> login(
    String email,
    String password,
    bool rememberMe, {
    bool forceTakeover = false,
  }) async {
    isLoading.value = true;
    final result = await _loginUseCase(LoginParams(
      email: email,
      password: password,
      rememberMe: rememberMe,
      forceTakeover: forceTakeover,
    ));
    isLoading.value = false;
    return result.fold(
      (failure) {
        SnackbarHelper.showError(message: failure.message);
        return false;
      },
      (loggedInUser) {
        user.value = loggedInUser;
        isLoggedIn.value = true;
        isVip.value = loggedInUser.isVip;
        return true;
      },
    );
  }

  Future<bool> register(
    String name,
    String email,
    String password, [
    String tier = 'VIP Standard',
    String? securityPin,
  ]) async {
    isLoading.value = true;
    final result = await _registerUseCase(RegisterParams(
      name: name,
      email: email,
      password: password,
      tier: tier,
      securityPin: securityPin,
    ));
    isLoading.value = false;
    return result.fold(
      (failure) {
        SnackbarHelper.showError(message: failure.message);
        return false;
      },
      (registeredUser) {
        user.value = registeredUser;
        isLoggedIn.value = true;
        isVip.value = registeredUser.isVip;
        return true;
      },
    );
  }

  Future<bool> demoLogin(String persona, {bool rememberMe = true}) async {
    isLoading.value = true;
    final result = await _demoLoginUseCase(DemoLoginParams(persona: persona, rememberMe: rememberMe));
    isLoading.value = false;
    return result.fold(
      (failure) {
        SnackbarHelper.showError(message: failure.message);
        return false;
      },
      (loggedInUser) {
        user.value = loggedInUser;
        isLoggedIn.value = true;
        isVip.value = loggedInUser.isVip;
        return true;
      },
    );
  }

  Future<void> logout() async {
    final result = await _logoutUseCase(const NoParams());
    result.fold(
      (failure) => SnackbarHelper.showError(message: failure.message),
      (_) {
        user.value = null;
        isLoggedIn.value = false;
        isVip.value = false;
      },
    );
  }

  Future<void> upgradeToVip([String tier = 'VIP Cinema Ultra']) async {
    final result = await _repository.upgradeToVip(tier: tier);
    result.fold(
      (failure) => SnackbarHelper.showError(message: failure.message),
      (upgradedUser) {
        user.value = upgradedUser;
        isVip.value = true;
      },
    );
  }

  Future<bool> changePassword({required String currentPassword, required String newPassword}) async {
    final result = await _repository.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
    return result.fold(
      (failure) {
        SnackbarHelper.showError(message: failure.message);
        return false;
      },
      (success) => success,
    );
  }

  Future<bool> forgotPassword(String email) async {
    final result = await _repository.forgotPassword(email: email);
    return result.fold(
      (failure) {
        SnackbarHelper.showError(message: failure.message);
        return false;
      },
      (success) => success,
    );
  }

  Future<bool> resetPassword({required String token, required String newPassword}) async {
    isLoading.value = true;
    final result = await _repository.resetPassword(token: token, newPassword: newPassword);
    isLoading.value = false;
    return result.fold(
      (failure) {
        SnackbarHelper.showError(message: failure.message);
        return false;
      },
      (success) => success,
    );
  }

  Future<bool> resendVerificationPin(String email) async {
    final result = await _repository.resendVerificationPin(email);
    return result.fold(
      (failure) {
        SnackbarHelper.showError(message: failure.message);
        return false;
      },
      (success) => success,
    );
  }

  Future<bool> verifyRegistrationPin(String email, String pin) async {
    final result = await _repository.verifyEmailPin(email: email, pin: pin);
    return result.fold((_) => true, (res) => res);
  }

  Future<void> revokeDeviceSession(String sessionId) async {
    final result = await _repository.revokeDeviceSession(sessionId);
    result.fold(
      (failure) => SnackbarHelper.showError(message: failure.message),
      (_) {
        final current = user.value;
        if (current != null) {
          final updatedSessions = current.activeSessions.where((s) => s.sessionId != sessionId).toList();
          user.value = current.copyWith(activeSessions: updatedSessions);
        }
      },
    );
  }

  Future<void> logoutAllDevices({bool includeCurrent = false}) async {
    final result = await _repository.logoutAllDevices(includeCurrent: includeCurrent);
    result.fold(
      (failure) => SnackbarHelper.showError(message: failure.message),
      (_) {
        final current = user.value;
        if (current != null) {
          final updatedSessions = includeCurrent
              ? <DeviceSession>[]
              : current.activeSessions.where((s) => s.isCurrentDevice).toList();
          user.value = current.copyWith(activeSessions: updatedSessions);
        }
      },
    );
  }
}
