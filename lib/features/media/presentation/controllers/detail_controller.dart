import 'package:get/get.dart';
import '../../../../models/movie_model.dart';
import '../../domain/usecases/get_media_detail_usecase.dart';

class DetailController extends GetxController {
  final GetMediaDetailUseCase _getMediaDetailUseCase;
  DetailController({required GetMediaDetailUseCase getMediaDetailUseCase}) : _getMediaDetailUseCase = getMediaDetailUseCase;

  final Rxn<Movie> movie = Rxn<Movie>();
  final isLoading = false.obs;

  Future<void> loadDetail(String movieId) async {
    isLoading.value = true;
    final result = await _getMediaDetailUseCase(movieId);
    result.fold(
      (failure) {},
      (data) { movie.value = data; },
    );
    isLoading.value = false;
  }
}
