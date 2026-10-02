import 'package:dartz/dartz.dart';
import 'package:flutter/foundation.dart';
import '../../../../core/error/exceptions.dart' as app_exceptions;
import '../../../../core/error/failures.dart';
import '../../../../models/movie_model.dart';
import '../../../../models/review_model.dart';
import '../../../../models/watch_progress_model.dart';
import '../../domain/repositories/media_repository.dart';
import '../datasources/media_remote_datasource.dart';
import '../datasources/media_local_datasource.dart';

class MediaRepositoryImpl implements MediaRepository {
  final MediaRemoteDataSource remoteDataSource;
  final MediaLocalDataSource localDataSource;

  MediaRepositoryImpl({required this.remoteDataSource, required this.localDataSource});

  @override
  Future<Either<Failure, List<Movie>>> getAllMedia() async {
    try {
      final movies = await remoteDataSource.getAllMedia();
      return Right(movies);
    } on app_exceptions.ServerException catch (e) {
      if (kDebugMode) debugPrint('[MediaRepo] Backend offline: ${e.message}');
      return const Right([]);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, Movie?>> getMediaById(String id) async {
    try {
      final movie = await remoteDataSource.getMediaById(id);
      return Right(movie);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<Movie>>> getTop10Media() async {
    try {
      final movies = await remoteDataSource.getTop10Media();
      return Right(movies);
    } catch (e) {
      return const Right([]);
    }
  }

  @override
  Future<Either<Failure, Set<String>>> getWatchlistIds() async {
    try {
      final ids = await remoteDataSource.getWatchlistIds();
      if (ids.isNotEmpty) {
        await localDataSource.saveWatchlistIds(ids);
      }
      return Right(ids);
    } catch (_) {
      final localIds = localDataSource.getWatchlistIds();
      return Right(localIds);
    }
  }

  @override
  Future<Either<Failure, bool>> toggleWatchlist(String movieId) async {
    // Optimistic UI update
    final current = localDataSource.getWatchlistIds();
    final updated = Set<String>.from(current);
    final wasInWatchlist = updated.contains(movieId);
    if (wasInWatchlist) { updated.remove(movieId); } else { updated.add(movieId); }
    await localDataSource.saveWatchlistIds(updated);

    try {
      final result = await remoteDataSource.toggleWatchlist(movieId);
      final synced = Set<String>.from(localDataSource.getWatchlistIds());
      if (result) { synced.add(movieId); } else { synced.remove(movieId); }
      await localDataSource.saveWatchlistIds(synced);
      return Right(result);
    } catch (e) {
      if (kDebugMode) debugPrint('[MediaRepo] toggleWatchlist offline: $e');
      return Right(!wasInWatchlist);
    }
  }

  @override
  Future<Either<Failure, void>> removeWatchlistBatch(List<String> movieIds) async {
    final updated = Set<String>.from(localDataSource.getWatchlistIds());
    updated.removeAll(movieIds);
    await localDataSource.saveWatchlistIds(updated);
    try {
      await remoteDataSource.removeWatchlistBatch(movieIds);
    } catch (_) {}
    return const Right(null);
  }

  @override
  Future<Either<Failure, Review?>> addReview({required String mediaId, required double rating, required String comment, String userName = 'Anda (Pengguna)'}) async {
    try {
      final review = await remoteDataSource.addReview(mediaId: mediaId, rating: rating, comment: comment, userName: userName);
      return Right(review);
    } catch (e) {
      if (kDebugMode) debugPrint('[MediaRepo] addReview offline: $e');
      return Right(Review(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        mediaId: mediaId, userName: userName,
        userAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating: rating, comment: comment, createdAt: DateTime.now(),
      ));
    }
  }

  @override
  Future<Either<Failure, void>> syncWatchProgress({required String mediaId, required double progress, String? lastEpisodeId}) async {
    // Save locally first
    final currentList = localDataSource.getWatchProgressList();
    currentList.removeWhere((p) => p.mediaId == mediaId);
    currentList.insert(0, WatchProgress(userId: 'u1', mediaId: mediaId, progress: progress, lastEpisodeId: lastEpisodeId, updatedAt: DateTime.now()));
    await localDataSource.saveWatchProgressList(currentList);

    try {
      await remoteDataSource.syncWatchProgress(mediaId: mediaId, progress: progress, lastEpisodeId: lastEpisodeId);
    } catch (_) {}
    return const Right(null);
  }

  @override
  Future<Either<Failure, List<Movie>>> getTrendingMedia({int limit = 10}) async {
    try {
      final movies = await remoteDataSource.getTrendingMedia(limit: limit);
      return Right(movies);
    } catch (e) {
      return const Right([]);
    }
  }

  @override
  Future<void> recordInteraction({required String mediaId, required String interactionType, double? score}) async {
    try {
      await remoteDataSource.recordInteraction(mediaId: mediaId, interactionType: interactionType, score: score);
    } catch (_) {}
  }
}
