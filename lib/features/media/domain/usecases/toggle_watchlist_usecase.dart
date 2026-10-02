import '../../../../core/usecases/usecase.dart';
import '../repositories/media_repository.dart';

class ToggleWatchlistUseCase extends UseCase<bool, String> {
  final MediaRepository repository;
  ToggleWatchlistUseCase(this.repository);

  @override
  ResultFuture<bool> call(String movieId) {
    return repository.toggleWatchlist(movieId);
  }
}
