import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/data/mock_data.dart';
import '../models/movie_model.dart';

class SearchState {
  final String query;
  final String formatFilter; // 'Semua', 'Film', 'Serial'
  final Set<String> selectedGenres;
  final String sortBy; // 'Terpopuler', 'Rating Tertinggi', 'Rilis Terbaru'
  final List<Movie> results;
  final bool isLoading;

  const SearchState({
    this.query = '',
    this.formatFilter = 'Semua',
    this.selectedGenres = const {},
    this.sortBy = 'Terpopuler',
    this.results = const [],
    this.isLoading = false,
  });

  SearchState copyWith({
    String? query,
    String? formatFilter,
    Set<String>? selectedGenres,
    String? sortBy,
    List<Movie>? results,
    bool? isLoading,
  }) {
    return SearchState(
      query: query ?? this.query,
      formatFilter: formatFilter ?? this.formatFilter,
      selectedGenres: selectedGenres ?? this.selectedGenres,
      sortBy: sortBy ?? this.sortBy,
      results: results ?? this.results,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class SearchNotifier extends StateNotifier<SearchState> {
  SearchNotifier() : super(const SearchState()) {
    performSearch('');
  }

  late final List<Movie> _allContent = () {
    final seen = <String>{};
    final combined = [
      ...MockData.searchCatalog,
      ...MockData.actionSciFiMovies,
      ...MockData.heroMovies,
      ...MockData.continueWatchingList,
      ...MockData.top10Movies,
      ...MockData.popularMovies,
    ];
    return combined.where((item) => seen.add(item.id)).toList();
  }();

  void setQuery(String q) {
    state = state.copyWith(query: q);
    performSearch(q);
  }

  void setFormatFilter(String format) {
    state = state.copyWith(formatFilter: format);
    performSearch(state.query);
  }

  void toggleGenre(String genre) {
    final updated = Set<String>.from(state.selectedGenres);
    if (updated.contains(genre)) {
      updated.remove(genre);
    } else {
      updated.add(genre);
    }
    state = state.copyWith(selectedGenres: updated);
    performSearch(state.query);
  }

  void clearAllGenres() {
    state = state.copyWith(selectedGenres: {});
    performSearch(state.query);
  }

  void reset() {
    state = const SearchState();
    performSearch('');
  }

  void setSortBy(String sort) {
    state = state.copyWith(sortBy: sort);
    performSearch(state.query);
  }

  void performSearch(String searchKey) {
    state = state.copyWith(isLoading: true);

    var filtered = _allContent.where((item) {
      // Query search
      final matchQuery = searchKey.isEmpty ||
          item.title.toLowerCase().contains(searchKey.toLowerCase()) ||
          item.genre.toLowerCase().contains(searchKey.toLowerCase()) ||
          item.cast.any((c) => c.toLowerCase().contains(searchKey.toLowerCase()));

      // Format filter
      bool matchFormat = true;
      if (state.formatFilter == 'Film') {
        matchFormat = !item.durationOrSeasons.contains('Musim');
      } else if (state.formatFilter == 'Serial') {
        matchFormat = item.durationOrSeasons.contains('Musim');
      }

      // Genre filter
      bool matchGenre = true;
      if (state.selectedGenres.isNotEmpty) {
        matchGenre = state.selectedGenres.any((g) => item.genre.toLowerCase().contains(g.toLowerCase()));
      }

      return matchQuery && matchFormat && matchGenre;
    }).toList();

    // Sort
    if (state.sortBy == 'Rating Tertinggi') {
      filtered.sort((a, b) => b.userRating.compareTo(a.userRating));
    } else if (state.sortBy == 'Rilis Terbaru') {
      filtered.sort((a, b) => b.releaseYear.compareTo(a.releaseYear));
    } else {
      filtered.sort((a, b) => b.matchScore.compareTo(a.matchScore));
    }

    state = state.copyWith(results: filtered, isLoading: false);
  }
}

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  return SearchNotifier();
});
