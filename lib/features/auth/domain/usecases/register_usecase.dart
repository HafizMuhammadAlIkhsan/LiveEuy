import '../../../../core/usecases/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase extends UseCase<UserEntity, RegisterParams> {
  final AuthRepository repository;
  RegisterUseCase(this.repository);

  @override
  ResultFuture<UserEntity> call(RegisterParams params) {
    return repository.register(
      name: params.name,
      email: params.email,
      password: params.password,
      tier: params.tier,
      securityPin: params.securityPin,
    );
  }
}

class RegisterParams {
  final String name;
  final String email;
  final String password;
  final String tier;
  final String? securityPin;

  const RegisterParams({
    required this.name,
    required this.email,
    required this.password,
    this.tier = 'VIP Standard',
    this.securityPin,
  });
}
