import '../../../../core/usecases/usecase.dart';
import '../../../../models/movie_model.dart';
import '../repositories/media_repository.dart';

class GetAllMediaUseCase extends UseCase<List<Movie>, NoParams> {
  final MediaRepository repository;
  GetAllMediaUseCase(this.repository);

  @override
  ResultFuture<List<Movie>> call(NoParams params) {
    return repository.getAllMedia();
  }
}
