import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../models/movie_model.dart';
import '../../../../models/review_model.dart';

abstract class MediaRepository {
  Future<Either<Failure, List<Movie>>> getAllMedia();
  Future<Either<Failure, Movie?>> getMediaById(String id);
  Future<Either<Failure, List<Movie>>> getTop10Media();
  Future<Either<Failure, Set<String>>> getWatchlistIds();
  Future<Either<Failure, bool>> toggleWatchlist(String movieId);
  Future<Either<Failure, void>> removeWatchlistBatch(List<String> movieIds);
  Future<Either<Failure, Review?>> addReview({required String mediaId, required double rating, required String comment, String userName});
  Future<Either<Failure, void>> syncWatchProgress({required String mediaId, required double progress, String? lastEpisodeId});
}
