import 'package:get/get.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_service.dart';
import '../../../../core/storage/local_storage_service.dart';
import '../../data/datasources/media_remote_datasource.dart';
import '../../data/datasources/media_local_datasource.dart';
import '../../data/repositories/media_repository_impl.dart';
import '../../domain/repositories/media_repository.dart';
import '../../domain/usecases/get_all_media_usecase.dart';
import '../../domain/usecases/toggle_watchlist_usecase.dart';
import '../../domain/usecases/add_review_usecase.dart';
import '../../domain/usecases/get_media_detail_usecase.dart';
import '../controllers/home_controller.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    // ApiService
    if (!Get.isRegistered<ApiService>()) {
      Get.lazyPut<ApiService>(() => ApiService(client: Get.find<ApiClient>()), fenix: true);
    }

    // DataSources
    Get.lazyPut<MediaRemoteDataSource>(() => MediaRemoteDataSourceImpl(apiService: Get.find<ApiService>()), fenix: true);
    Get.lazyPut<MediaLocalDataSource>(() => MediaLocalDataSourceImpl(storageService: Get.find<LocalStorageService>()), fenix: true);

    // Repository
    Get.lazyPut<MediaRepository>(() => MediaRepositoryImpl(
      remoteDataSource: Get.find<MediaRemoteDataSource>(),
      localDataSource: Get.find<MediaLocalDataSource>(),
    ), fenix: true);

    // UseCases
    Get.lazyPut(() => GetAllMediaUseCase(Get.find<MediaRepository>()), fenix: true);
    Get.lazyPut(() => ToggleWatchlistUseCase(Get.find<MediaRepository>()), fenix: true);
    Get.lazyPut(() => AddReviewUseCase(Get.find<MediaRepository>()), fenix: true);
    Get.lazyPut(() => GetMediaDetailUseCase(Get.find<MediaRepository>()), fenix: true);

    // Controller
    Get.lazyPut(() => HomeController(
      getAllMediaUseCase: Get.find(),
      toggleWatchlistUseCase: Get.find(),
      addReviewUseCase: Get.find(),
      repository: Get.find<MediaRepository>(),
      localDataSource: Get.find<MediaLocalDataSource>(),
    ), fenix: true);
  }
}
