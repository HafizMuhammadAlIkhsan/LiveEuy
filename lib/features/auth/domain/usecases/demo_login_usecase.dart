import '../../../../core/usecases/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class DemoLoginUseCase extends UseCase<UserEntity, DemoLoginParams> {
  final AuthRepository repository;
  DemoLoginUseCase(this.repository);

  @override
  ResultFuture<UserEntity> call(DemoLoginParams params) {
    return repository.demoLogin(
      persona: params.persona,
      rememberMe: params.rememberMe,
    );
  }
}

class DemoLoginParams {
  final String persona;
  final bool rememberMe;
  const DemoLoginParams({required this.persona, this.rememberMe = true});
}
