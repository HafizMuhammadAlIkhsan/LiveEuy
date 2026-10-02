import 'package:get/get.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_service.dart';
import '../../../core/storage/local_storage_service.dart';
import '../../auth/data/datasources/auth_remote_datasource.dart';
import '../../auth/data/datasources/auth_local_datasource.dart';
import '../../auth/data/repositories/auth_repository_impl.dart';
import '../../auth/domain/repositories/auth_repository.dart';
import '../../auth/domain/usecases/login_usecase.dart';
import '../../auth/domain/usecases/register_usecase.dart';
import '../../auth/domain/usecases/logout_usecase.dart';
import '../../auth/domain/usecases/demo_login_usecase.dart';
import '../../auth/presentation/controllers/auth_controller.dart';
import '../../media/data/datasources/media_remote_datasource.dart';
import '../../media/data/datasources/media_local_datasource.dart';
import '../../media/data/repositories/media_repository_impl.dart';
import '../../media/domain/repositories/media_repository.dart';
import '../../media/domain/usecases/get_all_media_usecase.dart';
import '../../media/domain/usecases/toggle_watchlist_usecase.dart';
import '../../media/domain/usecases/add_review_usecase.dart';
import '../../media/domain/usecases/get_media_detail_usecase.dart';
import '../../media/presentation/controllers/home_controller.dart';
import '../../../../providers/user_settings_provider.dart';
import '../../../../providers/notification_provider.dart';
import '../../../../providers/ad_provider.dart';
import '../../../../providers/search_provider.dart';
import '../controllers/main_navigation_controller.dart';

class MainBinding extends Bindings {
  @override
  void dependencies() {
    // Core: ApiClient
    Get.put<ApiClient>(ApiClient(baseUrl: ApiConfig.authBaseUrl), permanent: true);

    // Core: ApiService
    Get.lazyPut<ApiService>(() => ApiService(
      authClient: ApiClient(baseUrl: ApiConfig.authBaseUrl),
      catalogClient: ApiClient(baseUrl: ApiConfig.catalogBaseUrl),
    ), fenix: true);


    // Auth DataSources
    Get.lazyPut<AuthRemoteDataSource>(() => AuthRemoteDataSourceImpl(client: Get.find<ApiClient>()), fenix: true);
    Get.lazyPut<AuthLocalDataSource>(() => AuthLocalDataSourceImpl(storageService: Get.find<LocalStorageService>()), fenix: true);

    // Auth Repository
    Get.lazyPut<AuthRepository>(() => AuthRepositoryImpl(
      remoteDataSource: Get.find<AuthRemoteDataSource>(),
      localDataSource: Get.find<AuthLocalDataSource>(),
    ), fenix: true);

    // Auth UseCases
    Get.lazyPut(() => LoginUseCase(Get.find<AuthRepository>()), fenix: true);
    Get.lazyPut(() => RegisterUseCase(Get.find<AuthRepository>()), fenix: true);
    Get.lazyPut(() => LogoutUseCase(Get.find<AuthRepository>()), fenix: true);
    Get.lazyPut(() => DemoLoginUseCase(Get.find<AuthRepository>()), fenix: true);

    // Auth Controller (permanent so it persists across pages)
    Get.put(AuthController(
      loginUseCase: Get.find(),
      registerUseCase: Get.find(),
      logoutUseCase: Get.find(),
      demoLoginUseCase: Get.find(),
      repository: Get.find<AuthRepository>(),
    ), permanent: true);

    // Media DataSources
    Get.lazyPut<MediaRemoteDataSource>(() => MediaRemoteDataSourceImpl(apiService: Get.find<ApiService>()), fenix: true);
    Get.lazyPut<MediaLocalDataSource>(() => MediaLocalDataSourceImpl(storageService: Get.find<LocalStorageService>()), fenix: true);

    // Media Repository
    Get.lazyPut<MediaRepository>(() => MediaRepositoryImpl(
      remoteDataSource: Get.find<MediaRemoteDataSource>(),
      localDataSource: Get.find<MediaLocalDataSource>(),
    ), fenix: true);

    // Media UseCases
    Get.lazyPut(() => GetAllMediaUseCase(Get.find<MediaRepository>()), fenix: true);
    Get.lazyPut(() => ToggleWatchlistUseCase(Get.find<MediaRepository>()), fenix: true);
    Get.lazyPut(() => AddReviewUseCase(Get.find<MediaRepository>()), fenix: true);
    Get.lazyPut(() => GetMediaDetailUseCase(Get.find<MediaRepository>()), fenix: true);

    // Home Controller (permanent so it persists across tabs)
    Get.put(HomeController(
      getAllMediaUseCase: Get.find(),
      toggleWatchlistUseCase: Get.find(),
      addReviewUseCase: Get.find(),
      repository: Get.find<MediaRepository>(),
      localDataSource: Get.find<MediaLocalDataSource>(),
    ), permanent: true);

    // Navigation Controller
    Get.put(MainNavigationController(), permanent: true);

    // User Settings Controller
    Get.put(UserSettingsController(), permanent: true);

    // Notification Controller
    Get.put(NotificationController(), permanent: true);

    // Ad Controller
    Get.put(AdController(), permanent: true);

    // Search Controller
    Get.put(AppSearchController(), permanent: true);
  }
}
