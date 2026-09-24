import 'dart:ui';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/data/mock_data.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/login_screen.dart';
import 'features/detail/content_detail_screen.dart';
import 'features/home/home_screen.dart';
import 'features/player/video_player_screen.dart';
import 'features/search/search_screen.dart';
import 'models/movie_model.dart';
import 'providers/auth_provider.dart';
import 'providers/media_provider.dart';
import 'shared/widgets/streamflix_logo.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: LiveEuyApp()));
}

class LiveEuyApp extends StatelessWidget {
  const LiveEuyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LiveEuy',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationScreen(),
    );
  }
}

typedef StreamFlixApp = LiveEuyApp;

class MainNavigationScreen extends ConsumerStatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  ConsumerState<MainNavigationScreen> createState() =>
      _MainNavigationScreenState();
}

class _MainNavigationScreenState extends ConsumerState<MainNavigationScreen> {
  int _currentIndex = 0;

  void _onNavigateTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final mediaState = ref.watch(mediaProvider);
    final userProfile = ref.watch(authProvider);

    final pages = [
      HomeScreen(onNavigateTab: _onNavigateTab),
      SearchScreen(onNavigateTab: _onNavigateTab),
      _KoleksiTab(
        mediaState: mediaState,
        onNavigateHome: () => _onNavigateTab(0),
      ),
      _AkunTab(
        userProfile: userProfile,
        mediaState: mediaState,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          IndexedStack(index: _currentIndex, children: pages),

          // StreamFlix Bottom Navigation Bar (4 Tabs: Beranda, Cari, Koleksi, Akun)
          // Matching HTML: fixed bottom-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-2xl border-t border-outline-variant/10 pb-safe
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface.withValues(alpha: 0.92),
                    border: Border(
                      top: BorderSide(
                        color: AppColors.outlineVariant.withValues(alpha: 0.15),
                        width: 1.0,
                      ),
                    ),
                  ),
                  child: SafeArea(
                    top: false,
                    child: SizedBox(
                      height: 64,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildNavItem(
                            0,
                            Icons.home_rounded,
                            Icons.home_outlined,
                            'Beranda',
                          ),
                          _buildNavItem(
                            1,
                            Icons.search_rounded,
                            Icons.search_rounded,
                            'Cari',
                          ),
                          _buildNavItem(
                            2,
                            Icons.video_library_rounded,
                            Icons.video_library_outlined,
                            'Koleksi',
                          ),
                          _buildNavItem(
                            3,
                            Icons.account_circle_rounded,
                            Icons.account_circle_outlined,
                            'Akun',
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData activeIcon,
    IconData inactiveIcon,
    String label,
  ) {
    final isSelected = _currentIndex == index;
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _onNavigateTab(index),
          splashColor: AppColors.primaryContainer.withValues(alpha: 0.15),
          highlightColor: Colors.transparent,
          child: SizedBox(
            height: 64,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    if (isSelected)
                      Container(
                        width: 36,
                        height: 28,
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    Icon(
                      isSelected ? activeIcon : inactiveIcon,
                      color: isSelected ? AppColors.primary : AppColors.onSurfaceVariant,
                      size: 24,
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  label.toUpperCase(),
                  style: GoogleFonts.outfit(
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    letterSpacing: 0.8,
                    color: isSelected ? AppColors.primary : AppColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// KOLEKSI TAB (Watchlist & Saved Titles)
class _KoleksiTab extends ConsumerWidget {
  final MediaState mediaState;
  final VoidCallback onNavigateHome;

  const _KoleksiTab({
    required this.mediaState,
    required this.onNavigateHome,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Resolve watchlist movies
    final allMovies = MockData.getAllMovies();
    final watchlistItems = allMovies
        .where((m) => mediaState.watchlistIds.contains(m.id))
        .toList();

    return SafeArea(
      bottom: false,
      child: SingleChildScrollView(
        primary: false,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const StreamFlixLogo(fontSize: 20),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.primaryContainer.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.bookmark_rounded, color: AppColors.primary, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        '${watchlistItems.length} Tersimpan',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Koleksi Tontonan Saya',
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: AppColors.onSurface,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Daftar film dan serial yang disimpan untuk ditonton kapan saja.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),

            if (watchlistItems.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40.0),
                child: Center(
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.surfaceContainerHigh,
                          border: Border.all(
                            color: AppColors.primaryContainer.withValues(alpha: 0.3),
                          ),
                        ),
                        child: const Icon(
                          Icons.video_library_outlined,
                          size: 38,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Koleksi Masih Kosong',
                        style: GoogleFonts.outfit(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Simpan film atau serial favorit dengan mengetuk tombol Tambah Daftar di halaman tayangan.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: onNavigateHome,
                        icon: const Icon(Icons.movie_creation_outlined, size: 18),
                        label: Text(
                          'Jelajahi Beranda',
                          style: GoogleFonts.outfit(
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryContainer,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 6,
                          shadowColor: AppColors.primaryContainer.withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ...watchlistItems.map((movie) => _buildWatchlistCard(context, ref, movie)),
          ],
        ),
      ),
    );
  }

  Widget _buildWatchlistCard(BuildContext context, WidgetRef ref, Movie movie) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.outlineVariant.withValues(alpha: 0.2),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ContentDetailScreen(movie: movie),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                // Poster
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Stack(
                    children: [
                      CachedNetworkImage(
                        imageUrl: movie.posterUrl,
                        width: 76,
                        height: 108,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          width: 76,
                          height: 108,
                          color: AppColors.surfaceContainerHigh,
                        ),
                        errorWidget: (context, url, error) => Container(
                          width: 76,
                          height: 108,
                          color: AppColors.surfaceContainerHigh,
                          child: const Icon(Icons.movie_rounded, color: AppColors.textMuted),
                        ),
                      ),
                      Positioned(
                        bottom: 4,
                        right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.75),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            movie.ageRating,
                            style: GoogleFonts.outfit(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),

                // Info & Actions
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        movie.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            '${movie.matchScore.toInt()}% Match',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Colors.greenAccent,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${movie.releaseYear} • ${movie.durationOrSeasons}',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: movie.resolutionBadges.take(2).map((badge) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: AppColors.outlineVariant.withValues(alpha: 0.3),
                              ),
                            ),
                            child: Text(
                              badge,
                              style: GoogleFonts.outfit(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurfaceVariant,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 10),

                      // Quick play & remove row
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => VideoPlayerScreen(movie: movie),
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [AppColors.primaryContainer, Color(0xFF5F5CFF)],
                                ),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 16),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Putar',
                                    style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          IconButton(
                            icon: const Icon(
                              Icons.bookmark_remove_rounded,
                              color: AppColors.outline,
                              size: 20,
                            ),
                            tooltip: 'Hapus dari Koleksi',
                            onPressed: () {
                              ref.read(mediaProvider.notifier).toggleWatchlist(movie.id);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('${movie.title} dihapus dari Koleksi'),
                                  duration: const Duration(seconds: 2),
                                  backgroundColor: AppColors.surfaceContainerHighest,
                                ),
                              );
                            },
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
}

/// AKUN TAB (Profile, VIP Status & Streaming Settings)
class _AkunTab extends ConsumerStatefulWidget {
  final UserProfile userProfile;
  final MediaState mediaState;

  const _AkunTab({
    required this.userProfile,
    required this.mediaState,
  });

  @override
  ConsumerState<_AkunTab> createState() => _AkunTabState();
}

class _AkunTabState extends ConsumerState<_AkunTab> {
  bool _wifiOnlyDownload = true;
  bool _spatialAudio = true;
  bool _autoSkipIntro = true;
  bool _notifications = true;

  void _openAuthScreen(int initialTab) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => LoginScreen(initialTabIndex: initialTab),
      ),
    );
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: AppColors.surfaceContainerHigh,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Keluar dari LiveEuy?',
          style: GoogleFonts.outfit(
            color: AppColors.onSurface,
            fontWeight: FontWeight.w700,
          ),
        ),
        content: Text(
          'Anda dapat masuk kembali kapan saja untuk mengakses riwayat tontonan dan koleksi VIP Anda.',
          style: GoogleFonts.inter(
            color: AppColors.textSecondary,
            fontSize: 13,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: Text(
              'Batal',
              style: GoogleFonts.outfit(color: AppColors.outline),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              ref.read(authProvider.notifier).logout();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Anda telah berhasil keluar.'),
                  backgroundColor: AppColors.surfaceContainerHighest,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.errorContainer,
              foregroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(
              'Keluar',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  void _showBuyVipDialog(BuildContext context) {
    int selectedPlan = 0; // 0 for Monthly, 1 for Yearly
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
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
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF433FFE), Color(0xFF81CFFF)],
                          ),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.workspace_premium_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Langganan LiveEuy VIP 4K',
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onSurface,
                            ),
                          ),
                          Text(
                            'Beli paket untuk buka semua fitur premium',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.outline),
                    onPressed: () => Navigator.pop(sheetCtx),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Benefits
              _buildBenefitRow(Icons.hd_rounded, 'Kualitas Ultra HD 4K & Dolby Vision'),
              _buildBenefitRow(Icons.spatial_audio_rounded, 'Audio Spasial Dolby Atmos'),
              _buildBenefitRow(Icons.block_rounded, 'Bebas Iklan & Tanpa Batas Nonton'),
              _buildBenefitRow(Icons.download_for_offline_rounded, 'Download & Tonton Offline'),

              const SizedBox(height: 16),

              // Plan options
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setModalState(() => selectedPlan = 0),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selectedPlan == 0
                              ? const Color(0xFF433FFE).withValues(alpha: 0.18)
                              : AppColors.surfaceContainerLowest,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: selectedPlan == 0
                                ? const Color(0xFF433FFE)
                                : AppColors.outlineVariant.withValues(alpha: 0.2),
                            width: selectedPlan == 0 ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Bulanan',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Rp 49.000',
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppColors.onSurface,
                              ),
                            ),
                            Text(
                              '/ bulan',
                              style: GoogleFonts.inter(fontSize: 10, color: AppColors.outline),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setModalState(() => selectedPlan = 1),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selectedPlan == 1
                              ? const Color(0xFF433FFE).withValues(alpha: 0.18)
                              : AppColors.surfaceContainerLowest,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: selectedPlan == 1
                                ? const Color(0xFF433FFE)
                                : AppColors.outlineVariant.withValues(alpha: 0.2),
                            width: selectedPlan == 1 ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Tahunan',
                                  style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.greenAccent.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'HEMAT 32%',
                                    style: GoogleFonts.outfit(
                                      fontSize: 8,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.greenAccent,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Rp 399.000',
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppColors.onSurface,
                              ),
                            ),
                            Text(
                              '/ tahun',
                              style: GoogleFonts.inter(fontSize: 10, color: AppColors.outline),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Activate CTA Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(sheetCtx);
                    ref.read(authProvider.notifier).upgradeToVip();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(
                          children: [
                            const Icon(Icons.workspace_premium_rounded, color: Colors.amberAccent, size: 20),
                            const SizedBox(width: 10),
                            Text(
                              'Selamat! Akun Anda kini berstatus LIVEEUY VIP 4K!',
                              style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        backgroundColor: AppColors.surfaceContainerHighest,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF433FFE),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 6,
                  ),
                  child: Text(
                    selectedPlan == 0 ? 'Beli VIP Bulanan (Rp 49.000)' : 'Beli VIP Tahunan (Rp 399.000)',
                    style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFF81CFFF)),
          const SizedBox(width: 10),
          Text(
            text,
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.userProfile;

    return SafeArea(
      bottom: false,
      child: SingleChildScrollView(
        primary: false,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top App Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const StreamFlixLogo(fontSize: 20),
                IconButton(
                  icon: const Icon(Icons.settings_outlined, color: AppColors.onSurface),
                  onPressed: () {},
                  tooltip: 'Pengaturan',
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Profile Card Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.surfaceContainerHigh,
                    AppColors.surfaceContainer,
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: AppColors.primaryContainer.withValues(alpha: 0.3),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.35),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      // Avatar
                      Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppColors.primaryContainer,
                            width: 2.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryContainer.withValues(alpha: 0.35),
                              blurRadius: 12,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: CachedNetworkImage(
                            imageUrl: user.avatarUrl,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: AppColors.surfaceContainerHighest,
                            ),
                            errorWidget: (context, url, error) => const Icon(
                              Icons.person_rounded,
                              size: 32,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Name & Membership Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.isLoggedIn ? user.name : 'Tamu LiveEuy',
                              style: GoogleFonts.outfit(
                                fontSize: 19,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              user.isLoggedIn ? user.email : 'Belum masuk ke akun',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            if (user.isVip)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF433FFE), Color(0xFF81CFFF)],
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.workspace_premium_rounded, color: Colors.white, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      'LIVEEUY VIP 4K',
                                      style: GoogleFonts.outfit(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 0.6,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: AppColors.outlineVariant.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.person_rounded, color: AppColors.outline, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      'MEMBER STANDAR',
                                      style: GoogleFonts.outfit(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.6,
                                        color: AppColors.onSurfaceVariant,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Metrics Row
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem('28', 'Ditonton'),
                        Container(width: 1, height: 26, color: AppColors.surfaceVariant),
                        _buildStatItem('${widget.mediaState.watchlistIds.length}', 'Koleksi'),
                        Container(width: 1, height: 26, color: AppColors.surfaceVariant),
                        _buildStatItem('4K HDR', 'Format'),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // VIP Upgrade Banner (Shown if user is not VIP yet)
            if (!user.isVip) ...[
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFF433FFE).withValues(alpha: 0.25),
                        const Color(0xFF81CFFF).withValues(alpha: 0.12),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFF81CFFF).withValues(alpha: 0.4),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF433FFE), Color(0xFF81CFFF)],
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF433FFE).withValues(alpha: 0.45),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                        child: const Icon(Icons.workspace_premium_rounded, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Tingkatkan ke VIP 4K',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Buka akses streaming 4K UHD, Dolby Atmos, dan bebas iklan.',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () => _showBuyVipDialog(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF433FFE),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'Beli VIP',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Settings Sections
            _buildSectionHeader('PREFERENSI PEMUTAR & STREAMING'),
            _buildSettingsTile(
              icon: Icons.high_quality_rounded,
              title: 'Kualitas Streaming',
              subtitle: 'Maksimal (4K UHD & Dolby Atmos)',
              onTap: () {},
            ),
            _buildSwitchTile(
              icon: Icons.spatial_audio_rounded,
              title: 'Audio Spasial Dolby Atmos',
              subtitle: 'Nikmati audio surround multi-arah',
              value: _spatialAudio,
              onChanged: (v) => setState(() => _spatialAudio = v),
            ),
            _buildSwitchTile(
              icon: Icons.fast_forward_rounded,
              title: 'Lewati Intro & Rekap Otomatis',
              subtitle: 'Langsung tonton cerita utama',
              value: _autoSkipIntro,
              onChanged: (v) => setState(() => _autoSkipIntro = v),
            ),

            const SizedBox(height: 20),
            _buildSectionHeader('UNDUHAN & PENYIMPANAN'),
            _buildSwitchTile(
              icon: Icons.wifi_rounded,
              title: 'Unduh Hanya via Wi-Fi',
              subtitle: 'Mencegah pemakaian kuota data seluler',
              value: _wifiOnlyDownload,
              onChanged: (v) => setState(() => _wifiOnlyDownload = v),
            ),
            _buildSettingsTile(
              icon: Icons.sd_card_rounded,
              title: 'Penyimpanan & Cache',
              subtitle: '12.4 GB digunakan dari 128 GB',
              onTap: () {},
            ),

            const SizedBox(height: 20),
            _buildSectionHeader('NOTIFIKASI & APLIKASI'),
            _buildSwitchTile(
              icon: Icons.notifications_active_outlined,
              title: 'Pemberitahuan Rilis Baru',
              subtitle: 'Rekomendasi film & serial terkini',
              value: _notifications,
              onChanged: (v) => setState(() => _notifications = v),
            ),
            _buildSettingsTile(
              icon: Icons.info_outline_rounded,
              title: 'Tentang LiveEuy',
              subtitle: 'Versi 2.4.0 (Build 412) • Kebijakan Privasi',
              onTap: () {},
            ),

            const SizedBox(height: 28),

            // Auth CTA Button (Login/Register if guest, Logout if logged in)
            if (user.isLoggedIn)
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton.icon(
                  onPressed: _handleLogout,
                  icon: const Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
                  label: Text(
                    'KELUAR DARI AKUN',
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                      color: AppColors.error,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                      color: AppColors.error.withValues(alpha: 0.4),
                      width: 1.5,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              )
            else
              Container(
                width: double.infinity,
                height: 52,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primaryContainer, Color(0xFF6366F1)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryContainer.withValues(alpha: 0.4),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: () => _openAuthScreen(0),
                  icon: const Icon(Icons.login_rounded, color: Colors.white, size: 20),
                  label: Text(
                    'MASUK ATAU DAFTAR AKUN',
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, top: 4.0),
      child: Text(
        title,
        style: GoogleFonts.outfit(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.0,
          color: AppColors.onSurfaceVariant,
        ),
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.outlineVariant.withValues(alpha: 0.15),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: ListTile(
          onTap: onTap,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
          leading: Icon(icon, color: AppColors.primary, size: 22),
          title: Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.onSurface,
            ),
          ),
          subtitle: Text(
            subtitle,
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
          ),
          trailing: const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.outline,
            size: 20,
          ),
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainer,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.outlineVariant.withValues(alpha: 0.15),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: SwitchListTile(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
          secondary: Icon(icon, color: AppColors.primary, size: 22),
          title: Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.onSurface,
            ),
          ),
          subtitle: Text(
            subtitle,
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
          ),
          activeThumbColor: AppColors.primaryContainer,
          value: value,
          onChanged: onChanged,
        ),
      ),
    );
  }
}
