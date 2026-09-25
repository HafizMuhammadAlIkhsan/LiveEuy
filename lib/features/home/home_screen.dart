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

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late final ScrollController _scrollController;
  String _selectedCategory = 'Semua';
  bool _isHeroMuted = true;
  bool _isHeroBookmarked = false;

  final List<String> _categories = ['Semua', 'Film', 'Serial TV', 'Kategori'];

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

  void _openDetail(Movie movie) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ContentDetailScreen(movie: movie),
      ),
    );
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
                'Living Room Android TV (4K)',
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
                    content: Text('Terhubung ke Living Room Android TV (4K)'),
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
                'Bedroom Apple TV (Dolby Vision)',
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
                    content: Text('Terhubung ke Bedroom Apple TV'),
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
    final heroMovie = media.heroList.isNotEmpty ? media.heroList.first : MockData.heroMovies.first;

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
              IconButton(
                tooltip: 'Search Catalog',
                icon: const Icon(Icons.search_rounded, color: AppColors.onSurface, size: 22),
                onPressed: () => widget.onNavigateTab(1),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16.0, left: 4.0),
                child: GestureDetector(
                  key: const Key('home_profile_avatar'),
                  onTap: () => widget.onNavigateTab(3),
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primaryContainer, width: 1.5),
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
                // Category Selector Filter Bar
                _buildCategoryPills(),

                const SizedBox(height: 8),

                // Hero Showcase
                _buildHeroShowcase(heroMovie),

                const SizedBox(height: 24),

                // Lanjutkan Menonton (Continue Watching)
                if (media.continueWatching.isNotEmpty) ...[
                  _buildSectionTitle(
                    title: 'Lanjutkan Menonton',
                    onSeeAll: () => widget.onNavigateTab(2),
                  ),
                  const SizedBox(height: 12),
                  _buildContinueWatchingRow(media.continueWatching),
                  const SizedBox(height: 28),
                ],

                // Top 10 Film di Indonesia Hari Ini
                _buildSectionTitle(
                  title: 'Top 10 Film di Indonesia Hari Ini',
                ),
                const SizedBox(height: 12),
                _buildTop10Row(media.top10List),

                const SizedBox(height: 28),

                // Sedang Tren: Aksi & Fiksi Ilmiah
                _buildSectionTitle(
                  title: 'Sedang Tren: Aksi & Fiksi Ilmiah',
                  onSeeAll: () => widget.onNavigateTab(1),
                ),
                const SizedBox(height: 12),
                _buildTrendingAksiSciFi(media.actionSciFiList),

                const SizedBox(height: 100), // Spacing for floating navbar
              ],
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
            final isSelected = _selectedCategory == cat;
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedCategory = cat;
                  });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: EdgeInsets.symmetric(
                    horizontal: cat == 'Kategori' ? 14 : 16,
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
                        cat,
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
                        ),
                      ),
                      if (cat == 'Kategori') ...[
                        const SizedBox(width: 4),
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

  Widget _buildHeroShowcase(Movie heroMovie) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
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
                  placeholder: (context, url) => Container(color: AppColors.surfaceContainerLow),
                  errorWidget: (context, url, err) => Container(color: AppColors.surfaceContainerLow),
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

              // Top Left Badge: Top 1 Hari Ini
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
                        'TOP 1 HARI INI',
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
                    Row(
                      children: [
                        Text(
                          '98% Match',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF46D369),
                          ),
                        ),
                        _buildDotSeparator(),
                        Text(
                          '2024',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                        ),
                        _buildDotSeparator(),
                        _buildHeroMetaPill('18+'),
                        const SizedBox(width: 6),
                        _buildHeroMetaPill('4K UHD'),
                        const SizedBox(width: 6),
                        _buildHeroMetaPill('Dolby Atmos'),
                      ],
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
                            setState(() {
                              _isHeroBookmarked = !_isHeroBookmarked;
                            });
                            ref
                                .read(mediaProvider.notifier)
                                .toggleWatchlist(heroMovie.id);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(_isHeroBookmarked
                                    ? 'Ditambahkan ke Koleksi Saya'
                                    : 'Dihapus dari Koleksi Saya'),
                                duration: const Duration(seconds: 2),
                                backgroundColor: AppColors.surfaceContainerHigh,
                              ),
                            );
                          },
                          icon: Icon(
                            _isHeroBookmarked ? Icons.check_rounded : Icons.add_rounded,
                            color: _isHeroBookmarked ? AppColors.tertiary : Colors.white,
                            size: 18,
                          ),
                          label: Text(
                            'Koleksi Saya',
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: _isHeroBookmarked ? AppColors.tertiary : Colors.white,
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
