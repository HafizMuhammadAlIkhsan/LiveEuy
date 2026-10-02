import '../../../../core/usecases/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase extends UseCase<UserEntity, LoginParams> {
  final AuthRepository repository;
  LoginUseCase(this.repository);

  @override
  ResultFuture<UserEntity> call(LoginParams params) {
    return repository.login(
      email: params.email,
      password: params.password,
      rememberMe: params.rememberMe,
      forceTakeover: params.forceTakeover,
    );
  }
}

class LoginParams {
  final String email;
  final String password;
  final bool rememberMe;
  final bool forceTakeover;

  const LoginParams({
    required this.email,
    required this.password,
    this.rememberMe = true,
    this.forceTakeover = false,
  });
}
