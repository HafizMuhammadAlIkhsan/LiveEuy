import '../../../../core/network/api_service.dart';
import '../../../../core/error/exceptions.dart' as app_exceptions;
import '../../../../models/movie_model.dart';
import '../../../../models/review_model.dart';
import '../../../../models/watch_progress_model.dart';

abstract class MediaRemoteDataSource {
  Future<List<Movie>> getAllMedia();
  Future<Movie?> getMediaById(String id);
  Future<List<Movie>> getTop10Media();
  Future<Set<String>> getWatchlistIds();
  Future<bool> toggleWatchlist(String movieId);
  Future<void> removeWatchlistBatch(List<String> movieIds);
  Future<Review?> addReview({required String mediaId, required double rating, required String comment, required String userName});
  Future<WatchProgress?> syncWatchProgress({required String mediaId, required double progress, String? lastEpisodeId});
  Future<List<Movie>> getTrendingMedia({int limit = 10});
  Future<void> recordInteraction({required String mediaId, required String interactionType, double? score});
}

class MediaRemoteDataSourceImpl implements MediaRemoteDataSource {
  final ApiService apiService;
  MediaRemoteDataSourceImpl({required this.apiService});

  @override
  Future<List<Movie>> getAllMedia() async {
    try {
      return await apiService.getAllMedia();
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<Movie?> getMediaById(String id) async {
    try {
      return await apiService.getMediaById(id);
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<List<Movie>> getTop10Media() async {
    try {
      return await apiService.getTop10Media();
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<Set<String>> getWatchlistIds() async {
    try {
      return await apiService.getWatchlistIds();
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<bool> toggleWatchlist(String movieId) async {
    try {
      return await apiService.toggleWatchlist(movieId);
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<void> removeWatchlistBatch(List<String> movieIds) async {
    try {
      await apiService.removeWatchlistBatch(movieIds);
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<Review?> addReview({required String mediaId, required double rating, required String comment, required String userName}) async {
    try {
      return await apiService.addReview(mediaId: mediaId, rating: rating, comment: comment, userName: userName);
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<WatchProgress?> syncWatchProgress({required String mediaId, required double progress, String? lastEpisodeId}) async {
    try {
      return await apiService.syncWatchProgress(mediaId: mediaId, progress: progress, lastEpisodeId: lastEpisodeId);
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<List<Movie>> getTrendingMedia({int limit = 10}) async {
    try {
      return await apiService.getTrendingMedia(limit: limit);
    } catch (e) {
      throw app_exceptions.ServerException(message: e.toString());
    }
  }

  @override
  Future<void> recordInteraction({required String mediaId, required String interactionType, double? score}) async {
    try {
      await apiService.recordTrendingInteraction(mediaId: mediaId, interactionType: interactionType, score: score);
    } catch (_) {}
  }
}
