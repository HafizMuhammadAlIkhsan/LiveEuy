import '../../../../core/usecases/usecase.dart';
import '../../../../models/movie_model.dart';
import '../repositories/media_repository.dart';

class GetMediaDetailUseCase extends UseCase<Movie?, String> {
  final MediaRepository repository;
  GetMediaDetailUseCase(this.repository);

  @override
  ResultFuture<Movie?> call(String id) {
    return repository.getMediaById(id);
  }
}
