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
/// Mengikuti desain utama sistem penyimpanan & cache:
/// - Palette: AppColors (surfaceContainerLowest, surfaceContainer, primaryContainer, onSurface, textSecondary)
/// - Tipografi: GoogleFonts.outfit (Heading/Title) & GoogleFonts.inter (Body/Metadata)
/// - Craftsmanship: card dengan radius 16px, border outlineVariant 0.2, tanpa AI-slop neon glows
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
  bool _isSelectionMode = false;
  final Set<String> _selectedMediaIds = {};

  void _enterSelectionMode([String? initialId]) {
    setState(() {
      _isSelectionMode = true;
      _selectedMediaIds.clear();
      if (initialId != null) {
        _selectedMediaIds.add(initialId);
      }
    });
  }

  void _exitSelectionMode() {
    setState(() {
      _isSelectionMode = false;
      _selectedMediaIds.clear();
    });
  }

  void _toggleSelection(String id) {
    setState(() {
      if (_selectedMediaIds.contains(id)) {
        _selectedMediaIds.remove(id);
      } else {
        _selectedMediaIds.add(id);
      }
    });
  }

  void _toggleSelectAll(List<Movie> displayedWatchlist) {
    setState(() {
      final displayedIds = displayedWatchlist.map((m) => m.id).toSet();
      if (_selectedMediaIds.containsAll(displayedIds) && displayedIds.isNotEmpty) {
        _selectedMediaIds.removeAll(displayedIds);
      } else {
        _selectedMediaIds.addAll(displayedIds);
      }
    });
  }

  void _confirmBatchDelete(List<String> idsToDelete, List<Movie> allMovies) {
    if (idsToDelete.isEmpty) return;
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.surfaceContainerHigh,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.errorContainer.withValues(alpha: 0.3),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Hapus dari Koleksi?',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurface,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          idsToDelete.length == 1
              ? '1 tayangan akan dihapus dari koleksi Anda.'
              : '${idsToDelete.length} tayangan akan dihapus dari koleksi Anda.',
          style: GoogleFonts.inter(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(
              'Batal',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.onSurfaceVariant,
              ),
            ),
          ),
          ElevatedButton(
            key: const Key('confirm_batch_delete_dialog_button'),
            onPressed: () {
              Navigator.pop(dialogContext);
              _executeBatchDelete(idsToDelete);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            child: Text(
              'Hapus',
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _executeBatchDelete(List<String> idsToDelete) {
    final count = idsToDelete.length;
    ref.read(mediaProvider.notifier).removeMultipleFromWatchlist(idsToDelete);
    _exitSelectionMode();

    if (!mounted) return;
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '$count media dihapus dari koleksi',
          style: GoogleFonts.inter(fontWeight: FontWeight.w500),
        ),
        duration: const Duration(seconds: 4),
        backgroundColor: AppColors.surfaceContainerHighest,
        action: SnackBarAction(
          label: 'BATAL',
          textColor: AppColors.primary,
          onPressed: () {
            ref.read(mediaProvider.notifier).addMultipleToWatchlist(idsToDelete);
          },
        ),
      ),
    );
  }

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
      builder: (sheetContext) => Container(
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
                        color: AppColors.primaryContainer,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.cast_rounded, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Transmisikan ke Perangkat (Cast)',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.outline),
                  onPressed: () => Navigator.pop(sheetContext),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: const BoxDecoration(
                      color: AppColors.surfaceContainerHighest,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.tv_rounded, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Living Room Smart TV',
                          style: GoogleFonts.outfit(
                            color: AppColors.onSurface,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Tersedia • Wi-Fi 5GHz',
                          style: GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(sheetContext);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Terhubung ke Living Room Smart TV',
                            style: GoogleFonts.inter(fontWeight: FontWeight.w500),
                          ),
                          backgroundColor: AppColors.surfaceContainerHighest,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryContainer,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('Hubungkan', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 12)),
                  ),
                ],
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
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: CachedNetworkImage(
                      imageUrl: movie.backdropUrl,
                      width: 68,
                      height: 42,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(color: AppColors.surfaceContainerHigh),
                      errorWidget: (context, url, error) => Container(color: AppColors.surfaceContainerHigh),
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
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.onSurface,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Tersisa ${_calculateRemainingMinutes(movie)} menit • ${(movie.continueWatchingProgress * 100).toInt()}% selesai',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 8),
              leading: const Icon(Icons.play_circle_fill_rounded, color: AppColors.primary),
              title: Text(
                'Lanjutkan Menonton',
                style: GoogleFonts.outfit(color: AppColors.onSurface, fontWeight: FontWeight.w600, fontSize: 14),
              ),
              subtitle: Text(
                'Mulai dari posisi terakhir (${(movie.continueWatchingProgress * 100).toInt()}%)',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
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
              contentPadding: const EdgeInsets.symmetric(horizontal: 8),
              leading: const Icon(Icons.replay_rounded, color: AppColors.outline),
              title: Text(
                'Mulai dari Awal',
                style: GoogleFonts.outfit(color: AppColors.onSurface, fontWeight: FontWeight.w600, fontSize: 14),
              ),
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
              contentPadding: const EdgeInsets.symmetric(horizontal: 8),
              leading: const Icon(Icons.info_outline_rounded, color: AppColors.outline),
              title: Text(
                'Lihat Info & Detail',
                style: GoogleFonts.outfit(color: AppColors.onSurface, fontWeight: FontWeight.w600, fontSize: 14),
              ),
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
              contentPadding: const EdgeInsets.symmetric(horizontal: 8),
              leading: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
              title: Text(
                'Hapus dari Riwayat',
                style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w600, fontSize: 14),
              ),
              onTap: () {
                Navigator.pop(sheetContext);
                final notifier = ref.read(mediaProvider.notifier);
                notifier.removeFromContinueWatching(movie.id);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      '${movie.title} dihapus dari riwayat tontonan',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w500),
                    ),
                    backgroundColor: AppColors.surfaceContainerHighest,
                    action: SnackBarAction(
                      label: 'BATAL',
                      textColor: AppColors.primary,
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

    return PopScope(
      canPop: !_isSelectionMode,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_isSelectionMode) {
          _exitSelectionMode();
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // 1. Top App Bar terpadu (Logo LiveEuy, Cast, Notifikasi, Avatar Profil / Multi-select bar)
            SliverAppBar(
              floating: true,
              pinned: true,
              backgroundColor: AppColors.background.withValues(alpha: 0.85),
              elevation: 0,
              automaticallyImplyLeading: false,
              leading: _isSelectionMode
                  ? IconButton(
                      key: const Key('cancel_selection_mode_button'),
                      icon: const Icon(Icons.close_rounded, color: AppColors.onSurface),
                      tooltip: 'Batal pilih',
                      onPressed: _exitSelectionMode,
                    )
                  : null,
              titleSpacing: _isSelectionMode ? 0 : 16,
              title: _isSelectionMode
                  ? Text(
                      '${_selectedMediaIds.length} dipilih',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    )
                  : const StreamFlixLogo(fontSize: 20),
              actions: _isSelectionMode
                  ? [
                      IconButton(
                        key: const Key('toggle_select_all_button'),
                        icon: Icon(
                          _selectedMediaIds.length == displayedWatchlist.length && displayedWatchlist.isNotEmpty
                              ? Icons.deselect_rounded
                              : Icons.select_all_rounded,
                          color: AppColors.onSurface,
                        ),
                        tooltip: _selectedMediaIds.length == displayedWatchlist.length && displayedWatchlist.isNotEmpty
                            ? 'Batal semua'
                            : 'Pilih semua',
                        onPressed: () => _toggleSelectAll(displayedWatchlist),
                      ),
                      if (_selectedMediaIds.isNotEmpty)
                        IconButton(
                          key: const Key('batch_delete_action_button'),
                          icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
                          tooltip: 'Hapus terpilih',
                          onPressed: () => _confirmBatchDelete(_selectedMediaIds.toList(), allMovies),
                        ),
                      const SizedBox(width: 8),
                    ]
                  : [
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
                                  gradient: AppColors.profileAvatarGradient,
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

                // 2. SECTION 1: LANJUTKAN MENONTON (Hanya saat bukan mode pemilihan multi-item)
                if (!_isSelectionMode && continueWatchingItems.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.play_circle_outline_rounded,
                            color: AppColors.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Lanjutkan Menonton',
                            style: GoogleFonts.outfit(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onSurface,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primaryContainer.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${continueWatchingItems.length}',
                              style: GoogleFonts.outfit(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 86,
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
                      padding: EdgeInsets.fromLTRB(16, 14, 16, 10),
                      child: Divider(color: AppColors.glassBorder, height: 1),
                    ),
                  ),
                ],

                // 3. SECTION 2: DAFTAR TONTONAN ANDA (Header + Filter Chips + Tombol Pilih)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(16, (!_isSelectionMode && continueWatchingItems.isNotEmpty) ? 2 : 14, 16, 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.bookmark_outline_rounded,
                              color: AppColors.primary,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Flexible(
                                    child: Text(
                                      'Daftar Tontonan Anda',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.outfit(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.onSurface,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '(${watchlistItems.length})',
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (!_isSelectionMode && watchlistItems.isNotEmpty)
                              GestureDetector(
                                key: const Key('toggle_selection_mode_button'),
                                onTap: _enterSelectionMode,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceContainerLowest,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: AppColors.outlineVariant.withValues(alpha: 0.25),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.checklist_rounded,
                                        size: 14,
                                        color: AppColors.onSurfaceVariant,
                                      ),
                                      const SizedBox(width: 5),
                                      Text(
                                        'Pilih',
                                        style: GoogleFonts.outfit(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Kategori Filter Chips (Semua, Film, Serial TV) konsisten dengan design system
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

                // 4. ISI DAFTAR KOLEKSI: GRID CARD ATAU EMPTY STATE
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
      ),
    );
  }

  /// Filter Chip Tombol konsisten dengan tema utama
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
              ? AppColors.primaryContainer
              : AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? AppColors.primaryContainer
                : AppColors.outlineVariant.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.2)
                    : AppColors.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$count',
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
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
      width: 280,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.outlineVariant.withValues(alpha: 0.2),
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
                // Thumbnail 16:9 (120x68)
                ClipRRect(
                  borderRadius: BorderRadius.circular(9),
                  child: Stack(
                    children: [
                      CachedNetworkImage(
                        imageUrl: item.backdropUrl,
                        width: 120,
                        height: 68,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          width: 120,
                          height: 68,
                          color: AppColors.surfaceContainerHigh,
                        ),
                        errorWidget: (context, url, error) => Container(
                          width: 120,
                          height: 68,
                          color: AppColors.surfaceContainerHigh,
                          child: const Icon(Icons.movie_rounded, color: AppColors.outline),
                        ),
                      ),
                      // Overlay icon play
                      Positioned.fill(
                        child: Container(
                          color: Colors.black.withValues(alpha: 0.28),
                          child: Center(
                            child: Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: AppColors.surface.withValues(alpha: 0.85),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.play_arrow_rounded,
                                color: Colors.white,
                                size: 18,
                              ),
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
                          backgroundColor: AppColors.surfaceContainerHighest,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryContainer),
                          minHeight: 3.5,
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
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
                            'Tersisa $remainingMinutes menit',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${(item.continueWatchingProgress * 100).toInt()}% selesai',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => _showContinueWatchingOptions(item),
                            behavior: HitTestBehavior.opaque,
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 4.0, vertical: 2.0),
                              child: Icon(
                                Icons.more_vert_rounded,
                                size: 18,
                                color: AppColors.outline,
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

  /// MediaCard poster grid item
  Widget _buildMediaCard(Movie movie) {
    final qualityLabel = movie.resolutionBadges.isNotEmpty
        ? movie.resolutionBadges.first
            .replaceAll('4K UHD', 'FHD')
            .replaceAll('Dolby Atmos', 'Surround')
        : 'HD';
    final isSelected = _selectedMediaIds.contains(movie.id);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected
              ? AppColors.primary
              : AppColors.outlineVariant.withValues(alpha: 0.2),
          width: isSelected ? 2.0 : 1.0,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (_isSelectionMode) {
              _toggleSelection(movie.id);
            } else {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ContentDetailScreen(movie: movie),
                ),
              );
            }
          },
          onLongPress: () {
            if (!_isSelectionMode) {
              _enterSelectionMode(movie.id);
            } else {
              _toggleSelection(movie.id);
            }
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Poster Image Container
              Expanded(
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CachedNetworkImage(
                        imageUrl: movie.posterUrl,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: AppColors.surfaceContainerHigh,
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.surfaceContainerHigh,
                          child: const Icon(Icons.movie_rounded, color: AppColors.outline),
                        ),
                      ),

                      // Overlay jika card sedang dipilih
                      if (isSelected)
                        Container(
                          color: AppColors.primary.withValues(alpha: 0.22),
                        ),

                      // Top Badges Overlay (Quality di kiri)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceContainerLowest.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            qualityLabel,
                            style: GoogleFonts.outfit(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onSurface,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),

                      // Jika Selection Mode: Checkbox indicator di pojok kanan atas
                      // Jika Normal: Tombol Hapus Cepat (Trash) dari Koleksi dengan Konfirmasi Undo
                      if (_isSelectionMode)
                        Positioned(
                          top: 8,
                          right: 8,
                          child: GestureDetector(
                            onTap: () => _toggleSelection(movie.id),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.surfaceContainerLowest.withValues(alpha: 0.85),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.outlineVariant.withValues(alpha: 0.5),
                                  width: isSelected ? 0 : 1.5,
                                ),
                              ),
                              child: isSelected
                                  ? const Icon(
                                      Icons.check_rounded,
                                      color: Colors.white,
                                      size: 17,
                                    )
                                  : null,
                            ),
                          ),
                        )
                      else
                        Positioned(
                          top: 8,
                          right: 8,
                          child: GestureDetector(
                            onTap: () {
                              ref.read(mediaProvider.notifier).toggleWatchlist(movie.id);
                              ScaffoldMessenger.of(context).clearSnackBars();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    '${movie.title} dihapus dari koleksi',
                                    style: GoogleFonts.inter(fontWeight: FontWeight.w500),
                                  ),
                                  duration: const Duration(seconds: 3),
                                  backgroundColor: AppColors.surfaceContainerHighest,
                                  action: SnackBarAction(
                                    label: 'BATAL',
                                    textColor: AppColors.primary,
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
                                color: AppColors.surfaceContainerLowest.withValues(alpha: 0.85),
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                              ),
                              child: const Tooltip(
                                message: 'Hapus dari Koleksi',
                                child: Icon(
                                  Icons.delete_outline_rounded,
                                  color: AppColors.onSurfaceVariant,
                                  size: 15,
                                ),
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
                            color: AppColors.surfaceContainerLowest.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded, size: 12, color: AppColors.accentGold),
                              const SizedBox(width: 3),
                              Text(
                                '${movie.userRating}',
                                style: GoogleFonts.outfit(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.accentGold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Quick play button di pojok kanan bawah poster (hanya aktif saat bukan mode seleksi)
                      if (!_isSelectionMode)
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
                              decoration: const BoxDecoration(
                                color: AppColors.primaryContainer,
                                shape: BoxShape.circle,
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
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
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
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${movie.matchScore.toInt()}% Cocok',
                          style: GoogleFonts.outfit(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
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

  /// Empty state ketika belum ada item sama sekali di koleksi
  Widget _buildEmptyWatchlistState() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 40, 20, 40),
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryContainer,
                ),
                child: const Icon(
                  Icons.bookmark_outline_rounded,
                  size: 28,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Daftar Koleksi Anda Masih Kosong',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurface,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Jelajahi berbagai judul film dan serial menarik di LiveEuy, lalu klik ikon tanda tambah (+) untuk menyimpannya di sini.',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 22),
              ElevatedButton.icon(
                onPressed: () {
                  widget.onNavigateHome?.call();
                  widget.onNavigateTab?.call(0);
                },
                icon: const Icon(Icons.explore_rounded, size: 16),
                label: Text(
                  'Jelajahi Film Sekarang',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    letterSpacing: 0.3,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryContainer,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
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
              size: 36,
              color: AppColors.outline,
            ),
            const SizedBox(height: 12),
            Text(
              'Belum ada $_selectedCategory dalam koleksi',
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.onSurface,
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
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primaryContainer),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: Text(
                'Tampilkan Semua',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
