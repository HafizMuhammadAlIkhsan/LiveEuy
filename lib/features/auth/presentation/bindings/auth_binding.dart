import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/local_storage_service.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/datasources/auth_local_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/usecases/login_usecase.dart';
import '../../domain/usecases/register_usecase.dart';
import '../../domain/usecases/logout_usecase.dart';
import '../../domain/usecases/demo_login_usecase.dart';
import '../controllers/auth_controller.dart';

class AuthBinding extends Bindings {
  @override
  void dependencies() {
    // DataSources
    Get.lazyPut<AuthRemoteDataSource>(() => AuthRemoteDataSourceImpl(
      client: Get.find<ApiClient>(),
    ));
    Get.lazyPut<AuthLocalDataSource>(() => AuthLocalDataSourceImpl(
      storageService: Get.find<LocalStorageService>(),
    ));

    // Repository
    Get.lazyPut<AuthRepository>(() => AuthRepositoryImpl(
      remoteDataSource: Get.find<AuthRemoteDataSource>(),
      localDataSource: Get.find<AuthLocalDataSource>(),
    ));

    // UseCases
    Get.lazyPut(() => LoginUseCase(Get.find<AuthRepository>()));
    Get.lazyPut(() => RegisterUseCase(Get.find<AuthRepository>()));
    Get.lazyPut(() => LogoutUseCase(Get.find<AuthRepository>()));
    Get.lazyPut(() => DemoLoginUseCase(Get.find<AuthRepository>()));

    // Controller
    Get.lazyPut(() => AuthController(
      loginUseCase: Get.find(),
      registerUseCase: Get.find(),
      logoutUseCase: Get.find(),
      demoLoginUseCase: Get.find(),
      repository: Get.find<AuthRepository>(),
    ));
  }
}
