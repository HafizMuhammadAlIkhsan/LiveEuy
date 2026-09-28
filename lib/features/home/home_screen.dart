import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/data/mock_data.dart';
import '../../core/theme/app_theme.dart';
import '../../models/movie_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/media_provider.dart';
import '../../shared/widgets/notification_modal.dart';
import '../../shared/widgets/streamflix_logo.dart';
import '../detail/content_detail_screen.dart';
import '../player/video_player_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final Function(int) onNavigateTab;

  const HomeScreen({
    super.key,
    required this.onNavigateTab,
  });

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _GenreItem {
  final String name;
  final String subtitle;
  final IconData icon;
  final Color color;

  const _GenreItem({
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.color,
  });
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late final ScrollController _scrollController;
  String _selectedCategory = 'Semua';
  String? _selectedGenre;
  int _currentHeroIndex = 0;
  bool _isHeroMuted = true;

  final List<String> _categories = ['Semua', 'Film', 'Serial TV', 'Kategori'];

  static const List<_GenreItem> _genreDefinitions = [
    _GenreItem(
      name: 'Semua Kategori',
      subtitle: 'Tampilkan seluruh ragam genre tontonan',
      icon: Icons.grid_view_rounded,
      color: AppColors.tertiary,
    ),
    _GenreItem(
      name: 'Aksi & Pahlawan Super',
      subtitle: 'Laga sengit, pertempuran, pahlawan',
      icon: Icons.local_fire_department_rounded,
      color: Color(0xFFFF5252),
    ),
    _GenreItem(
      name: 'Drama & Misteri',
      subtitle: 'Konflik mendalam, periode sejarah, romansa',
      icon: Icons.theater_comedy_rounded,
      color: Color(0xFFFFAB40),
    ),
    _GenreItem(
      name: 'Fiksi Ilmiah (Sci-Fi)',
      subtitle: 'Eksplorasi antariksa, masa depan, siber',
      icon: Icons.rocket_launch_rounded,
      color: Color(0xFF40C4FF),
    ),
    _GenreItem(
      name: 'Horor & Thriller',
      subtitle: 'Ketegangan gaib, misteri mencekam',
      icon: Icons.nights_stay_rounded,
      color: Color(0xFFB388FF),
    ),
    _GenreItem(
      name: 'Komedi',
      subtitle: 'Canda tawa & hiburan keluarga segar',
      icon: Icons.sentiment_very_satisfied_rounded,
      color: Color(0xFFFFD740),
    ),
    _GenreItem(
      name: 'Kriminal & Heist',
      subtitle: 'Aksi pencurian, sindikat, investigasi',
      icon: Icons.security_rounded,
      color: Color(0xFFFF6E40),
    ),
    _GenreItem(
      name: 'Animasi & Petualangan',
      subtitle: 'Petualangan visual animasi memukau',
      icon: Icons.animation_rounded,
      color: Color(0xFFFF4081),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  List<Movie> get _allCatalog {
    final seen = <String>{};
    final combined = [
      ...MockData.heroMovies,
      ...MockData.top10Movies,
      ...MockData.actionSciFiMovies,
      ...MockData.popularMovies,
      ...MockData.searchCatalog,
      ...MockData.continueWatchingList,
    ];
    return combined.where((item) => seen.add(item.id)).toList();
  }

  bool _matchesFormat(Movie movie) {
    if (_selectedCategory == 'Film') {
      return !movie.durationOrSeasons.toLowerCase().contains('musim');
    }
    if (_selectedCategory == 'Serial TV') {
      return movie.durationOrSeasons.toLowerCase().contains('musim');
    }
    return true;
  }

  bool _matchesGenre(Movie movie, String? genre) {
    if (genre == null || genre == 'Semua Kategori') return true;
    final g = genre.toLowerCase();
    final mg = movie.genre.toLowerCase();
    final title = movie.title.toLowerCase();
    final syn = movie.synopsis.toLowerCase();
    final combined = '$mg $title $syn';

    if (g.contains('aksi') || g.contains('laga')) {
      return combined.contains('aksi') ||
          combined.contains('laga') ||
          combined.contains('pahlawan') ||
          combined.contains('militer') ||
          combined.contains('heist');
    }
    if (g.contains('drama')) {
      return combined.contains('drama') ||
          combined.contains('periode') ||
          combined.contains('biografi') ||
          combined.contains('romansa');
    }
    if (g.contains('fiksi') || g.contains('sci-fi')) {
      return combined.contains('sci-fi') ||
          combined.contains('fiksi') ||
          combined.contains('sains') ||
          combined.contains('biopunk') ||
          combined.contains('distopia') ||
          combined.contains('cyber') ||
          combined.contains('kosmik') ||
          combined.contains('lubang hitam') ||
          combined.contains('nebula') ||
          combined.contains('orbit');
    }
    if (g.contains('horor') || g.contains('thriller')) {
      return combined.contains('horor') ||
          combined.contains('thriller') ||
          combined.contains('setan') ||
          combined.contains('kubur') ||
          combined.contains('jahanam') ||
          combined.contains('misteri');
    }
    if (g.contains('komedi')) {
      return combined.contains('komedi') ||
          combined.contains('lucu') ||
          combined.contains('laen') ||
          combined.contains('canda');
    }
    if (g.contains('kriminal') || g.contains('heist')) {
      return combined.contains('heist') ||
          combined.contains('kriminal') ||
          combined.contains('mafia') ||
          combined.contains('triad') ||
          combined.contains('mencuri');
    }
    if (g.contains('animasi')) {
      return combined.contains('animasi') ||
          combined.contains('anime') ||
          combined.contains('kartun') ||
          combined.contains('juki');
    }
    return combined.contains(g);
  }

  bool _matchesFilter(Movie movie) {
    return _matchesFormat(movie) && _matchesGenre(movie, _selectedGenre);
  }

  List<Movie> _getFilteredHeroMovies(List<Movie> defaultHeroes) {
    var filtered = defaultHeroes.where(_matchesFilter).toList();
    if (filtered.isEmpty) {
      filtered = _allCatalog.where(_matchesFilter).toList();
    }
    if (filtered.isEmpty) {
      filtered = defaultHeroes;
    }
    return filtered;
  }

  List<Movie> _getFilteredContinueWatching(List<Movie> allCw) {
    return allCw.where(_matchesFilter).toList();
  }

  List<Movie> _getFilteredTop10(List<Movie> defaultTop10) {
    if (_selectedCategory == 'Serial TV') {
      var series = _allCatalog
          .where((m) => m.durationOrSeasons.toLowerCase().contains('musim'))
          .toList();
      if (_selectedGenre != null) {
        final gFiltered =
            series.where((m) => _matchesGenre(m, _selectedGenre)).toList();
        if (gFiltered.isNotEmpty) series = gFiltered;
      }
      return series.isNotEmpty
          ? series
          : defaultTop10
              .where((m) => m.durationOrSeasons.toLowerCase().contains('musim'))
              .toList();
    }
    if (_selectedCategory == 'Film') {
      var films = _allCatalog
          .where((m) => !m.durationOrSeasons.toLowerCase().contains('musim'))
          .toList();
      if (_selectedGenre != null) {
        final gFiltered =
            films.where((m) => _matchesGenre(m, _selectedGenre)).toList();
        if (gFiltered.isNotEmpty) films = gFiltered;
      }
      return films.take(10).toList();
    }
    if (_selectedGenre != null) {
      var genreItems =
          _allCatalog.where((m) => _matchesGenre(m, _selectedGenre)).toList();
      return genreItems.isNotEmpty ? genreItems.take(10).toList() : defaultTop10;
    }
    return defaultTop10;
  }

  List<Movie> _getFilteredPopular(List<Movie> defaultPopular) {
    var items = defaultPopular.where(_matchesFilter).toList();
    if (items.isEmpty) {
      items = _allCatalog.where(_matchesFilter).toList();
    }
    return items;
  }

  void _openDetail(Movie movie) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ContentDetailScreen(movie: movie),
      ),
    );
  }

  void _openNotificationMedia(String mediaId) {
    final mediaState = ref.read(mediaProvider);
    final allMedia = [
      ...mediaState.heroList,
      ...mediaState.top10List,
      ..._allCatalog,
    ];
    final found = allMedia.where((m) => m.id == mediaId).firstOrNull ??
        allMedia.firstOrNull;
    if (found != null) {
      _openDetail(found);
    }
  }

  void _playVideo(Movie movie, {double? startProgress}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => VideoPlayerScreen(
          movie: movie,
          startProgress: startProgress,
        ),
      ),
    );
  }

  void _showCategoryFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
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
                width: 40,
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
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.category_rounded,
                          color: AppColors.primaryContainer,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Kategori & Genre',
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                            ),
                            Text(
                              'Saring tontonan berdasarkan preferensi Anda',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 18),
            ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.55,
              ),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  children: _genreDefinitions.map((genreDef) {
                    final isSelected =
                        (genreDef.name == 'Semua Kategori' && _selectedGenre == null) ||
                            _selectedGenre == genreDef.name;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primaryContainer.withValues(alpha: 0.18)
                            : AppColors.surfaceContainer,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primaryContainer
                              : AppColors.outlineVariant.withValues(alpha: 0.15),
                          width: isSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 2),
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: genreDef.color.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(genreDef.icon,
                                color: genreDef.color, size: 20),
                          ),
                          title: Text(
                            genreDef.name,
                            style: GoogleFonts.outfit(
                              color: isSelected ? Colors.white : AppColors.onSurface,
                              fontWeight:
                                  isSelected ? FontWeight.w700 : FontWeight.w500,
                              fontSize: 15,
                            ),
                          ),
                          subtitle: Text(
                            genreDef.subtitle,
                            style: GoogleFonts.inter(
                              color: isSelected
                                  ? AppColors.tertiary
                                  : AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          trailing: isSelected
                              ? const Icon(Icons.check_circle_rounded,
                                  color: AppColors.primaryContainer, size: 22)
                              : const Icon(Icons.chevron_right_rounded,
                                  color: AppColors.textSecondary, size: 18),
                          onTap: () {
                            Navigator.pop(ctx);
                            setState(() {
                              if (genreDef.name == 'Semua Kategori') {
                                _selectedGenre = null;
                              } else {
                                _selectedGenre = genreDef.name;
                              }
                              _currentHeroIndex = 0;
                            });
                          },
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCastModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.95),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.cast_rounded, color: AppColors.primaryContainer),
                const SizedBox(width: 10),
                Text(
                  'Transmisikan ke Perangkat (Cast)',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.tv_rounded, color: AppColors.tertiary),
              ),
              title: Text(
                'Living Room Smart TV',
                style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                'Tersedia • Wi-Fi 5GHz',
                style: GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 12),
              ),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Terhubung ke Living Room Smart TV'),
                    backgroundColor: AppColors.primaryContainer,
                  ),
                );
              },
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.airplay_rounded, color: AppColors.primary),
              ),
              title: Text(
                'Bedroom Smart TV (AirPlay)',
                style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                'Tersedia • AirPlay 2',
                style: GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 12),
              ),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Terhubung ke Bedroom Smart TV (AirPlay)'),
                    backgroundColor: AppColors.primaryContainer,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final media = ref.watch(mediaProvider);
    final user = ref.watch(authProvider);

    final filteredHeroMovies = _getFilteredHeroMovies(media.heroList);
    final filteredCW = _getFilteredContinueWatching(media.continueWatching);
    final filteredTop10 = _getFilteredTop10(media.top10List);
    final filteredPopular = _getFilteredPopular(media.popularList);
    final actionMovies = _allCatalog
        .where((m) => _matchesFilter(m) && _matchesGenre(m, 'Aksi & Pahlawan Super'))
        .toList();
    final dramaMovies = _allCatalog
        .where((m) =>
            _matchesFilter(m) &&
            _matchesGenre(m, 'Drama & Misteri') &&
            m.id != 'm1')
        .toList();
    final horrorMovies = _allCatalog
        .where((m) => _matchesFilter(m) && _matchesGenre(m, 'Horor & Thriller'))
        .toList();

    final hasContent = filteredCW.isNotEmpty ||
        filteredTop10.isNotEmpty ||
        filteredPopular.isNotEmpty ||
        actionMovies.isNotEmpty ||
        dramaMovies.isNotEmpty ||
        horrorMovies.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        controller: _scrollController,
        primary: false,
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. Fixed / Floating StreamFlix Top App Bar
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
                onPressed: _showCastModal,
              ),
              NotificationIconButton(
                onOpenMediaId: _openNotificationMedia,
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16.0, left: 4.0),
                child: GestureDetector(
                  key: const Key('home_profile_avatar'),
                  onTap: () => widget.onNavigateTab(3),
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

          // 2. Main Content Body
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category Selector Filter Bar (Semua, Film, Serial TV, Kategori)
                _buildCategoryPills(),

                // Active Filter Indicator Bar
                if (_selectedCategory != 'Semua' || _selectedGenre != null) ...[
                  _buildActiveFilterIndicator(),
                ],

                const SizedBox(height: 8),

                // Hero Showcase
                _buildHeroShowcase(filteredHeroMovies),

                const SizedBox(height: 24),

                // Lanjutkan Menonton (Continue Watching)
                if (filteredCW.isNotEmpty) ...[
                  _buildSectionTitle(
                    title: _selectedCategory == 'Serial TV'
                        ? 'Lanjutkan Menonton Serial'
                        : 'Lanjutkan Menonton',
                    onSeeAll: () => widget.onNavigateTab(2),
                  ),
                  const SizedBox(height: 12),
                  _buildContinueWatchingRow(filteredCW),
                  const SizedBox(height: 28),
                ],

                // Top 10 di Indonesia Hari Ini
                if (filteredTop10.isNotEmpty) ...[
                  _buildSectionTitle(
                    title: _selectedCategory == 'Serial TV'
                        ? 'Top 10 Serial TV di Indonesia Hari Ini'
                        : (_selectedCategory == 'Film'
                            ? 'Top 10 Film di Indonesia Hari Ini'
                            : (_selectedGenre != null
                                ? 'Top 10 $_selectedGenre di Indonesia'
                                : 'Top 10 Film di Indonesia Hari Ini')),
                  ),
                  const SizedBox(height: 12),
                  _buildTop10Row(filteredTop10),
                  const SizedBox(height: 28),
                ],

                // Sedang Populer di Indonesia (PRD 5.4 & README 4)
                if (filteredPopular.isNotEmpty) ...[
                  _buildSectionTitle(
                    title: _selectedCategory == 'Serial TV'
                        ? 'Serial TV Populer di Indonesia'
                        : (_selectedCategory == 'Film'
                            ? 'Film Populer di Indonesia'
                            : (_selectedGenre != null
                                ? 'Populer dalam $_selectedGenre'
                                : 'Sedang Populer di Indonesia')),
                    onSeeAll: () => widget.onNavigateTab(1),
                  ),
                  const SizedBox(height: 12),
                  _buildTrendingAksiSciFi(filteredPopular),
                  const SizedBox(height: 28),
                ],

                // Baris Kategori Tematik: Sedang Tren: Aksi & Fiksi Ilmiah (PRD 5.4 & README 4)
                if (actionMovies.isNotEmpty &&
                    _selectedGenre != 'Drama & Misteri' &&
                    _selectedGenre != 'Horor & Thriller') ...[
                  _buildSectionTitle(
                    title: _selectedCategory == 'Serial TV'
                        ? 'Serial Aksi & Supernatural'
                        : 'Sedang Tren: Aksi & Fiksi Ilmiah',
                    onSeeAll: () => widget.onNavigateTab(1),
                  ),
                  const SizedBox(height: 12),
                  _buildTrendingAksiSciFi(actionMovies),
                  const SizedBox(height: 28),
                ],

                // Baris Kategori Tematik: Drama Periode & Sinema Unggulan (PRD 5.4 & README 4)
                if (dramaMovies.isNotEmpty &&
                    _selectedGenre != 'Aksi & Pahlawan Super' &&
                    _selectedGenre != 'Horor & Thriller') ...[
                  _buildSectionTitle(
                    title: _selectedCategory == 'Serial TV'
                        ? 'Serial Drama & Misteri Unggulan'
                        : 'Drama Periode & Sinema Unggulan',
                    onSeeAll: () => widget.onNavigateTab(1),
                  ),
                  const SizedBox(height: 12),
                  _buildTrendingAksiSciFi(dramaMovies),
                  const SizedBox(height: 28),
                ],

                // Baris Kategori Tematik: Horor & Sensasi Ketegangan (PRD 5.4 & README 4)
                if (horrorMovies.isNotEmpty &&
                    _selectedGenre != 'Aksi & Pahlawan Super' &&
                    _selectedGenre != 'Drama & Misteri') ...[
                  _buildSectionTitle(
                    title: _selectedCategory == 'Serial TV'
                        ? 'Serial Horor & Supernatural'
                        : 'Horor & Sensasi Ketegangan',
                    onSeeAll: () => widget.onNavigateTab(1),
                  ),
                  const SizedBox(height: 12),
                  _buildTrendingAksiSciFi(horrorMovies),
                  const SizedBox(height: 28),
                ],

                // Empty state if no content matches the specific filter
                if (!hasContent) ...[
                  _buildEmptyFilterState(),
                ],

                const SizedBox(height: 100), // Spacing for floating navbar
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveFilterIndicator() {
    String label = '';
    if (_selectedCategory != 'Semua' && _selectedGenre != null) {
      label = 'Format: $_selectedCategory • Genre: $_selectedGenre';
    } else if (_selectedCategory != 'Semua') {
      label = 'Format: $_selectedCategory';
    } else if (_selectedGenre != null) {
      label = 'Kategori: $_selectedGenre';
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Row(
              children: [
                const Icon(Icons.tune_rounded, size: 15, color: AppColors.tertiary),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.tertiary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              setState(() {
                _selectedCategory = 'Semua';
                _selectedGenre = null;
                _currentHeroIndex = 0;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.outlineVariant.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.refresh_rounded, size: 13, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Text(
                    'Atur Ulang',
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyFilterState() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerHigh.withValues(alpha: 0.6),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.movie_filter_rounded,
              color: AppColors.tertiary,
              size: 48,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Tidak Ada Tayangan Ditemukan',
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tidak ada konten yang sesuai dengan filter "$_selectedCategory" dan genre "$_selectedGenre".',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _selectedCategory = 'Semua';
                _selectedGenre = null;
                _currentHeroIndex = 0;
              });
            },
            icon: const Icon(Icons.refresh_rounded, size: 18, color: Colors.white),
            label: Text(
              'Atur Ulang Filter',
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryContainer,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryPills() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: _categories.map((cat) {
            final isKategori = cat == 'Kategori';
            final isSelected = isKategori
                ? _selectedGenre != null
                : (_selectedCategory == cat && _selectedGenre == null);

            final displayText = isKategori
                ? (_selectedGenre ?? 'Kategori')
                : cat;

            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: GestureDetector(
                key: Key('category_pill_$cat'),
                onTap: () {
                  if (isKategori) {
                    _showCategoryFilterSheet();
                  } else {
                    setState(() {
                      if (_selectedCategory == cat && cat != 'Semua') {
                        // Toggle back to Semua if tapped again
                        _selectedCategory = 'Semua';
                      } else {
                        _selectedCategory = cat;
                        if (cat == 'Semua') {
                          _selectedGenre = null;
                        }
                      }
                      _currentHeroIndex = 0;
                    });
                  }
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: EdgeInsets.symmetric(
                    horizontal: isKategori ? 14 : 16,
                    vertical: 7,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primaryContainer
                        : AppColors.surfaceContainerHigh,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.primaryContainer.withValues(alpha: 0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        displayText,
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
                        ),
                      ),
                      if (isKategori) ...[
                        const SizedBox(width: 4),
                        if (_selectedGenre != null)
                          GestureDetector(
                            key: const Key('clear_selected_genre_btn'),
                            onTap: () {
                              setState(() {
                                _selectedGenre = null;
                                _currentHeroIndex = 0;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.25),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close_rounded,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                          )
                        else
                          const Icon(
                            Icons.expand_more_rounded,
                            size: 16,
                            color: AppColors.onSurfaceVariant,
                          ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildHeroShowcase(List<Movie> heroMovies) {
    if (heroMovies.isEmpty) return const SizedBox.shrink();
    final clampedIndex = _currentHeroIndex.clamp(0, heroMovies.length - 1);
    final heroMovie = heroMovies[clampedIndex];
    final media = ref.watch(mediaProvider);
    final isHeroBookmarked = media.watchlistIds.contains(heroMovie.id);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: GestureDetector(
        onHorizontalDragEnd: (details) {
          if (heroMovies.length <= 1) return;
          if (details.primaryVelocity! < -100) {
            // swipe left -> next
            setState(() {
              _currentHeroIndex = (_currentHeroIndex + 1) % heroMovies.length;
            });
          } else if (details.primaryVelocity! > 100) {
            // swipe right -> prev
            setState(() {
              _currentHeroIndex =
                  (_currentHeroIndex - 1 + heroMovies.length) % heroMovies.length;
            });
          }
        },
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.85),
                blurRadius: 40,
                offset: const Offset(0, 16),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              children: [
                // Hero Poster / Backdrop Image
                AspectRatio(
                  aspectRatio: 4 / 5,
                  child: CachedNetworkImage(
                    imageUrl: heroMovie.backdropUrl,
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    placeholder: (context, url) =>
                        Container(color: AppColors.surfaceContainerLow),
                    errorWidget: (context, url, err) =>
                        Container(color: AppColors.surfaceContainerLow),
                  ),
                ),

                // Gradient Scrim Overlays
                Positioned.fill(
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          AppColors.surfaceContainerLowest,
                          Color(0x990D0D17),
                          Colors.transparent,
                        ],
                        stops: [0.0, 0.45, 0.85],
                      ),
                    ),
                  ),
                ),
                Positioned.fill(
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: [
                          Color(0xCC0D0D17),
                          Colors.transparent,
                        ],
                        stops: [0.0, 0.6],
                      ),
                    ),
                  ),
                ),

                // Top Left Badge: Top 1 Hari Ini or Format badge
                Positioned(
                  top: 14,
                  left: 14,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryContainer.withValues(alpha: 0.5),
                          blurRadius: 12,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.local_fire_department_rounded,
                          color: Colors.white,
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          heroMovie.top10Rank != null
                              ? 'TOP ${heroMovie.top10Rank} HARI INI'
                              : 'TOP 1 HARI INI',
                          style: GoogleFonts.outfit(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Top Right Sound Button
                Positioned(
                  top: 14,
                  right: 14,
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _isHeroMuted = !_isHeroMuted;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(_isHeroMuted
                              ? 'Suara latar dibisukan'
                              : 'Suara latar diaktifkan'),
                          duration: const Duration(seconds: 1),
                          backgroundColor: AppColors.surfaceContainerHigh,
                        ),
                      );
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerHighest.withValues(alpha: 0.65),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _isHeroMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                  ),
                ),

                // Bottom Overlay Details & Actions
                Positioned(
                  bottom: 16,
                  left: 16,
                  right: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Carousel Indicator Dots (if multiple)
                      if (heroMovies.length > 1) ...[
                        Row(
                          children: List.generate(heroMovies.length, (idx) {
                            final isActive = idx == clampedIndex;
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              margin: const EdgeInsets.only(right: 5),
                              width: isActive ? 20 : 6,
                              height: 5,
                              decoration: BoxDecoration(
                                color: isActive
                                    ? AppColors.primaryContainer
                                    : Colors.white.withValues(alpha: 0.35),
                                borderRadius: BorderRadius.circular(3),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 10),
                      ],

                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const NeverScrollableScrollPhysics(),
                        child: Row(
                          children: [
                            Text(
                              '${heroMovie.matchScore.toInt()}% Cocok',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF46D369),
                              ),
                            ),
                            _buildDotSeparator(),
                            Text(
                              '${heroMovie.releaseYear}',
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white70,
                              ),
                            ),
                            _buildDotSeparator(),
                            _buildHeroMetaPill(heroMovie.ageRating),
                            if (heroMovie.resolutionBadges.isNotEmpty) ...[
                              const SizedBox(width: 6),
                              _buildHeroMetaPill(
                                heroMovie.resolutionBadges.firstWhere(
                                  (b) => !b.toLowerCase().contains('atmos'),
                                  orElse: () => '4K UHD',
                                ),
                              ),
                            ],
                            _buildDotSeparator(),
                            Text(
                              heroMovie.durationOrSeasons,
                              style: GoogleFonts.outfit(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Title
                      Text(
                        heroMovie.title,
                        style: GoogleFonts.outfit(
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.5,
                          height: 1.15,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Synopsis
                      Text(
                        heroMovie.synopsis,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.white.withValues(alpha: 0.8),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Hero Action Buttons (Putar, Koleksi Saya, Info)
                      Row(
                        children: [
                          // Putar
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _playVideo(heroMovie),
                              icon: const Icon(
                                Icons.play_arrow_rounded,
                                color: Colors.white,
                                size: 22,
                              ),
                              label: Text(
                                'Putar',
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryContainer,
                                elevation: 6,
                                shadowColor: AppColors.primaryContainer.withValues(alpha: 0.5),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(24),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),

                          // Koleksi Saya
                          OutlinedButton.icon(
                            onPressed: () {
                              ref
                                  .read(mediaProvider.notifier)
                                  .toggleWatchlist(heroMovie.id);
                              final willBeBookmarked = !isHeroBookmarked;
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(willBeBookmarked
                                      ? 'Ditambahkan ke Koleksi Saya'
                                      : 'Dihapus dari Koleksi Saya'),
                                  duration: const Duration(seconds: 2),
                                  backgroundColor: AppColors.surfaceContainerHigh,
                                ),
                              );
                            },
                            icon: Icon(
                              isHeroBookmarked ? Icons.check_rounded : Icons.add_rounded,
                              color: isHeroBookmarked ? AppColors.tertiary : Colors.white,
                              size: 18,
                            ),
                            label: Text(
                              'Koleksi Saya',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: isHeroBookmarked ? AppColors.tertiary : Colors.white,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: AppColors.surfaceContainerHigh.withValues(alpha: 0.9),
                              side: BorderSide.none,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(24),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),

                          // Info Detail Button
                          GestureDetector(
                            onTap: () => _openDetail(heroMovie),
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.surfaceContainerHigh.withValues(alpha: 0.7),
                              ),
                              child: const Icon(
                                Icons.info_outline_rounded,
                                color: Colors.white,
                                size: 20,
                              ),
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
      ),
    );
  }

  Widget _buildDotSeparator() {
    return Container(
      width: 3.5,
      height: 3.5,
      margin: const EdgeInsets.symmetric(horizontal: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.45),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildHeroMetaPill(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.18),
          width: 0.8,
        ),
      ),
      child: Text(
        label,
        style: GoogleFonts.outfit(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: Colors.white.withValues(alpha: 0.9),
          letterSpacing: 0.4,
        ),
      ),
    );
  }

  Widget _buildSectionTitle({required String title, VoidCallback? onSeeAll}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Row(
              children: [
                Container(
                  width: 4,
                  height: 16,
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                      color: AppColors.onSurface,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (onSeeAll != null)
            GestureDetector(
              onTap: onSeeAll,
              child: Row(
                children: [
                  Text(
                    'Semua',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    size: 16,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildContinueWatchingRow(List<Movie> list) {
    return SizedBox(
      height: 192,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: list.length,
        itemBuilder: (context, index) {
          final item = list[index];
          return Container(
            width: 230,
            margin: const EdgeInsets.only(right: 14),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainer,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: AppColors.outlineVariant.withValues(alpha: 0.15),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Video thumbnail with play button overlay -> TAPPING PLAYS AND RESUMES PROGRESS
                GestureDetector(
                  onTap: () => _playVideo(item, startProgress: item.continueWatchingProgress),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                    child: Stack(
                      children: [
                        AspectRatio(
                          aspectRatio: 16 / 9,
                          child: CachedNetworkImage(
                            imageUrl: item.posterUrl,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(color: AppColors.surfaceContainerHigh),
                            errorWidget: (context, url, err) => Container(color: AppColors.surfaceContainerHigh),
                          ),
                        ),
                        Positioned.fill(
                          child: Container(
                            color: Colors.black.withValues(alpha: 0.25),
                            child: Center(
                              child: Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: AppColors.surface.withValues(alpha: 0.85),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.play_arrow_rounded,
                                  color: Colors.white,
                                  size: 22,
                                ),
                              ),
                            ),
                          ),
                        ),
                        // Progress Bar Bottom
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: LinearProgressIndicator(
                            value: item.continueWatchingProgress,
                            backgroundColor: AppColors.surfaceContainerHighest,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              AppColors.primaryContainer,
                            ),
                            minHeight: 3.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // 2. Bottom info bar -> TAPPING BAR OPENS DETAIL, TAPPING 3-DOTS OPENS FULL OPTIONS
                Expanded(
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(14)),
                      onTap: () => _openDetail(item),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(10, 6, 4, 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    item.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.onSurface,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item.durationOrSeasons,
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(
                                Icons.more_vert_rounded,
                                color: AppColors.textSecondary,
                                size: 19,
                              ),
                              splashRadius: 18,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                              tooltip: 'Pilihan lainnya',
                              onPressed: () => _showContinueWatchingOptions(context, item, index),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showContinueWatchingOptions(BuildContext context, Movie item, int itemIndex) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (bottomSheetContext) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Movie Preview Card Header
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: CachedNetworkImage(
                      imageUrl: item.posterUrl,
                      width: 50,
                      height: 70,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: AppColors.surfaceContainerHighest),
                      errorWidget: (context, url, err) => Container(color: AppColors.surfaceContainerHighest),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.onSurface,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${item.durationOrSeasons} • ${(item.continueWatchingProgress * 100).toInt()}% selesai',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(2),
                          child: LinearProgressIndicator(
                            value: item.continueWatchingProgress,
                            backgroundColor: AppColors.surfaceContainerHighest,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryContainer),
                            minHeight: 3.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: AppColors.glassBorder, height: 1),
              const SizedBox(height: 8),

              // Action 1: Lanjutkan Menonton
              _buildContinueOptionTile(
                icon: Icons.play_arrow_rounded,
                title: 'Lanjutkan Menonton',
                subtitle: 'Mulai dari posisi terakhir (${(item.continueWatchingProgress * 100).toInt()}%)',
                iconColor: AppColors.primaryContainer,
                onTap: () {
                  Navigator.pop(bottomSheetContext);
                  _playVideo(item, startProgress: item.continueWatchingProgress);
                },
              ),

              // Action 2: Lihat Info & Detail Tayangan
              _buildContinueOptionTile(
                icon: Icons.info_outline_rounded,
                title: 'Lihat Detail & Episode',
                subtitle: 'Sinopsis, daftar episode, pemain, dan ulasan',
                onTap: () {
                  Navigator.pop(bottomSheetContext);
                  _openDetail(item);
                },
              ),

              // Action 3: Unduh Offline
              _buildContinueOptionTile(
                icon: Icons.download_rounded,
                title: 'Unduh Tayangan',
                subtitle: 'Simpan ke perangkat untuk ditonton offline',
                onTap: () {
                  Navigator.pop(bottomSheetContext);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(Icons.downloading_rounded, color: AppColors.tertiary, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Mengunduh "${item.title}" untuk offline...',
                              style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurface),
                            ),
                          ),
                        ],
                      ),
                      backgroundColor: AppColors.surfaceContainerHigh,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
              ),

              // Action 4: Bagikan Tayangan
              _buildContinueOptionTile(
                icon: Icons.share_rounded,
                title: 'Bagikan Tayangan',
                subtitle: 'Salin tautan atau bagikan ke media sosial',
                onTap: () {
                  Navigator.pop(bottomSheetContext);
                  Clipboard.setData(ClipboardData(
                    text: 'Nonton "${item.title}" di LiveEuy: https://liveeuy.app/watch/${item.id}',
                  ));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(Icons.check_circle_rounded, color: AppColors.tertiary, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Tautan "${item.title}" disalin ke papan klip!',
                              style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurface),
                            ),
                          ),
                        ],
                      ),
                      backgroundColor: AppColors.surfaceContainerHigh,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
              ),

              // Action 5: Hapus dari Lanjutkan Menonton (with Undo)
              _buildContinueOptionTile(
                icon: Icons.delete_outline_rounded,
                title: 'Hapus dari Lanjutkan Menonton',
                subtitle: 'Hapus tayangan ini dari baris beranda',
                iconColor: AppColors.error,
                textColor: AppColors.error,
                onTap: () {
                  Navigator.pop(bottomSheetContext);
                  final removedItem = item;
                  final removedIndex = itemIndex;
                  ref.read(mediaProvider.notifier).removeFromContinueWatching(item.id);

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        '"${removedItem.title}" dihapus dari Lanjutkan Menonton',
                        style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurface),
                      ),
                      action: SnackBarAction(
                        label: 'Batalkan',
                        textColor: AppColors.primaryContainer,
                        onPressed: () {
                          ref.read(mediaProvider.notifier).insertContinueWatching(
                                removedItem,
                                index: removedIndex,
                              );
                        },
                      ),
                      backgroundColor: AppColors.surfaceContainerHigh,
                      duration: const Duration(seconds: 4),
                    ),
                  );
                },
              ),
              const SizedBox(height: 6),
            ],
          ),
        ),
      ),
    ),
  );
  }

  Widget _buildContinueOptionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color? iconColor,
    Color? textColor,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: (iconColor ?? AppColors.textSecondary).withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: iconColor ?? AppColors.textPrimary,
                size: 20,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor ?? AppColors.onSurface,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textSecondary.withValues(alpha: 0.5),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTop10Row(List<Movie> list) {
    return SizedBox(
      height: 195,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: list.length,
        itemBuilder: (context, index) {
          final item = list[index];
          final rank = index + 1;
          return Container(
            width: 175,
            margin: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => _openDetail(item),
              child: Stack(
                alignment: Alignment.bottomLeft,
                children: [
                  // Giant Rank Number with Outline Stroke Style
                  Positioned(
                    left: 0,
                    bottom: -10,
                    child: Stack(
                      children: [
                        Text(
                          '$rank',
                          style: GoogleFonts.outfit(
                            fontSize: 105,
                            fontWeight: FontWeight.w900,
                            foreground: Paint()
                              ..style = PaintingStyle.stroke
                              ..strokeWidth = 3
                              ..color = AppColors.outlineVariant.withValues(alpha: 0.7),
                          ),
                        ),
                        Text(
                          '$rank',
                          style: GoogleFonts.outfit(
                            fontSize: 105,
                            fontWeight: FontWeight.w900,
                            color: AppColors.surfaceContainerLowest,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Poster Card
                  Positioned(
                    right: 4,
                    top: 4,
                    bottom: 4,
                    width: 125,
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.6),
                            blurRadius: 18,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            CachedNetworkImage(
                              imageUrl: item.posterUrl,
                              fit: BoxFit.cover,
                            ),
                            Container(
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                  colors: [
                                    AppColors.surfaceContainerLowest,
                                    Colors.transparent,
                                  ],
                                  stops: [0.0, 0.55],
                                ),
                              ),
                            ),
                            Positioned(
                              bottom: 8,
                              left: 8,
                              right: 8,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    item.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                  Text(
                                    item.genre,
                                    style: GoogleFonts.outfit(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.tertiary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTrendingAksiSciFi(List<Movie> list) {
    return SizedBox(
      height: 235,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: list.length,
        itemBuilder: (context, index) {
          final item = list[index];
          return Container(
            width: 135,
            margin: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () => _openDetail(item),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Poster with Badges
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.5),
                            blurRadius: 14,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            CachedNetworkImage(
                              imageUrl: item.posterUrl,
                              fit: BoxFit.cover,
                            ),
                            // Top left star rating
                            Positioned(
                              top: 8,
                              left: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceContainerLowest.withValues(alpha: 0.8),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.star_rounded,
                                      color: Colors.amber,
                                      size: 12,
                                    ),
                                    const SizedBox(width: 3),
                                    Text(
                                      '${item.userRating}',
                                      style: GoogleFonts.outfit(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            // Bottom right quality badge
                            Positioned(
                              bottom: 8,
                              right: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.tertiaryContainer.withValues(alpha: 0.6),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  item.resolutionBadges.isNotEmpty ? item.resolutionBadges.first : 'HD',
                                  style: GoogleFonts.outfit(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.tertiary,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),

                  Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.onSurface,
                    ),
                  ),
                  Text(
                    item.genre,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
