import 'package:get/get.dart';
import '../../domain/usecases/get_media_detail_usecase.dart';
import '../../domain/repositories/media_repository.dart';
import '../controllers/detail_controller.dart';

class DetailBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<GetMediaDetailUseCase>()) {
      Get.lazyPut(() => GetMediaDetailUseCase(Get.find<MediaRepository>()));
    }
    Get.lazyPut(() => DetailController(getMediaDetailUseCase: Get.find()));
  }
}
