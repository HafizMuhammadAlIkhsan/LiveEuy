import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';
import 'api_service.dart';
import '../../models/movie_model.dart';
import '../../models/review_model.dart';

/// Provider for low-level HTTP ApiClient
final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient();
  ref.onDispose(() => client.close());
  return client;
});

/// Provider for high-level ApiService
final apiServiceProvider = Provider<ApiService>((ref) {
  final client = ref.watch(apiClientProvider);
  return ApiService(client: client);
});

/// FutureProvider to fetch all media from backend with fallback
final allMediaFutureProvider = FutureProvider<List<Movie>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return await apiService.getAllMedia();
});

/// FutureProvider to fetch Top 10 media from backend
final top10MediaFutureProvider = FutureProvider<List<Movie>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return await apiService.getTop10Media();
});

/// FutureProvider to fetch user watchlist from backend
final watchlistFutureProvider = FutureProvider<List<Movie>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return await apiService.getWatchlist();
});

/// FutureProvider family to fetch reviews for a specific movie
final movieReviewsFutureProvider =
    FutureProvider.family<List<Review>, String>((ref, movieId) async {
  final apiService = ref.watch(apiServiceProvider);
  return await apiService.getReviews(movieId);
});
