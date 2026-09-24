import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/data/mock_data.dart';
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

  const MediaState({
    required this.heroList,
    required this.continueWatching,
    required this.top10List,
    required this.popularList,
    required this.actionSciFiList,
    required this.watchlistIds,
    required this.movieReviews,
  });

  MediaState copyWith({
    List<Movie>? continueWatching,
    Set<String>? watchlistIds,
    Map<String, List<Review>>? movieReviews,
  }) {
    return MediaState(
      heroList: heroList,
      continueWatching: continueWatching ?? this.continueWatching,
      top10List: top10List,
      popularList: popularList,
      actionSciFiList: actionSciFiList,
      watchlistIds: watchlistIds ?? this.watchlistIds,
      movieReviews: movieReviews ?? this.movieReviews,
    );
  }
}

class MediaNotifier extends StateNotifier<MediaState> {
  MediaNotifier()
      : super(MediaState(
          heroList: MockData.heroMovies,
          continueWatching: MockData.continueWatchingList,
          top10List: MockData.top10Movies,
          popularList: MockData.popularMovies,
          actionSciFiList: MockData.actionSciFiMovies,
          watchlistIds: {'m1', 'm3'},
          movieReviews: {'m1': MockData.gadiskretekReviews},
        ));

  void toggleWatchlist(String movieId) {
    final updated = Set<String>.from(state.watchlistIds);
    if (updated.contains(movieId)) {
      updated.remove(movieId);
    } else {
      updated.add(movieId);
    }
    state = state.copyWith(watchlistIds: updated);
  }

  void addReview(String movieId, double rating, String comment) {
    final newReview = Review(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      userName: 'Anda (Pengguna)',
      userAvatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: rating,
      comment: comment,
      createdAt: DateTime.now(),
      likesCount: 0,
    );

    final currentReviews = Map<String, List<Review>>.from(state.movieReviews);
    final list = List<Review>.from(currentReviews[movieId] ?? []);
    list.insert(0, newReview);
    currentReviews[movieId] = list;

    state = state.copyWith(movieReviews: currentReviews);
  }

  void updateContinueWatching(String movieId, double progress) {
    final list = List<Movie>.from(state.continueWatching);
    final index = list.indexWhere((m) => m.id == movieId);
    if (index >= 0) {
      list[index] = list[index].copyWith(continueWatchingProgress: progress);
    }
    state = state.copyWith(continueWatching: list);
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
  return MediaNotifier();
});
