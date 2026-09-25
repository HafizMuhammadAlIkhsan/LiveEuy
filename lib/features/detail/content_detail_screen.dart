import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/data/mock_data.dart';
import '../../core/theme/app_theme.dart';
import '../../models/movie_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/media_provider.dart';
import '../auth/login_screen.dart';
import '../player/video_player_screen.dart';

class ContentDetailScreen extends ConsumerStatefulWidget {
  final Movie movie;

  const ContentDetailScreen({
    super.key,
    required this.movie,
  });

  @override
  ConsumerState<ContentDetailScreen> createState() => _ContentDetailScreenState();
}

class _ContentDetailScreenState extends ConsumerState<ContentDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _starRatingKey = GlobalKey();
  final TextEditingController _commentController = TextEditingController();
  final Set<String> _likedReviewIds = {};

  bool _isSynopsisExpanded = false;
  bool _isDownloadingAll = false;
  int _userSelectedRating = 0;
  final Set<String> _downloadedEpisodes = {'gk_ep1'};
  final Set<String> _downloadingEpisodes = {};

  final List<String> _castList = [
    'Dian Sastrowardoyo',
    'Ario Bayu',
    'Putri Marino',
    'Arya Saloka',
  ];

  @override
  void initState() {
    super.initState();
    // Default tab is Episode (index 1) as specified in HTML mockup
    _tabController = TabController(length: 4, vsync: this, initialIndex: 1);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  void _showToast(String message, {IconData icon = Icons.check_circle_rounded, Color color = AppColors.primary}) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.surfaceBright,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _playEpisode(Movie movie) {
    _showToast('Memutar Episode 1: Jeng Yah...', icon: Icons.smart_display_rounded, color: AppColors.primaryContainer);
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => VideoPlayerScreen(movie: movie),
      ),
    );
  }

  void _toggleEpisodeDownload(String epId, String epTitle) {
    if (_downloadedEpisodes.contains(epId)) {
      setState(() {
        _downloadedEpisodes.remove(epId);
      });
      _showToast('Unduhan episode dihapus', icon: Icons.delete_outline_rounded, color: AppColors.outline);
    } else {
      setState(() {
        _downloadingEpisodes.add(epId);
      });
      _showToast('Mengunduh $epTitle...', icon: Icons.downloading_rounded, color: AppColors.tertiary);

      Future.delayed(const Duration(milliseconds: 1400), () {
        if (mounted) {
          setState(() {
            _downloadingEpisodes.remove(epId);
            _downloadedEpisodes.add(epId);
          });
          _showToast('Episode selesai diunduh', icon: Icons.download_done_rounded, color: AppColors.tertiary);
        }
      });
    }
  }

  void _handleQuickRate() {
    final user = ref.read(authProvider);
    _tabController.animateTo(3);
    if (!user.isLoggedIn) {
      _showToast(
        'Silakan masuk terlebih dahulu untuk memberikan nilai & ulasan',
        icon: Icons.lock_outline_rounded,
        color: AppColors.error,
      );
    } else {
      Future.delayed(const Duration(milliseconds: 300), () {
        if (_starRatingKey.currentContext != null) {
          Scrollable.ensureVisible(
            _starRatingKey.currentContext!,
            duration: const Duration(milliseconds: 400),
            curve: Curves.easeInOut,
          );
        }
      });
    }
  }

  String _formatReviewDate(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) {
      if (diff.inMinutes <= 1) return 'Baru saja';
      return '${diff.inMinutes} menit lalu';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} jam lalu';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} hari lalu';
    } else if (diff.inDays < 30) {
      final weeks = (diff.inDays / 7).floor();
      return '$weeks minggu lalu';
    } else {
      final months = (diff.inDays / 30).floor();
      return '$months bulan lalu';
    }
  }

  @override
  Widget build(BuildContext context) {
    final mediaState = ref.watch(mediaProvider);
    final user = ref.watch(authProvider);
    final isWatchlist = mediaState.watchlistIds.contains(widget.movie.id);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. App Bar
          SliverAppBar(
            pinned: true,
            backgroundColor: AppColors.background.withValues(alpha: 0.85),
            elevation: 6,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: AppColors.onSurface),
              onPressed: () => Navigator.pop(context),
            ),
            titleSpacing: 0,
            title: Text(
              'Detail Tayangan',
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.outfit(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.onSurface,
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_rounded, color: AppColors.onSurface, size: 22),
                onPressed: () {
                  _showToast('Tautan serial berhasil disalin ke clipboard', icon: Icons.share_rounded);
                },
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16.0, left: 4.0),
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primaryContainer, width: 1.5),
                    image: DecorationImage(
                      image: NetworkImage(user.avatarUrl),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // 2. Cinematic Hero Header (Aspect 16/11)
          SliverToBoxAdapter(
            child: Stack(
              children: [
                AspectRatio(
                  aspectRatio: 16 / 11,
                  child: CachedNetworkImage(
                    imageUrl: widget.movie.backdropUrl,
                    fit: BoxFit.cover,
                  ),
                ),
                // Gradient Scrims
                Positioned.fill(
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          AppColors.background,
                          Color(0x9912121D),
                          Colors.transparent,
                        ],
                        stops: [0.0, 0.45, 1.0],
                      ),
                    ),
                  ),
                ),
                // Center Big Play Button Highlight
                Positioned.fill(
                  child: Center(
                    child: GestureDetector(
                      onTap: () => _playEpisode(widget.movie),
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryContainer.withValues(alpha: 0.5),
                              blurRadius: 28,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 36,
                        ),
                      ),
                    ),
                  ),
                ),
                // Top Right Cast button
                Positioned(
                  top: 14,
                  right: 16,
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerHigh.withValues(alpha: 0.8),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.cast_rounded, color: Colors.white, size: 20),
                  ),
                ),
                // Bottom Badges: Trending #1 & 99% Cocok
                Positioned(
                  bottom: 12,
                  left: 16,
                  right: 16,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.tertiaryContainer.withValues(alpha: 0.35),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.local_fire_department_rounded,
                              color: AppColors.tertiary,
                              size: 15,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Trending #1 di Indonesia',
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.tertiary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceContainerHighest.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '99% Cocok',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.tertiaryFixed,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 3. Series Metadata & Actions
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.movie.title,
                    style: GoogleFonts.outfit(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.onSurface,
                    ),
                  ),
                  Text(
                    'Cigarette Girl',
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Metadata Row: 2023 • 1 Musim (5 Episode) • 16+ • 4K UHD • Dolby Vision
                  Row(
                    children: [
                      Text(
                        '${widget.movie.releaseYear}',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurface,
                        ),
                      ),
                      _buildDotSeparator(),
                      Text(
                        widget.movie.durationOrSeasons,
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant),
                      ),
                      _buildDotSeparator(),
                      _buildTagBadge(widget.movie.ageRating),
                      if (widget.movie.resolutionBadges.isNotEmpty) ...[
                        const SizedBox(width: 6),
                        _buildTagBadge(
                          widget.movie.resolutionBadges.firstWhere(
                            (b) => !b.toLowerCase().contains('atmos'),
                            orElse: () => widget.movie.resolutionBadges.first,
                          ),
                          isHighlight: true,
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Big Play Button CTA (gradient linear-gradient(135deg, #0066FF 0%, #00B4D8 100%))
                  GestureDetector(
                    onTap: () => _playEpisode(widget.movie),
                    child: Container(
                      width: double.infinity,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primaryContainer, Color(0xFF5F5CFF)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryContainer.withValues(alpha: 0.4),
                            blurRadius: 18,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 24),
                          const SizedBox(width: 6),
                          Text(
                            'Putar Episode 1',
                            style: GoogleFonts.outfit(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Secondary 4-Column Utility Toolbar (Daftar, Beri Nilai, Unduh, Trailer)
                  Row(
                    children: [
                      // 1. Daftar (Watchlist)
                      Expanded(
                        child: _buildUtilityButton(
                          icon: isWatchlist ? Icons.check_rounded : Icons.add_rounded,
                          label: isWatchlist ? 'Tersimpan' : 'Daftar',
                          iconColor: isWatchlist ? AppColors.primary : AppColors.onSurface,
                          onTap: () {
                            ref.read(mediaProvider.notifier).toggleWatchlist(widget.movie.id);
                            _showToast(
                              isWatchlist
                                  ? 'Dihapus dari Daftar Tontonan'
                                  : 'Ditambahkan ke Daftar Tontonan',
                              icon: isWatchlist ? Icons.bookmark_remove_rounded : Icons.bookmark_added_rounded,
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 8),

                      // 2. Beri Nilai
                      Expanded(
                        child: _buildUtilityButton(
                          icon: Icons.star_outline_rounded,
                          label: 'Beri Nilai',
                          iconColor: AppColors.secondary,
                          onTap: _handleQuickRate,
                        ),
                      ),
                      const SizedBox(width: 8),

                      // 3. Unduh
                      Expanded(
                        child: _buildUtilityButton(
                          icon: _isDownloadingAll ? Icons.download_done_rounded : Icons.download_rounded,
                          label: _isDownloadingAll ? 'Terunduh' : 'Unduh',
                          iconColor: _isDownloadingAll ? AppColors.tertiary : AppColors.onSurface,
                          onTap: () {
                            setState(() {
                              _isDownloadingAll = !_isDownloadingAll;
                            });
                            _showToast(
                              _isDownloadingAll
                                  ? 'Mengunduh Musim 1 (5 Episode)'
                                  : 'Semua unduhan episode telah dibatalkan',
                              icon: _isDownloadingAll ? Icons.downloading_rounded : Icons.delete_outline_rounded,
                              color: AppColors.tertiary,
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 8),

                      // 4. Trailer
                      Expanded(
                        child: _buildUtilityButton(
                          icon: Icons.movie_outlined,
                          label: 'Trailer',
                          onTap: () {
                            _showToast('Memutar Teaser Cuplikan Resmi...', icon: Icons.movie_rounded);
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => VideoPlayerScreen(movie: widget.movie)),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Synopsis with Expand/Collapse Toggle
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.movie.synopsis,
                        maxLines: _isSynopsisExpanded ? null : 3,
                        overflow: _isSynopsisExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.onSurface,
                          height: 1.5,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _isSynopsisExpanded = !_isSynopsisExpanded;
                          });
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _isSynopsisExpanded ? 'Lebih sedikit' : 'Selengkapnya',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.primary,
                                ),
                              ),
                              Icon(
                                _isSynopsisExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                                size: 16,
                                color: AppColors.primary,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Cast & Crew Chips
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pemeran: ',
                        style: GoogleFonts.outfit(fontSize: 12, color: AppColors.outline),
                      ),
                      Expanded(
                        child: Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: _castList.map((c) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceContainerHigh,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                c,
                                style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurface),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(
                        'Sutradara: ',
                        style: GoogleFonts.outfit(fontSize: 12, color: AppColors.outline),
                      ),
                      Text(
                        'Kamila Andini, Ifa Isfansyah',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurface, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // 4-Tab Navigation Bar
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: TabBar(
                      controller: _tabController,
                      indicator: BoxDecoration(
                        color: AppColors.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      indicatorSize: TabBarIndicatorSize.tab,
                      labelColor: AppColors.onSurface,
                      unselectedLabelColor: AppColors.onSurfaceVariant,
                      labelStyle: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600),
                      tabs: const [
                        Tab(text: 'Ringkasan'),
                        Tab(text: 'Episode'),
                        Tab(text: 'Mirip Ini'),
                        Tab(text: 'Ulasan'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 4. Tab Views
          SliverToBoxAdapter(
            child: AnimatedBuilder(
              animation: _tabController,
              builder: (context, _) {
                switch (_tabController.index) {
                  case 0:
                    return _buildOverviewTab();
                  case 1:
                    return _buildEpisodesTab();
                  case 2:
                    return _buildSimilarTab();
                  case 3:
                  default:
                    return _buildReviewsTab();
                }
              },
            ),
          ),

          const SliverToBoxAdapter(
            child: SizedBox(height: 40),
          ),
        ],
      ),
    );
  }

  Widget _buildDotSeparator() {
    return Container(
      width: 4,
      height: 4,
      margin: const EdgeInsets.symmetric(horizontal: 6),
      decoration: const BoxDecoration(
        color: AppColors.outline,
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildTagBadge(String label, {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: isHighlight
            ? AppColors.tertiaryContainer.withValues(alpha: 0.25)
            : AppColors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: GoogleFonts.outfit(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: isHighlight ? AppColors.tertiary : AppColors.onSurface,
        ),
      ),
    );
  }

  Widget _buildUtilityButton({
    required IconData icon,
    required String label,
    Color? iconColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, color: iconColor ?? AppColors.onSurface, size: 22),
            const SizedBox(height: 3),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 11,
                color: AppColors.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 1. Tab: Ringkasan
  Widget _buildOverviewTab() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.star_rounded, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Tentang Serial',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Diadaptasi dari novel terlaris karya Ratih Kumala. Serial orisinal ini memenangkan Grand Prize di Busan International Film Festival Asia Contents Awards 2024 untuk Best OTT Original Series, memukau kritikus dengan rekonstruksi era yang autentik serta musik orkestra megah.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.onSurfaceVariant,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            // Mini Stats Grid
            Row(
              children: [
                _buildStatBox('Negara Asal', 'Indonesia'),
                const SizedBox(width: 8),
                _buildStatBox('Audio Utama', 'Bahasa Indonesia (Dolby 5.1)'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildStatBox('Subtitel', 'Inggris, Melayu, Jawa'),
                const SizedBox(width: 8),
                _buildStatBox('Klasifikasi Usia', '16+ (Dewasa Muda)', isPrimary: true),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBox(String title, String val, {bool isPrimary = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainer,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.outline),
            ),
            const SizedBox(height: 3),
            Text(
              val,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isPrimary ? AppColors.primary : AppColors.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 2. Tab: Episode & Musim (Default Active)
  Widget _buildEpisodesTab() {
    final episodes = MockData.gadiskretekEpisodes;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Text(
                      'Musim 1 (5 Episode)',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.onSurface,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_drop_down_rounded, color: AppColors.onSurfaceVariant),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  'Semua episode tersedia',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.outline),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Episodes List
          ...episodes.map((ep) {
            final isDownloaded = _downloadedEpisodes.contains(ep.id);
            final isDownloading = _downloadingEpisodes.contains(ep.id);

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Thumbnail
                      GestureDetector(
                        onTap: () => _playEpisode(widget.movie),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Stack(
                            children: [
                              CachedNetworkImage(
                                imageUrl: ep.thumbnailUrl,
                                width: 120,
                                height: 70,
                                fit: BoxFit.cover,
                              ),
                              Positioned.fill(
                                child: Container(
                                  color: Colors.black.withValues(alpha: 0.3),
                                  child: Center(
                                    child: Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: AppColors.surface.withValues(alpha: 0.8),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.play_arrow_rounded,
                                        color: Colors.white,
                                        size: 20,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              if (ep.progress > 0)
                                Positioned(
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  child: LinearProgressIndicator(
                                    value: ep.progress,
                                    backgroundColor: AppColors.surfaceVariant,
                                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryContainer),
                                    minHeight: 3,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Title & Duration
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    ep.title,
                                    style: GoogleFonts.outfit(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.onSurface,
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => _toggleEpisodeDownload(ep.id, ep.title),
                                  child: Container(
                                    width: 30,
                                    height: 30,
                                    decoration: const BoxDecoration(shape: BoxShape.circle),
                                    child: isDownloading
                                        ? const Center(
                                            child: SizedBox(
                                              width: 16,
                                              height: 16,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                valueColor: AlwaysStoppedAnimation<Color>(AppColors.tertiary),
                                              ),
                                            ),
                                          )
                                        : Icon(
                                            isDownloaded
                                                ? Icons.download_done_rounded
                                                : Icons.download_rounded,
                                            size: 20,
                                            color: isDownloaded ? AppColors.tertiary : AppColors.onSurfaceVariant,
                                          ),
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              ep.duration,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: ep.episodeNumber == 1 ? AppColors.tertiary : AppColors.outline,
                              ),
                            ),
                            const SizedBox(height: 4),
                            if (ep.episodeNumber == 1)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryFixed.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'Lanjutkan Menonton',
                                  style: GoogleFonts.outfit(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              )
                            else if (ep.episodeNumber == 5)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.secondaryContainer.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'Episode Puncak',
                                  style: GoogleFonts.outfit(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.secondary,
                                  ),
                                ),
                              )
                            else
                              Text(
                                'Belum ditonton',
                                style: GoogleFonts.inter(fontSize: 10, color: AppColors.outline),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    ep.synopsis,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.onSurfaceVariant,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // 3. Tab: Mirip Ini (Similar Content - 3 columns)
  Widget _buildSimilarTab() {
    final list = MockData.similarMovies;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          childAspectRatio: 0.62,
          crossAxisSpacing: 10,
          mainAxisSpacing: 12,
        ),
        itemCount: list.length,
        itemBuilder: (context, index) {
          final item = list[index];
          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ContentDetailScreen(movie: item),
                ),
              );
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        CachedNetworkImage(
                          imageUrl: item.posterUrl,
                          fit: BoxFit.cover,
                        ),
                        Positioned(
                          top: 6,
                          right: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${item.matchScore.toInt()}%',
                              style: GoogleFonts.outfit(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: AppColors.tertiary,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.onSurface,
                  ),
                ),
                Text(
                  item.genre,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: AppColors.outline,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // 4. Tab: Ulasan Pengguna (Reviews & Ratings)
  Widget _buildReviewsTab() {
    final user = ref.watch(authProvider);
    final mediaState = ref.watch(mediaProvider);
    final reviews = mediaState.movieReviews[widget.movie.id] ??
        MockData.getInitialReviews(widget.movie.id);

    // Hitung rata-rata rating dinamis dari daftar ulasan
    double avgRating = widget.movie.userRating;
    if (reviews.isNotEmpty) {
      final total = reviews.fold<double>(0.0, (acc, r) => acc + r.rating);
      avgRating = total / reviews.length;
    }
    final displayAvg = avgRating.toStringAsFixed(1);

    String scoreStatus;
    if (avgRating >= 9.0) {
      scoreStatus = 'Mahakarya Sempurna dari Penonton';
    } else if (avgRating >= 8.0) {
      scoreStatus = 'Skor Penonton Sangat Baik';
    } else if (avgRating >= 7.0) {
      scoreStatus = 'Ulasan Penonton Positif';
    } else if (avgRating >= 5.0) {
      scoreStatus = 'Ulasan Cukup Menarik';
    } else {
      scoreStatus = 'Ulasan Penonton Beragam';
    }

    String ratingLabel(int val) {
      switch (val) {
        case 10:
          return 'Mahakarya Sempurna! (10/10)';
        case 9:
          return 'Luar Biasa! (9/10)';
        case 8:
          return 'Sangat Bagus (8/10)';
        case 7:
          return 'Bagus & Menghibur (7/10)';
        case 6:
          return 'Cukup Menarik (6/10)';
        case 5:
          return 'Standar (5/10)';
        case 4:
          return 'Kurang Memuaskan (4/10)';
        case 3:
          return 'Mengecewakan (3/10)';
        case 1:
        case 2:
          return 'Sangat Buruk ($val/10)';
        default:
          return 'Sentuh bintang untuk memilih nilai (1-10)';
      }
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Overall Score Card (Nilai Rata-rata Dinamis)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.06),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHigh,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        displayAvg,
                        style: GoogleFonts.outfit(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: AppColors.secondary,
                        ),
                      ),
                      Text(
                        '/ 10',
                        style: GoogleFonts.outfit(
                          fontSize: 10,
                          color: AppColors.outline,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: List.generate(
                          5,
                          (i) {
                            final score5 = avgRating / 2.0;
                            if (score5 >= i + 1) {
                              return const Icon(Icons.star_rounded,
                                  color: AppColors.secondary, size: 18);
                            } else if (score5 >= i + 0.5) {
                              return const Icon(Icons.star_half_rounded,
                                  color: AppColors.secondary, size: 18);
                            } else {
                              return const Icon(Icons.star_outline_rounded,
                                  color: AppColors.outline, size: 18);
                            }
                          },
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        scoreStatus,
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      Text(
                        'Berdasarkan ${reviews.length} ulasan penonton terverifikasi',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: AppColors.outline,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. Rating & Review Form (Jika belum login: Tampilkan Kartu Login Required)
          Container(
            key: _starRatingKey,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: user.isLoggedIn
                    ? AppColors.secondary.withValues(alpha: 0.25)
                    : Colors.white.withValues(alpha: 0.08),
              ),
            ),
            child: user.isLoggedIn
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header: Identitas Pengguna & Label Form
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 16,
                            backgroundImage: NetworkImage(user.avatarUrl),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Flexible(
                                      child: Text(
                                        user.name,
                                        style: GoogleFonts.outfit(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.onSurface,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (user.isVip) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 6, vertical: 1.5),
                                        decoration: BoxDecoration(
                                          gradient: const LinearGradient(
                                            colors: [Color(0xFFFFB800), Color(0xFFFF8A00)],
                                          ),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          'VIP',
                                          style: GoogleFonts.outfit(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w800,
                                            color: Colors.black,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                Text(
                                  'Tulis Ulasan & Berikan Nilai Anda',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: AppColors.outline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (_userSelectedRating > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.secondary.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '$_userSelectedRating/10 ★',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.secondary,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Interactive 10-Star Rating Bar
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(10, (idx) {
                          final starVal = idx + 1;
                          final isFilled = starVal <= _userSelectedRating;
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _userSelectedRating = starVal;
                              });
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 1.5),
                              child: Icon(
                                isFilled
                                    ? Icons.star_rounded
                                    : Icons.star_outline_rounded,
                                color: isFilled
                                    ? AppColors.secondary
                                    : AppColors.outline.withValues(alpha: 0.5),
                                size: 26,
                              ),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 6),
                      Center(
                        child: Text(
                          ratingLabel(_userSelectedRating),
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _userSelectedRating > 0
                                ? AppColors.secondary
                                : AppColors.outline,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Comment Input Box
                      TextField(
                        controller: _commentController,
                        maxLines: 3,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.onSurface,
                        ),
                        decoration: InputDecoration(
                          hintText:
                              'Bagikan pendapat Anda tentang cerita, sinematografi, akting, atau audio film ini...',
                          hintStyle: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.outline.withValues(alpha: 0.7),
                          ),
                          filled: true,
                          fillColor: AppColors.surfaceContainerHigh,
                          contentPadding: const EdgeInsets.all(12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: AppColors.primaryContainer,
                              width: 1.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Action Buttons: Batal & Kirim Ulasan
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (_userSelectedRating > 0 ||
                              _commentController.text.isNotEmpty)
                            TextButton(
                              onPressed: () {
                                setState(() {
                                  _userSelectedRating = 0;
                                  _commentController.clear();
                                });
                              },
                              child: Text(
                                'Batal',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: AppColors.outline,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            onPressed: () {
                              if (_userSelectedRating <= 0) {
                                _showToast(
                                  'Harap berikan nilai rating bintang (1-10) terlebih dahulu',
                                  icon: Icons.star_rounded,
                                  color: AppColors.error,
                                );
                                return;
                              }
                              if (_commentController.text.trim().isEmpty) {
                                _showToast(
                                  'Harap tulis ulasan atau komentar Anda',
                                  icon: Icons.edit_note_rounded,
                                  color: AppColors.error,
                                );
                                return;
                              }

                              final commentText = _commentController.text.trim();
                              final score = _userSelectedRating.toDouble();

                              ref.read(mediaProvider.notifier).addReview(
                                    widget.movie.id,
                                    score,
                                    commentText,
                                    userName: user.name,
                                  );

                              setState(() {
                                _userSelectedRating = 0;
                                _commentController.clear();
                              });
                              FocusScope.of(context).unfocus();

                              _showToast(
                                'Ulasan Anda berhasil dikirim! Terima kasih atas partisipasinya.',
                                icon: Icons.check_circle_rounded,
                                color: AppColors.tertiary,
                              );
                            },
                            icon: const Icon(
                              Icons.send_rounded,
                              size: 15,
                              color: Colors.white,
                            ),
                            label: Text(
                              'Kirim Ulasan',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryContainer,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 18, vertical: 10),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 2,
                            ),
                          ),
                        ],
                      ),
                    ],
                  )
                : Column(
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.rate_review_outlined,
                          color: AppColors.primaryContainer,
                          size: 26,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Masuk untuk Memberikan Ulasan & Rating',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Anda belum masuk ke akun. Silakan masuk terlebih dahulu untuk memberikan nilai bintang dan membagikan ulasan kepada penonton lainnya.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.outline,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const LoginScreen(initialTabIndex: 0),
                            ),
                          );
                        },
                        icon: const Icon(
                          Icons.login_rounded,
                          size: 16,
                          color: Colors.white,
                        ),
                        label: Text(
                          'Masuk Sekarang',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryContainer,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                          elevation: 3,
                        ),
                      ),
                    ],
                  ),
          ),
          const SizedBox(height: 20),

          // 3. User Reviews Feed Section Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Semua Ulasan Penonton',
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurface,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${reviews.length} ulasan',
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.outline,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 4. Reviews List
          if (reviews.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.chat_bubble_outline_rounded,
                    color: AppColors.outline.withValues(alpha: 0.6),
                    size: 40,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Belum ada ulasan untuk tayangan ini',
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Jadilah yang pertama memberikan ulasan dan rating!',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.outline,
                    ),
                  ),
                ],
              ),
            )
          else
            ...reviews.map((rev) {
              final isLiked = _likedReviewIds.contains(rev.id);
              final likesCount = rev.likesCount + (isLiked ? 1 : 0);

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.05),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 16,
                              backgroundImage: NetworkImage(rev.userAvatarUrl),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  rev.userName,
                                  style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.onSurface,
                                  ),
                                ),
                                Text(
                                  _formatReviewDate(rev.createdAt),
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    color: AppColors.outline,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.star_rounded,
                                  color: AppColors.secondary, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                '${rev.rating.toInt()}/10',
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.secondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      rev.comment,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.onSurfaceVariant,
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Like / Helpful interaction
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              if (isLiked) {
                                _likedReviewIds.remove(rev.id);
                              } else {
                                _likedReviewIds.add(rev.id);
                              }
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isLiked
                                  ? AppColors.tertiary.withValues(alpha: 0.15)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isLiked
                                      ? Icons.thumb_up_rounded
                                      : Icons.thumb_up_alt_outlined,
                                  size: 13,
                                  color: isLiked
                                      ? AppColors.tertiary
                                      : AppColors.outline,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '$likesCount',
                                  style: GoogleFonts.outfit(
                                    fontSize: 11,
                                    fontWeight: isLiked
                                        ? FontWeight.w700
                                        : FontWeight.w500,
                                    color: isLiked
                                        ? AppColors.tertiary
                                        : AppColors.outline,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Membantu',
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    color: isLiked
                                        ? AppColors.tertiary
                                        : AppColors.outline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}
