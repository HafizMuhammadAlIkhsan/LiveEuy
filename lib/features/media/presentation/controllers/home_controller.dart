import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../../../core/data/mock_data.dart';
import '../../../../core/usecases/usecase.dart';
import '../../../../models/movie_model.dart';
import '../../../../models/review_model.dart';
import '../../domain/usecases/get_all_media_usecase.dart';
import '../../domain/usecases/toggle_watchlist_usecase.dart';
import '../../domain/usecases/add_review_usecase.dart';
import '../../domain/repositories/media_repository.dart';
import '../../../media/data/datasources/media_local_datasource.dart';

class HomeController extends GetxController {
  final GetAllMediaUseCase _getAllMediaUseCase;
  final ToggleWatchlistUseCase _toggleWatchlistUseCase;
  final AddReviewUseCase _addReviewUseCase;
  final MediaRepository _repository;
  final MediaLocalDataSource _localDataSource;

  HomeController({
    required GetAllMediaUseCase getAllMediaUseCase,
    required ToggleWatchlistUseCase toggleWatchlistUseCase,
    required AddReviewUseCase addReviewUseCase,
    required MediaRepository repository,
    required MediaLocalDataSource localDataSource,
  })  : _getAllMediaUseCase = getAllMediaUseCase,
        _toggleWatchlistUseCase = toggleWatchlistUseCase,
        _addReviewUseCase = addReviewUseCase,
        _repository = repository,
        _localDataSource = localDataSource;

  final heroList = <Movie>[].obs;
  final continueWatching = <Movie>[].obs;
  final top10List = <Movie>[].obs;
  final popularList = <Movie>[].obs;
  final actionSciFiList = <Movie>[].obs;
  final watchlistIds = <String>{}.obs;
  final movieReviews = <String, List<Review>>{}.obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadInitialData();
    fetchMedia();
  }

  void _loadInitialData() {
    heroList.value = MockData.heroMovies;
    continueWatching.value = MockData.continueWatchingList;
    top10List.value = MockData.top10Movies;
    popularList.value = MockData.popularMovies;
    actionSciFiList.value = MockData.actionSciFiMovies;
    watchlistIds.assignAll({'m1', 'm3'});
    movieReviews.value = {
      'cyberpunk-neo-nusantara': MockData.cyberpunkReviews,
      'chronicles-of-elysium': MockData.chroniclesReviews,
      'm1': MockData.gadiskretekReviews,
      'm_hero': MockData.gundalaReviews,
    };

    // Load from local storage
    try {
      final savedWatchlist = _localDataSource.getWatchlistIds();
      if (savedWatchlist.isNotEmpty) watchlistIds.assignAll(savedWatchlist);
      final savedProgress = _localDataSource.getWatchProgressList();
      if (savedProgress.isNotEmpty) {
        final progressMap = {for (var p in savedProgress) p.mediaId: p.progress};
        continueWatching.value = continueWatching.map((movie) {
          if (progressMap.containsKey(movie.id)) {
            return movie.copyWith(continueWatchingProgress: progressMap[movie.id]);
          }
          return movie;
        }).toList();
      }
    } catch (e) {
      if (kDebugMode) debugPrint('[HomeController] Load local data error: $e');
    }
  }

  Future<void> fetchMedia() async {
    isLoading.value = true;
    final result = await _getAllMediaUseCase(const NoParams());
    result.fold(
      (failure) {
        if (kDebugMode) debugPrint('[HomeController] fetchMedia error: ${failure.message}');
      },
      (mediaList) {
        if (mediaList.isNotEmpty) {
          final top10 = mediaList.where((m) => m.isTop10).toList()
            ..sort((a, b) => (a.top10Rank ?? 99).compareTo(b.top10Rank ?? 99));
          final popular = mediaList.where((m) => m.matchScore >= 90).toList();
          final actionSciFi = mediaList.where((m) => m.genre.toLowerCase().contains('aksi') || m.genre.toLowerCase().contains('sci-fi')).toList();

          heroList.value = mediaList.take(3).toList();
          if (top10.isNotEmpty) top10List.value = top10;
          if (popular.isNotEmpty) popularList.value = popular;
          if (actionSciFi.isNotEmpty) actionSciFiList.value = actionSciFi;
        }
      },
    );

    // Fetch watchlist IDs
    final watchlistResult = await _repository.getWatchlistIds();
    watchlistResult.fold((_) {}, (ids) {
      if (ids.isNotEmpty) {
        watchlistIds.assignAll(ids);
        _localDataSource.saveWatchlistIds(ids);
      }
    });

    isLoading.value = false;
  }

  Future<void> toggleWatchlist(String movieId) async {
    final updated = Set<String>.from(watchlistIds);
    if (updated.contains(movieId)) { updated.remove(movieId); } else { updated.add(movieId); }
    watchlistIds.assignAll(updated);

    final result = await _toggleWatchlistUseCase(movieId);
    result.fold(
      (failure) { if (kDebugMode) debugPrint('[HomeController] toggleWatchlist error: ${failure.message}'); },
      (inWatchlist) {
        final synced = Set<String>.from(watchlistIds);
        if (inWatchlist) { synced.add(movieId); } else { synced.remove(movieId); }
        watchlistIds.assignAll(synced);
      },
    );
  }

  Future<void> removeMultipleFromWatchlist(Iterable<String> movieIds) async {
    final idsList = movieIds.toList();
    if (idsList.isEmpty) return;
    final updated = Set<String>.from(watchlistIds);
    updated.removeAll(idsList);
    watchlistIds.assignAll(updated);
    await _repository.removeWatchlistBatch(idsList);
  }

  Future<void> addMultipleToWatchlist(Iterable<String> movieIds) async {
    final updated = Set<String>.from(watchlistIds);
    updated.addAll(movieIds);
    watchlistIds.assignAll(updated);
    _localDataSource.saveWatchlistIds(updated);
  }

  Future<void> addReview(String movieId, double rating, String comment, {String userName = 'Anda (Pengguna)'}) async {
    final newReview = Review(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      mediaId: movieId, userName: userName,
      userAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: rating, comment: comment, createdAt: DateTime.now(), likesCount: 0,
    );
    final currentReviews = Map<String, List<Review>>.from(movieReviews);
    final list = List<Review>.from(currentReviews[movieId] ?? MockData.getInitialReviews(movieId));
    list.insert(0, newReview);
    currentReviews[movieId] = list;
    movieReviews.value = currentReviews;

    final result = await _addReviewUseCase(AddReviewParams(mediaId: movieId, rating: rating, comment: comment, userName: userName));
    result.fold((_) {}, (savedReview) {
      if (savedReview != null) {
        final syncedReviews = Map<String, List<Review>>.from(movieReviews);
        final syncedList = List<Review>.from(syncedReviews[movieId] ?? []);
        final idx = syncedList.indexWhere((r) => r.id == newReview.id);
        if (idx >= 0) {
          syncedList[idx] = savedReview;
          syncedReviews[movieId] = syncedList;
          movieReviews.value = syncedReviews;
        }
      }
    });
  }

  Future<void> updateContinueWatching(String movieId, double progress, {String? lastEpisodeId}) async {
    final list = List<Movie>.from(continueWatching);
    final index = list.indexWhere((m) => m.id == movieId);
    if (index >= 0) {
      list[index] = list[index].copyWith(continueWatchingProgress: progress);
    }
    continueWatching.value = list;
    await _repository.syncWatchProgress(mediaId: movieId, progress: progress, lastEpisodeId: lastEpisodeId);
  }

  void removeFromContinueWatching(String movieId) {
    continueWatching.removeWhere((m) => m.id == movieId);
  }

  void insertContinueWatching(Movie movie, {int index = 0}) {
    final list = List<Movie>.from(continueWatching);
    list.insert(index.clamp(0, list.length), movie);
    continueWatching.value = list;
  }

  Movie? findMovieById(String id) {
    final all = [...heroList, ...top10List, ...popularList, ...actionSciFiList, ...continueWatching, ...MockData.heroMovies, ...MockData.top10Movies, ...MockData.popularMovies, ...MockData.actionSciFiMovies];
    for (final m in all) {
      if (m.id == id) return m;
    }
    return null;
  }
}
