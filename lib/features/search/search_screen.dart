import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/data/mock_data.dart';
import '../../core/theme/app_theme.dart';
import '../../models/movie_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/media_provider.dart';
import '../../providers/search_provider.dart';
import '../../shared/widgets/notification_modal.dart';
import '../../shared/widgets/streamflix_logo.dart';
import '../detail/content_detail_screen.dart';
import '../player/video_player_screen.dart';

class SearchScreen extends ConsumerStatefulWidget {
  final Function(int)? onNavigateTab;
  const SearchScreen({super.key, this.onNavigateTab});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  late final ScrollController _scrollController;
  final _searchController = TextEditingController();
  Timer? _debounce;
  bool _isListeningVoice = false;

  final List<String> _trendingChips = [
    'The Shadow Strays',
    'Horor Indonesia',
    'Dian Sastrowardoyo',
    'Film Laga & Aksi',
  ];

  final List<String> _genres = [
    'Aksi',
    'Fiksi Ilmiah',
    'Horor',
    'Drama',
    'Komedi',
    'Thriller',
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    // Default state: clean search bar, no pre-selected query or genre
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(const Duration(milliseconds: 250), () {
      ref.read(searchProvider.notifier).setQuery(query);
    });
  }

  void _selectSearchTerm(String term) {
    _searchController.text = term;
    ref.read(searchProvider.notifier).setQuery(term);
  }

  void _openDetail(Movie movie) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ContentDetailScreen(movie: movie)),
    );
  }

  void _openNotificationMedia(String mediaId) {
    final mediaState = ref.read(mediaProvider);
    final allMedia = [
      ...mediaState.heroList,
      ...mediaState.top10List,
      ...MockData.heroMovies,
      ...MockData.top10Movies,
    ];
    final found = allMedia.where((m) => m.id == mediaId).firstOrNull ??
        allMedia.firstOrNull;
    if (found != null) {
      _openDetail(found);
    }
  }

  void _playVideo(Movie movie) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => VideoPlayerScreen(movie: movie)),
    );
  }

  void _resetFilters() {
    _searchController.clear();
    ref.read(searchProvider.notifier).reset();
  }

  Widget _buildFormatChip(
    String formatValue,
    SearchState searchState,
    SearchNotifier notifier, {
    String? label,
  }) {
    final displayLabel = label ?? formatValue;
    final isSelected = searchState.formatFilter == formatValue;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          notifier.setFormatFilter(formatValue);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryContainer : AppColors.surfaceContainerLowest,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? AppColors.primaryContainer
                  : AppColors.outlineVariant.withValues(alpha: 0.25),
            ),
          ),
          child: Center(
            child: Text(
              displayLabel,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showSortSheet(BuildContext context, SearchState searchState, SearchNotifier notifier) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final currentSearch = ref.watch(searchProvider);
          return Container(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(color: AppColors.glassBorder),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Urutkan & Filter Format',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    ),
                    if (currentSearch.sortBy != 'Terpopuler' || currentSearch.formatFilter != 'Semua')
                      GestureDetector(
                        onTap: () {
                          notifier.setSortBy('Terpopuler');
                          notifier.setFormatFilter('Semua');
                          Navigator.pop(ctx);
                        },
                        child: Text(
                          'Reset',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  'TIPE FORMAT',
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildFormatChip('Semua', currentSearch, notifier),
                    const SizedBox(width: 8),
                    _buildFormatChip('Film', currentSearch, notifier),
                    const SizedBox(width: 8),
                    _buildFormatChip('Serial', currentSearch, notifier, label: 'Serial TV'),
                  ],
                ),
                const SizedBox(height: 20),
                Text(
                  'URUTKAN BERDASARKAN',
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 8),
                ...[
                  ('Terpopuler', 'Rekomendasi terbaik dan paling banyak ditonton'),
                  ('Rating Tertinggi', 'Diurutkan dari skor ulasan tertinggi'),
                  ('Rilis Terbaru', 'Produksi dan penayangan terbaru'),
                ].map((item) {
                  final sortTitle = item.$1;
                  final sortDesc = item.$2;
                  final isSelected = currentSearch.sortBy == sortTitle;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.surfaceContainerLowest : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primaryContainer.withValues(alpha: 0.5)
                            : Colors.transparent,
                      ),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      child: ListTile(
                        onTap: () {
                          notifier.setSortBy(sortTitle);
                          Navigator.pop(ctx);
                        },
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        title: Text(
                          sortTitle,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? Colors.white : AppColors.onSurface,
                          ),
                        ),
                        subtitle: Text(
                          sortDesc,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check_circle_rounded, color: AppColors.primaryContainer, size: 20)
                            : null,
                      ),
                    ),
                  );
                }),
              ],
            ),
          );
        },
      ),
    );
  }

  void _triggerVoiceSearch() {
    setState(() {
      _isListeningVoice = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.mic_rounded, color: AppColors.tertiary),
            SizedBox(width: 8),
            Text('Mendengarkan suara... Bicara sekarang.'),
          ],
        ),
        backgroundColor: AppColors.surfaceContainerHigh,
        duration: Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isListeningVoice = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchProvider);
    final searchNotifier = ref.read(searchProvider.notifier);
    final user = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        controller: _scrollController,
        primary: false,
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. App Bar
          SliverAppBar(
            floating: true,
            pinned: true,
            backgroundColor: AppColors.background.withValues(alpha: 0.85),
            elevation: 8,
            shadowColor: Colors.black.withValues(alpha: 0.45),
            titleSpacing: 16,
            title: const StreamFlixLogo(fontSize: 20),
            actions: [
              IconButton(
                tooltip: 'Cast Screen',
                icon: const Icon(Icons.cast_rounded, color: AppColors.onSurface, size: 22),
                onPressed: () {},
              ),
              NotificationIconButton(
                onOpenMediaId: _openNotificationMedia,
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16.0, left: 4.0),
                child: GestureDetector(
                  key: const Key('search_profile_avatar'),
                  onTap: () => widget.onNavigateTab?.call(3),
                  child: Container(
                    width: 34,
                    height: 34,
                    padding: const EdgeInsets.all(1.5),
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [
                          Color(0xFFF59E0B),
                          Color(0xFFF43F5E),
                          Color(0xFF6366F1),
                        ],
                        begin: Alignment.bottomLeft,
                        end: Alignment.topRight,
                      ),
                    ),
                    child: ClipOval(
                      child: CachedNetworkImage(
                        imageUrl: user.avatarUrl,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(color: AppColors.surfaceContainerHigh),
                        errorWidget: (context, url, err) => Container(
                          color: AppColors.surfaceContainerHigh,
                          child: const Icon(Icons.person_rounded, size: 18, color: AppColors.primary),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // 2. Search & Filter Body
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Sleek Search Input Bar (50px pill, clean glass border)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  child: Container(
                    height: 50,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerHigh,
                      borderRadius: BorderRadius.circular(25),
                      border: Border.all(
                        color: _searchController.text.isNotEmpty
                            ? AppColors.primaryContainer.withValues(alpha: 0.6)
                            : AppColors.outlineVariant.withValues(alpha: 0.25),
                        width: 1.0,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.search_rounded,
                          color: AppColors.primary,
                          size: 22,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            onChanged: _onSearchChanged,
                            style: GoogleFonts.inter(
                              color: AppColors.onSurface,
                              fontSize: 14,
                            ),
                            decoration: InputDecoration(
                              hintText: 'Cari film, serial, aktor, atau genre...',
                              hintStyle: GoogleFonts.inter(
                                color: AppColors.onSurfaceVariant.withValues(alpha: 0.5),
                                fontSize: 13,
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                        if (_searchController.text.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                            child: Container(
                              width: 30,
                              height: 30,
                              decoration: const BoxDecoration(shape: BoxShape.circle),
                              child: const Icon(
                                Icons.close_rounded,
                                color: AppColors.onSurfaceVariant,
                                size: 18,
                              ),
                            ),
                          ),
                        Container(
                          width: 1,
                          height: 18,
                          margin: const EdgeInsets.symmetric(horizontal: 6),
                          color: AppColors.surfaceVariant,
                        ),
                        GestureDetector(
                          onTap: _triggerVoiceSearch,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: const BoxDecoration(shape: BoxShape.circle),
                            child: Icon(
                              _isListeningVoice ? Icons.mic_rounded : Icons.mic_none_rounded,
                              color: _isListeningVoice ? AppColors.error : AppColors.tertiary,
                              size: 20,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // 2. Unified Single-Row Filter & Category Bar
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      // Sleek Sort & Format Pill
                      GestureDetector(
                        onTap: () => _showSortSheet(context, searchState, searchNotifier),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: (searchState.sortBy != 'Terpopuler' || searchState.formatFilter != 'Semua')
                                ? AppColors.primaryContainer.withValues(alpha: 0.18)
                                : AppColors.surfaceContainerHigh,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: (searchState.sortBy != 'Terpopuler' || searchState.formatFilter != 'Semua')
                                  ? AppColors.primaryContainer
                                  : AppColors.outlineVariant.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.tune_rounded,
                                size: 15,
                                color: (searchState.sortBy != 'Terpopuler' || searchState.formatFilter != 'Semua')
                                    ? AppColors.primary
                                    : AppColors.onSurfaceVariant,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                searchState.formatFilter == 'Semua'
                                    ? searchState.sortBy
                                    : '${searchState.formatFilter} • ${searchState.sortBy}',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: (searchState.sortBy != 'Terpopuler' || searchState.formatFilter != 'Semua')
                                      ? AppColors.primary
                                      : AppColors.onSurface,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                Icons.keyboard_arrow_down_rounded,
                                size: 16,
                                color: AppColors.onSurfaceVariant,
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Subtle Vertical Divider
                      Container(
                        width: 1,
                        height: 20,
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        color: AppColors.surfaceVariant,
                      ),

                      // "Semua Genre" Pill
                      GestureDetector(
                        onTap: () => searchNotifier.clearAllGenres(),
                        child: Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                          decoration: BoxDecoration(
                            color: searchState.selectedGenres.isEmpty
                                ? AppColors.primaryContainer
                                : AppColors.surfaceContainer,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: searchState.selectedGenres.isEmpty
                                  ? AppColors.primaryContainer
                                  : AppColors.outlineVariant.withValues(alpha: 0.2),
                            ),
                          ),
                          child: Text(
                            'Semua Genre',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: searchState.selectedGenres.isEmpty ? FontWeight.w700 : FontWeight.w500,
                              color: searchState.selectedGenres.isEmpty ? Colors.white : AppColors.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ),

                      // Specific Genre Pills
                      ..._genres.where((g) => g != 'Semua').map((genre) {
                        final isSelected = searchState.selectedGenres.contains(genre);
                        return GestureDetector(
                          onTap: () => searchNotifier.toggleGenre(genre),
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.primaryContainer
                                  : AppColors.surfaceContainer,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.primaryContainer
                                    : AppColors.outlineVariant.withValues(alpha: 0.2),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (isSelected) ...[
                                  const Icon(Icons.check_rounded, color: Colors.white, size: 14),
                                  const SizedBox(width: 4),
                                ],
                                Text(
                                  genre,
                                  style: GoogleFonts.outfit(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                    color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // 3. Dynamic Context: Trending Suggestions (Idle State) or Results Counter (Active State)
                if (_searchController.text.isEmpty &&
                    searchState.selectedGenres.isEmpty &&
                    searchState.formatFilter == 'Semua' &&
                    searchState.sortBy == 'Terpopuler')
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.trending_up_rounded, color: AppColors.tertiary, size: 15),
                            const SizedBox(width: 6),
                            Text(
                              'PENCARIAN POPULER',
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8,
                                color: AppColors.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          child: Row(
                            children: _trendingChips.map((chip) {
                              return GestureDetector(
                                onTap: () => _selectSearchTerm(chip),
                                child: Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceContainerLow,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.search_rounded, size: 13, color: AppColors.textMuted),
                                      const SizedBox(width: 6),
                                      Text(
                                        chip,
                                        style: GoogleFonts.outfit(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.onSurface,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                        const SizedBox(height: 14),
                      ],
                    ),
                  )
                else
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 2, 16, 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${searchState.results.length} Judul Ditemukan',
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.onSurface,
                          ),
                        ),
                        GestureDetector(
                          onTap: _resetFilters,
                          child: Row(
                            children: [
                              const Icon(Icons.refresh_rounded, size: 14, color: AppColors.primary),
                              const SizedBox(width: 4),
                              Text(
                                'Reset Filter',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 10),

                // 2-Column Responsive Movie Poster Grid (HTML grid-cols-2 gap-3.5)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.66,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 14,
                    ),
                    itemCount: searchState.results.length,
                    itemBuilder: (context, index) {
                      final item = searchState.results[index];
                      return GestureDetector(
                        onTap: () => _openDetail(item),
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.surfaceContainerLow,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.6),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Poster Area
                                Expanded(
                                  child: Stack(
                                    fit: StackFit.expand,
                                    children: [
                                      CachedNetworkImage(
                                        imageUrl: item.posterUrl,
                                        fit: BoxFit.cover,
                                        placeholder: (context, url) =>
                                            Container(color: AppColors.surfaceContainer),
                                        errorWidget: (context, url, err) =>
                                            Container(color: AppColors.surfaceContainer),
                                      ),
                                      // Top Scrim
                                      Container(
                                        decoration: const BoxDecoration(
                                          gradient: LinearGradient(
                                            begin: Alignment.bottomCenter,
                                            end: Alignment.topCenter,
                                            colors: [
                                              AppColors.surfaceContainerLowest,
                                              Colors.transparent,
                                            ],
                                            stops: [0.0, 0.45],
                                          ),
                                        ),
                                      ),
                                      // Top Left Badge (Match score)
                                      Positioned(
                                        top: 8,
                                        left: 8,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AppColors.primaryContainer,
                                            borderRadius: BorderRadius.circular(4),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withValues(alpha: 0.4),
                                                blurRadius: 4,
                                              ),
                                            ],
                                          ),
                                          child: Text(
                                            '${item.matchScore.toInt()}% COCOK',
                                            style: GoogleFonts.outfit(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w800,
                                              color: Colors.white,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ),
                                      ),
                                      // Top Right Badge (Resolution)
                                      Positioned(
                                        top: 8,
                                        right: 8,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceContainerLowest.withValues(alpha: 0.8),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            item.resolutionBadges.isNotEmpty
                                                ? item.resolutionBadges.first
                                                : '4K',
                                            style: GoogleFonts.outfit(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w700,
                                              color: AppColors.tertiary,
                                            ),
                                          ),
                                        ),
                                      ),
                                      // Bottom Right Quick Play Floating Button
                                      Positioned(
                                        bottom: 10,
                                        right: 10,
                                        child: GestureDetector(
                                          onTap: () => _playVideo(item),
                                          child: Container(
                                            width: 36,
                                            height: 36,
                                            decoration: BoxDecoration(
                                              color: AppColors.primaryContainer,
                                              shape: BoxShape.circle,
                                              boxShadow: [
                                                BoxShadow(
                                                  color: AppColors.primaryContainer.withValues(alpha: 0.5),
                                                  blurRadius: 10,
                                                  offset: const Offset(0, 2),
                                                ),
                                              ],
                                            ),
                                            child: const Icon(
                                              Icons.play_arrow_rounded,
                                              color: Colors.white,
                                              size: 22,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                // Metadata Text Box
                                Padding(
                                  padding: const EdgeInsets.all(10.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.title,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.outfit(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.onSurface,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Row(
                                        children: [
                                          Text(
                                            '${item.releaseYear}',
                                            style: GoogleFonts.inter(
                                              fontSize: 11,
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                          Container(
                                            width: 3,
                                            height: 3,
                                            margin: const EdgeInsets.symmetric(horizontal: 5),
                                            decoration: const BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: AppColors.surfaceVariant,
                                            ),
                                          ),
                                          Expanded(
                                            child: Text(
                                              item.genre,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: GoogleFonts.inter(
                                                fontSize: 11,
                                                color: AppColors.textSecondary,
                                              ),
                                            ),
                                          ),
                                          Container(
                                            width: 3,
                                            height: 3,
                                            margin: const EdgeInsets.symmetric(horizontal: 5),
                                            decoration: const BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: AppColors.surfaceVariant,
                                            ),
                                          ),
                                          Text(
                                            item.ageRating,
                                            style: GoogleFonts.inter(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.tertiary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Infinite Scroll Async Shimmer Indicator (HTML section: Infinite Scroll Async Shimmer Loader)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryContainer),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Memuat judul lainnya secara instan...',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 80),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
