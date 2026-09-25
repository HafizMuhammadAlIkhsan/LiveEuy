import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/data/mock_data.dart';
import '../core/network/api_config.dart';
import '../core/network/api_provider.dart';
import '../core/network/api_service.dart';
import '../models/movie_model.dart';
import '../models/review_model.dart';

class MediaState {
  final List<Movie> heroList;
  final List<Movie> continueWatching;
  final List<Movie> top10List;
  final List<Movie> popularList;
  final List<Movie> actionSciFiList;
  final Set<String> watchlistIds;
  final Map<String, List<Review>> movieReviews;
  final bool isLoading;

  const MediaState({
    required this.heroList,
    required this.continueWatching,
    required this.top10List,
    required this.popularList,
    required this.actionSciFiList,
    required this.watchlistIds,
    required this.movieReviews,
    this.isLoading = false,
  });

  MediaState copyWith({
    List<Movie>? heroList,
    List<Movie>? continueWatching,
    List<Movie>? top10List,
    List<Movie>? popularList,
    List<Movie>? actionSciFiList,
    Set<String>? watchlistIds,
    Map<String, List<Review>>? movieReviews,
    bool? isLoading,
  }) {
    return MediaState(
      heroList: heroList ?? this.heroList,
      continueWatching: continueWatching ?? this.continueWatching,
      top10List: top10List ?? this.top10List,
      popularList: popularList ?? this.popularList,
      actionSciFiList: actionSciFiList ?? this.actionSciFiList,
      watchlistIds: watchlistIds ?? this.watchlistIds,
      movieReviews: movieReviews ?? this.movieReviews,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class MediaNotifier extends StateNotifier<MediaState> {
  final ApiService? apiService;

  MediaNotifier({this.apiService})
      : super(MediaState(
          heroList: MockData.heroMovies,
          continueWatching: MockData.continueWatchingList,
          top10List: MockData.top10Movies,
          popularList: MockData.popularMovies,
          actionSciFiList: MockData.actionSciFiMovies,
          watchlistIds: {'m1', 'm3'},
          movieReviews: {
            'cyberpunk-neo-nusantara': MockData.cyberpunkReviews,
            'chronicles-of-elysium': MockData.chroniclesReviews,
            'm1': MockData.gadiskretekReviews,
            'm_hero': MockData.gundalaReviews,
          },
        )) {
    if (apiService != null) {
      fetchMedia();
    }
  }

  /// Sinkronisasi data katalog media dan watchlist dari backend server
  Future<void> fetchMedia() async {
    final service = apiService;
    if (service == null) return;
    try {
      final mediaList = await service.getAllMedia();
      if (mediaList.isNotEmpty) {
        final top10 = mediaList.where((m) => m.isTop10).toList();
        top10.sort((a, b) => (a.top10Rank ?? 99).compareTo(b.top10Rank ?? 99));

        final popular = mediaList.where((m) => m.matchScore >= 90).toList();
        final actionSciFi = mediaList
            .where((m) =>
                m.genre.toLowerCase().contains('aksi') ||
                m.genre.toLowerCase().contains('sci-fi'))
            .toList();

        state = state.copyWith(
          heroList: mediaList.take(3).toList(),
          top10List: top10.isNotEmpty ? top10 : state.top10List,
          popularList: popular.isNotEmpty ? popular : state.popularList,
          actionSciFiList:
              actionSciFi.isNotEmpty ? actionSciFi : state.actionSciFiList,
        );
      }

      final watchlistIds = await service.getWatchlistIds();
      if (watchlistIds.isNotEmpty) {
        state = state.copyWith(watchlistIds: watchlistIds);
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[MediaNotifier] Backend tidak merespon, menggunakan data lokal: $e');
      }
    }
  }

  /// Toggle simpan/hapus watchlist dengan pembaruan UI optimistik & sinkronisasi backend
  Future<void> toggleWatchlist(
    String movieId, {
    String userId = ApiConfig.defaultUserId,
  }) async {
    final updated = Set<String>.from(state.watchlistIds);
    if (updated.contains(movieId)) {
      updated.remove(movieId);
    } else {
      updated.add(movieId);
    }
    state = state.copyWith(watchlistIds: updated);

    final service = apiService;
    if (service != null) {
      try {
        final inWatchlist =
            await service.toggleWatchlist(movieId, userId: userId);
        final synced = Set<String>.from(state.watchlistIds);
        if (inWatchlist) {
          synced.add(movieId);
        } else {
          synced.remove(movieId);
        }
        state = state.copyWith(watchlistIds: synced);
      } catch (e) {
        if (kDebugMode) {
          debugPrint('[MediaNotifier] toggleWatchlist sync error (offline): $e');
        }
      }
    }
  }

  /// Tambah ulasan baru dengan pembaruan UI seketika & pengiriman ke backend
  Future<void> addReview(
    String movieId,
    double rating,
    String comment, {
    String userName = 'Anda (Pengguna)',
  }) async {
    final newReview = Review(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      mediaId: movieId,
      userName: userName,
      userAvatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: rating,
      comment: comment,
      createdAt: DateTime.now(),
      likesCount: 0,
    );

    final currentReviews = Map<String, List<Review>>.from(state.movieReviews);
    final list = List<Review>.from(
        currentReviews[movieId] ?? MockData.getInitialReviews(movieId));
    list.insert(0, newReview);
    currentReviews[movieId] = list;

    state = state.copyWith(movieReviews: currentReviews);

    final service = apiService;
    if (service != null) {
      try {
        final savedReview = await service.addReview(
          mediaId: movieId,
          rating: rating,
          comment: comment,
          userName: userName,
        );
        if (savedReview != null) {
          final syncedReviews =
              Map<String, List<Review>>.from(state.movieReviews);
          final syncedList =
              List<Review>.from(syncedReviews[movieId] ?? []);
          final idx = syncedList.indexWhere((r) => r.id == newReview.id);
          if (idx >= 0) {
            syncedList[idx] = savedReview;
            syncedReviews[movieId] = syncedList;
            state = state.copyWith(movieReviews: syncedReviews);
          }
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('[MediaNotifier] addReview sync error (offline): $e');
        }
      }
    }
  }

  /// Update durasi tontonan (continue watching) dengan sinkronisasi ke backend
  Future<void> updateContinueWatching(
    String movieId,
    double progress, {
    String? lastEpisodeId,
    String userId = ApiConfig.defaultUserId,
  }) async {
    final list = List<Movie>.from(state.continueWatching);
    final index = list.indexWhere((m) => m.id == movieId);
    if (index >= 0) {
      list[index] = list[index].copyWith(continueWatchingProgress: progress);
    }
    state = state.copyWith(continueWatching: list);

    final service = apiService;
    if (service != null) {
      try {
        await service.syncWatchProgress(
          mediaId: movieId,
          progress: progress,
          lastEpisodeId: lastEpisodeId,
          userId: userId,
        );
      } catch (e) {
        if (kDebugMode) {
          debugPrint(
              '[MediaNotifier] updateContinueWatching sync error (offline): $e');
        }
      }
    }
  }

  void removeFromContinueWatching(String movieId) {
    final list = List<Movie>.from(state.continueWatching);
    list.removeWhere((m) => m.id == movieId);
    state = state.copyWith(continueWatching: list);
  }

  void insertContinueWatching(Movie movie, {int index = 0}) {
    final list = List<Movie>.from(state.continueWatching);
    final clampedIndex = index.clamp(0, list.length);
    list.insert(clampedIndex, movie);
    state = state.copyWith(continueWatching: list);
  }
}

final mediaProvider = StateNotifierProvider<MediaNotifier, MediaState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return MediaNotifier(apiService: apiService);
});
