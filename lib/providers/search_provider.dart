import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/data/mock_data.dart';
import '../core/network/api_client.dart';
import '../core/network/api_provider.dart';
import '../core/network/api_service.dart';
import '../models/movie_model.dart';

class SearchState {
  final String query;
  final String formatFilter; // 'Semua', 'Film', 'Serial'
  final String countryFilter; // 'Semua', 'Indonesia', 'Korea Selatan', 'Jepang', 'Amerika Serikat'
  final Set<String> selectedGenres;
  final String sortBy; // 'Terpopuler', 'Rating Tertinggi', 'Rilis Terbaru'
  final List<Movie> results;
  final bool isLoading;
  final int currentPage;
  final int pageSize;
  final bool hasMore;
  final bool isLoadingMore;

  const SearchState({
    this.query = '',
    this.formatFilter = 'Semua',
    this.countryFilter = 'Semua',
    this.selectedGenres = const {},
    this.sortBy = 'Terpopuler',
    this.results = const [],
    this.isLoading = false,
    this.currentPage = 0,
    this.pageSize = 10,
    this.hasMore = true,
    this.isLoadingMore = false,
  });

  SearchState copyWith({
    String? query,
    String? formatFilter,
    String? countryFilter,
    Set<String>? selectedGenres,
    String? sortBy,
    List<Movie>? results,
    bool? isLoading,
    int? currentPage,
    int? pageSize,
    bool? hasMore,
    bool? isLoadingMore,
  }) {
    return SearchState(
      query: query ?? this.query,
      formatFilter: formatFilter ?? this.formatFilter,
      countryFilter: countryFilter ?? this.countryFilter,
      selectedGenres: selectedGenres ?? this.selectedGenres,
      sortBy: sortBy ?? this.sortBy,
      results: results ?? this.results,
      isLoading: isLoading ?? this.isLoading,
      currentPage: currentPage ?? this.currentPage,
      pageSize: pageSize ?? this.pageSize,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    );
  }
}

class SearchNotifier extends StateNotifier<SearchState> {
  final ApiService? apiService;
  CancelToken? _cancelToken;
  List<Movie> _currentFilteredCache = [];

  SearchNotifier({this.apiService}) : super(const SearchState()) {
    performSearch('');
  }

  CancelToken? get currentCancelToken => _cancelToken;

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

  void setCountryFilter(String country) {
    state = state.copyWith(countryFilter: country);
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
    // 1. Batalkan request sebelumnya yang masih in-flight untuk mencegah race conditions
    _cancelToken?.cancel('Permintaan pencarian baru dimulai.');
    _cancelToken = CancelToken();
    final token = _cancelToken;

    // 2. Filter in-memory lokal seketika (optimistic / offline fallback)
    var filtered = _allContent.where((item) {
      final matchQuery = searchKey.isEmpty ||
          item.title.toLowerCase().contains(searchKey.toLowerCase()) ||
          item.genre.toLowerCase().contains(searchKey.toLowerCase()) ||
          item.cast.any((c) => c.toLowerCase().contains(searchKey.toLowerCase()));

      bool matchFormat = true;
      if (state.formatFilter == 'Film') {
        matchFormat = !item.durationOrSeasons.contains('Musim');
      } else if (state.formatFilter == 'Serial') {
        matchFormat = item.durationOrSeasons.contains('Musim');
      }

      bool matchCountry = true;
      if (state.countryFilter != 'Semua') {
        matchCountry = item.country.toLowerCase().contains(state.countryFilter.toLowerCase());
      }

      bool matchGenre = true;
      if (state.selectedGenres.isNotEmpty) {
        matchGenre = state.selectedGenres.any((g) => item.genre.toLowerCase().contains(g.toLowerCase()));
      }

      return matchQuery && matchFormat && matchCountry && matchGenre;
    }).toList();

    // Urutkan data lokal
    if (state.sortBy == 'Rating Tertinggi') {
      filtered.sort((a, b) => b.userRating.compareTo(a.userRating));
    } else if (state.sortBy == 'Rilis Terbaru') {
      filtered.sort((a, b) => b.releaseYear.compareTo(a.releaseYear));
    } else {
      filtered.sort((a, b) => b.matchScore.compareTo(a.matchScore));
    }

    _currentFilteredCache = filtered;

    // Ambil halaman awal (page 0) berdasarkan pageSize
    final initialSlice = filtered.take(state.pageSize).toList();
    final hasMore = filtered.length > initialSlice.length;

    state = state.copyWith(
      results: initialSlice,
      currentPage: 0,
      hasMore: hasMore,
      isLoading: false,
      isLoadingMore: false,
    );

    // 3. Jika apiService tersedia, lakukan fetch asinkron dari backend
    if (apiService != null) {
      _fetchFromBackend(searchKey, page: 0, token: token);
    }
  }

  /// Memuat halaman data berikutnya (Infinite Scroll Pagination)
  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore || state.isLoading) {
      return;
    }

    state = state.copyWith(isLoadingMore: true);
    final nextPage = state.currentPage + 1;
    final token = _cancelToken;

    // 1. Ambil potongan berikutnya dari cache in-memory lokal
    final startIndex = nextPage * state.pageSize;
    final nextSlice = _currentFilteredCache.skip(startIndex).take(state.pageSize).toList();
    final hasMoreLocal = _currentFilteredCache.length > (startIndex + nextSlice.length);

    if (nextSlice.isNotEmpty) {
      final currentIds = state.results.map((e) => e.id).toSet();
      final newItems = nextSlice.where((e) => !currentIds.contains(e.id)).toList();
      state = state.copyWith(
        results: [...state.results, ...newItems],
        currentPage: nextPage,
        hasMore: hasMoreLocal,
        isLoadingMore: false,
      );
    } else if (apiService == null) {
      state = state.copyWith(hasMore: false, isLoadingMore: false);
      return;
    }

    // 2. Fetch halaman berikutnya dari backend jika apiService terpasang
    if (apiService != null) {
      await _fetchFromBackend(state.query, page: nextPage, token: token);
    }
  }

  Future<void> _fetchFromBackend(
    String searchKey, {
    int page = 0,
    CancelToken? token,
  }) async {
    try {
      String? backendType;
      if (state.formatFilter == 'Film') backendType = 'MOVIE';
      if (state.formatFilter == 'Serial') backendType = 'TV_SERIES';

      String? backendSort;
      if (state.sortBy == 'Rating Tertinggi') backendSort = 'rating';
      if (state.sortBy == 'Rilis Terbaru') backendSort = 'newest';

      String? backendGenre = state.selectedGenres.isNotEmpty ? state.selectedGenres.first : null;

      final results = await apiService!.getAllMedia(
        search: searchKey.isNotEmpty ? searchKey : null,
        type: backendType,
        genre: backendGenre,
        sortBy: backendSort,
        page: page,
        size: state.pageSize,
        cancelToken: token,
      );

      // Cek apakah token dibatalkan selama proses async berlangsung
      if (token != null && token.isCancelled) return;

      if (results.isNotEmpty) {
        if (page == 0) {
          state = state.copyWith(
            results: results,
            currentPage: 0,
            hasMore: results.length >= state.pageSize,
            isLoading: false,
          );
        } else {
          final currentIds = state.results.map((e) => e.id).toSet();
          final newItems = results.where((e) => !currentIds.contains(e.id)).toList();
          state = state.copyWith(
            results: [...state.results, ...newItems],
            currentPage: page,
            hasMore: results.length >= state.pageSize,
            isLoadingMore: false,
          );
        }
      } else {
        if (page > 0) {
          state = state.copyWith(hasMore: false, isLoadingMore: false);
        }
      }
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) {
        return; // Request dibatalkan oleh user atau search baru, abaikan
      }
      if (page > 0) {
        state = state.copyWith(isLoadingMore: false);
      }
    } catch (_) {
      if (page > 0) {
        state = state.copyWith(isLoadingMore: false);
      }
    }
  }

  @override
  void dispose() {
    _cancelToken?.cancel('SearchNotifier disposed');
    super.dispose();
  }
}

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return SearchNotifier(apiService: apiService);
});

