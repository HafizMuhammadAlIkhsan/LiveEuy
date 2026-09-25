import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
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

/// Halaman Koleksi & Riwayat Tontonan (WatchlistView)
/// Mengikuti secara presisi styling, font (Plus Jakarta Sans), dan color palette dari dev-frontend:
/// - Brand Rose Red: brand-500 (#F43F5E), brand-600 (#E11D48), brand-400 (#FB7185)
/// - Surface OLED & Glass: surface-800 (#0F111A), surface-900 (#090A0F), glass-panel
/// - Accents: emerald-400 (#34D399) untuk progress/match, amber-400 (#FBBF24) untuk rating
/// - Slates: slate-100 (#F1F5F9), slate-400 (#94A3B8), slate-300 (#CBD5E1)
class CollectionScreen extends ConsumerStatefulWidget {
  final void Function(int tabIndex)? onNavigateTab;
  final VoidCallback? onNavigateHome;
  final MediaState? mediaState;

  const CollectionScreen({
    super.key,
    this.onNavigateTab,
    this.onNavigateHome,
    this.mediaState,
  });

  @override
  ConsumerState<CollectionScreen> createState() => _CollectionScreenState();
}

class _CollectionScreenState extends ConsumerState<CollectionScreen> {
  String _selectedCategory = 'Semua';

  // Palette dev-frontend yang konsisten
  static const Color _surface800 = Color(0xFF0F111A);
  static const Color _surface700 = Color(0xFF181B28);
  static const Color _slate400 = Color(0xFF94A3B8);
  static const Color _slate300 = Color(0xFFCBD5E1);
  static const Color _emerald400 = Color(0xFF34D399);
  static const Color _amber400 = Color(0xFFFBBF24);

  bool _isSeries(Movie movie) {
    return movie.seasons.isNotEmpty ||
        movie.durationOrSeasons.toLowerCase().contains('musim') ||
        movie.durationOrSeasons.toLowerCase().contains('season');
  }

  int _calculateRemainingMinutes(Movie movie) {
    int totalMinutes = 90;
    final str = movie.durationOrSeasons;
    final hourMatch = RegExp(r'(\d+)\s*(?:jam|j|h)', caseSensitive: false).firstMatch(str);
    final minMatch = RegExp(r'(\d+)\s*(?:min|menit|m)', caseSensitive: false).firstMatch(str);
    if (hourMatch != null || minMatch != null) {
      final hours = hourMatch != null ? int.tryParse(hourMatch.group(1) ?? '0') ?? 0 : 0;
      final mins = minMatch != null ? int.tryParse(minMatch.group(1) ?? '0') ?? 0 : 0;
      totalMinutes = (hours * 60) + mins;
    }
    final remaining = (totalMinutes * (1.0 - movie.continueWatchingProgress)).round();
    return remaining.clamp(1, 999);
  }

  void _openMediaDetail(String mediaId) {
    final movie = MockData.getMovieById(mediaId);
    if (movie != null && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ContentDetailScreen(movie: movie)),
      );
    }
  }

  void _showCastModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: _surface700.withValues(alpha: 0.98),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
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
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.cast_rounded, color: AppColors.brand400),
                const SizedBox(width: 10),
                Text(
                  'Transmisikan ke Perangkat (Cast)',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
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
                  color: _surface800,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.tv_rounded, color: _emerald400),
              ),
              title: Text(
                'Living Room Smart TV',
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              subtitle: Text(
                'Tersedia • Wi-Fi 5GHz',
                style: GoogleFonts.plusJakartaSans(color: _slate400, fontSize: 12),
              ),
              trailing: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Terhubung ke Living Room Smart TV'),
                      backgroundColor: _surface700,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brand600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text('Hubungkan', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showContinueWatchingOptions(Movie movie) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: _surface700.withValues(alpha: 0.98),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: CachedNetworkImage(
                    imageUrl: movie.backdropUrl,
                    width: 60,
                    height: 38,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        movie.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Tersisa ${_calculateRemainingMinutes(movie)} menit • ${(movie.continueWatchingProgress * 100).toInt()}% selesai',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          color: _slate400,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: Colors.white10),
            ListTile(
              leading: const Icon(Icons.play_circle_fill_rounded, color: AppColors.brand500),
              title: Text('Lanjutkan Menonton', style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.w600)),
              subtitle: Text(
                'Mulai dari posisi terakhir (${(movie.continueWatchingProgress * 100).toInt()}%)',
                style: GoogleFonts.plusJakartaSans(fontSize: 12, color: _slate400),
              ),
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => VideoPlayerScreen(
                      movie: movie,
                      startProgress: movie.continueWatchingProgress,
                    ),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.replay_rounded, color: Colors.white70),
              title: Text('Mulai dari Awal', style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => VideoPlayerScreen(movie: movie, startProgress: 0.0),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.info_outline_rounded, color: Colors.white70),
              title: Text('Lihat Info & Detail', style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(sheetContext);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ContentDetailScreen(movie: movie),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_sweep_rounded, color: AppColors.brand400),
              title: Text('Hapus dari Riwayat', style: GoogleFonts.plusJakartaSans(color: AppColors.brand400, fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(sheetContext);
                final notifier = ref.read(mediaProvider.notifier);
                notifier.removeFromContinueWatching(movie.id);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${movie.title} dihapus dari riwayat tontonan'),
                    backgroundColor: _surface700,
                    action: SnackBarAction(
                      label: 'BATAL',
                      textColor: AppColors.brand400,
                      onPressed: () {
                        notifier.insertContinueWatching(movie);
                      },
                    ),
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
    final MediaState mediaState = widget.mediaState ?? ref.watch(mediaProvider);
    final user = ref.watch(authProvider);

    // Ambil data watchlist lengkap dari MockData
    final allMovies = MockData.getAllMovies();
    final watchlistItems = allMovies
        .where((m) => mediaState.watchlistIds.contains(m.id))
        .toList();

    // Lanjutkan menonton items (progress > 0% dan < 98%)
    final continueWatchingItems = mediaState.continueWatching
        .where((m) => m.continueWatchingProgress > 0 && m.continueWatchingProgress < 0.98)
        .toList();

    // Hitung pembagian kategori untuk filter chips
    final filmItems = watchlistItems.where((m) => !_isSeries(m)).toList();
    final seriesItems = watchlistItems.where((m) => _isSeries(m)).toList();

    final List<Movie> displayedWatchlist;
    if (_selectedCategory == 'Film') {
      displayedWatchlist = filmItems;
    } else if (_selectedCategory == 'Serial TV') {
      displayedWatchlist = seriesItems;
    } else {
      displayedWatchlist = watchlistItems;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. Top App Bar terpadu (Logo LiveEuy, Cast, Notifikasi, Avatar Profil)
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
                onOpenMediaId: _openMediaDetail,
              ),
              Padding(
                padding: const EdgeInsets.only(right: 16.0, left: 4.0),
                child: GestureDetector(
                  key: const Key('koleksi_profile_avatar'),
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
                        placeholder: (context, url) =>
                            Container(color: _surface800),
                        errorWidget: (context, url, err) => Container(
                          color: _surface800,
                          child: const Icon(Icons.person_rounded,
                              size: 18, color: AppColors.brand400),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // 2. Header Halaman Koleksi & Riwayat (1:1 dev-frontend WatchlistView header)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.brand500.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.brand500.withValues(alpha: 0.25),
                          ),
                        ),
                        child: const Icon(
                          Icons.bookmark_rounded,
                          color: AppColors.brand500,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Koleksi & Riwayat Tontonan',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Lanjutkan tontonan terakhir Anda dan jelajahi daftar tontonan yang telah disimpan.',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 12,
                                color: _slate400,
                                height: 1.35,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.12),
                          ),
                        ),
                        child: Text(
                          '${watchlistItems.length} Tersimpan',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: _slate300,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 3. SECTION 1: LANJUTKAN MENONTON (Jika ada riwayat tontonan aktif)
          if (continueWatchingItems.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
                child: Row(
                  children: [
                    const Icon(
                      Icons.schedule_rounded,
                      color: _emerald400,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Lanjutkan Menonton',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: _emerald400.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${continueWatchingItems.length}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: _emerald400,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 124,
                child: ListView.separated(
                  physics: const BouncingScrollPhysics(),
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: continueWatchingItems.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 12),
                  itemBuilder: (context, index) {
                    final item = continueWatchingItems[index];
                    return _buildContinueWatchingCard(item);
                  },
                ),
              ),
            ),
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Divider(color: Colors.white10, height: 1),
              ),
            ),
          ],

          // 4. SECTION 2: DAFTAR TONTONAN ANDA (Header + Filter Chips)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.bookmark_outline_rounded,
                            color: AppColors.brand400,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Daftar Tontonan Anda',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '(${watchlistItems.length})',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: _slate400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Kategori Filter Chips (Semua, Film, Serial TV) dengan palette dev-frontend
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    child: Row(
                      children: [
                        _buildFilterChip('Semua', watchlistItems.length),
                        const SizedBox(width: 8),
                        _buildFilterChip('Film', filmItems.length),
                        const SizedBox(width: 8),
                        _buildFilterChip('Serial TV', seriesItems.length),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 5. ISI DAFTAR KOLEKSI: GRID CARD ATAU EMPTY STATE
          if (watchlistItems.isEmpty)
            SliverToBoxAdapter(
              child: _buildEmptyWatchlistState(),
            )
          else if (displayedWatchlist.isEmpty)
            SliverToBoxAdapter(
              child: _buildEmptyFilteredState(),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.55,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 16,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final movie = displayedWatchlist[index];
                    return _buildMediaCard(movie);
                  },
                  childCount: displayedWatchlist.length,
                ),
              ),
            ),

          // Jarak bawah agar tidak terpotong bottom navigation bar
          const SliverToBoxAdapter(
            child: SizedBox(height: 110),
          ),
        ],
      ),
    );
  }

  /// Filter Chip Tombol dengan palet brand-600 / surface-800
  Widget _buildFilterChip(String label, int count) {
    final isSelected = _selectedCategory == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedCategory = label;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.brand600
              : _surface800.withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.brand400.withValues(alpha: 0.5)
                : Colors.white.withValues(alpha: 0.08),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.brand600.withValues(alpha: 0.35),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : _slate300,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.22)
                    : Colors.white.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : _slate400,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Card Lanjutkan Menonton (Thumbnail 16:9 + Progress Bar + Putar Cepat)
  Widget _buildContinueWatchingCard(Movie item) {
    final remainingMinutes = _calculateRemainingMinutes(item);
    return Container(
      width: 270,
      decoration: BoxDecoration(
        color: _surface800.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.06),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => VideoPlayerScreen(
                  movie: item,
                  startProgress: item.continueWatchingProgress,
                ),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                // Thumbnail 16:9
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Stack(
                    children: [
                      CachedNetworkImage(
                        imageUrl: item.backdropUrl,
                        width: 108,
                        height: 68,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          width: 108,
                          height: 68,
                          color: _surface700,
                        ),
                        errorWidget: (context, url, error) => Container(
                          width: 108,
                          height: 68,
                          color: _surface700,
                          child: const Icon(Icons.movie_rounded, color: _slate400),
                        ),
                      ),
                      // Overlay icon play
                      Positioned.fill(
                        child: Container(
                          color: Colors.black.withValues(alpha: 0.35),
                          child: const Center(
                            child: Icon(
                              Icons.play_circle_fill_rounded,
                              color: Colors.white,
                              size: 26,
                            ),
                          ),
                        ),
                      ),
                      // Progress Bar di thumbnail
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: LinearProgressIndicator(
                          value: item.continueWatchingProgress,
                          backgroundColor: Colors.white24,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.brand500),
                          minHeight: 3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),

                // Info & Tombol Menu
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        item.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Tersisa $remainingMinutes menit',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          color: _slate400,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${(item.continueWatchingProgress * 100).toInt()}% selesai',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: _emerald400,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => _showContinueWatchingOptions(item),
                            child: const Padding(
                              padding: EdgeInsets.all(2.0),
                              child: Icon(
                                Icons.more_vert_rounded,
                                size: 16,
                                color: _slate400,
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

  /// MediaCard poster grid item (1:1 style dev-frontend MediaCard)
  Widget _buildMediaCard(Movie movie) {
    final qualityLabel = movie.resolutionBadges.isNotEmpty
        ? movie.resolutionBadges.first
            .replaceAll('4K UHD', 'FHD')
            .replaceAll('Dolby Atmos', 'Surround')
        : 'HD';

    return Container(
      decoration: BoxDecoration(
        color: _surface800,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.06),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ContentDetailScreen(movie: movie),
              ),
            );
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Poster Image Container
              Expanded(
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CachedNetworkImage(
                        imageUrl: movie.posterUrl,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: _surface700,
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: _surface700,
                          child: const Icon(Icons.movie_rounded, color: _slate400),
                        ),
                      ),

                      // Top Badges Overlay (Quality di kiri, Tombol Hapus di kanan)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.65),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.white12),
                          ),
                          child: Text(
                            qualityLabel,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),

                      // Tombol Hapus Cepat (Trash) dari Koleksi dengan Konfirmasi Undo
                      Positioned(
                        top: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: () {
                            ref.read(mediaProvider.notifier).toggleWatchlist(movie.id);
                            ScaffoldMessenger.of(context).clearSnackBars();
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${movie.title} dihapus dari koleksi'),
                                duration: const Duration(seconds: 3),
                                backgroundColor: _surface700,
                                action: SnackBarAction(
                                  label: 'BATAL',
                                  textColor: AppColors.brand400,
                                  onPressed: () {
                                    ref.read(mediaProvider.notifier).toggleWatchlist(movie.id);
                                  },
                                ),
                              ),
                            );
                          },
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.75),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white12),
                            ),
                            child: const Icon(
                              Icons.delete_outline_rounded,
                              color: Colors.white70,
                              size: 15,
                            ),
                          ),
                        ),
                      ),

                      // Rating Badge di pojok kiri bawah poster
                      Positioned(
                        bottom: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.65),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded, size: 12, color: _amber400),
                              const SizedBox(width: 3),
                              Text(
                                '${movie.userRating}',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: _amber400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Quick play button di pojok kanan bawah poster
                      Positioned(
                        bottom: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => VideoPlayerScreen(movie: movie),
                              ),
                            );
                          },
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: AppColors.brand600,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.brand600.withValues(alpha: 0.4),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.play_arrow_rounded,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Metadata teks di bawah poster
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      movie.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${movie.releaseYear} • ${_isSeries(movie) ? 'Serial' : 'Film'}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              color: _slate400,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${movie.matchScore.toInt()}% Cocok',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: _emerald400,
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

  /// Empty state ketika belum ada item sama sekali di koleksi (1:1 dev-frontend glass-panel)
  Widget _buildEmptyWatchlistState() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 40, 20, 40),
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: _surface800.withValues(alpha: 0.75),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.brand500.withValues(alpha: 0.12),
                  border: Border.all(
                    color: AppColors.brand500.withValues(alpha: 0.25),
                  ),
                ),
                child: const Icon(
                  Icons.bookmark_rounded,
                  size: 32,
                  color: AppColors.brand400,
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Daftar Koleksi Anda Masih Kosong',
                textAlign: TextAlign.center,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Jelajahi berbagai judul film dan serial menarik di LiveEuy, lalu klik ikon tanda tambah (+) untuk menyimpannya di sini.',
                textAlign: TextAlign.center,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  color: _slate400,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 22),
              ElevatedButton.icon(
                onPressed: () {
                  widget.onNavigateHome?.call();
                  widget.onNavigateTab?.call(0);
                },
                icon: const Icon(Icons.auto_awesome, size: 16),
                label: Text(
                  'Jelajahi Film Sekarang',
                  style: GoogleFonts.plusJakartaSans(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    letterSpacing: 0.3,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brand600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 4,
                  shadowColor: AppColors.brand600.withValues(alpha: 0.4),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Empty state ketika filter tertentu tidak memiliki hasil
  Widget _buildEmptyFilteredState() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 40, 20, 40),
      child: Center(
        child: Column(
          children: [
            const Icon(
              Icons.filter_list_off_rounded,
              size: 40,
              color: _slate400,
            ),
            const SizedBox(height: 12),
            Text(
              'Belum ada $_selectedCategory dalam koleksi',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () {
                setState(() {
                  _selectedCategory = 'Semua';
                });
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.brand400,
                side: const BorderSide(color: AppColors.brand500),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'Tampilkan Semua',
                style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
