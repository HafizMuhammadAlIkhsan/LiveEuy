import 'dart:ui';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/login_screen.dart';
import 'features/collection/collection_screen.dart';
import 'features/home/home_screen.dart';
import 'features/search/search_screen.dart';
import 'models/user_settings_model.dart';
import 'providers/auth_provider.dart';
import 'providers/media_provider.dart';
import 'providers/user_settings_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/deeplink/deep_link_service.dart';
import 'core/storage/local_storage_service.dart';
import 'shared/widgets/device_security_sheet.dart';
import 'shared/widgets/streamflix_logo.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences? prefs;
  try {
    prefs = await SharedPreferences.getInstance();
  } catch (_) {}

  final localStorage = prefs != null ? LocalStorageService(prefs: prefs) : null;

  runApp(
    ProviderScope(
      overrides: [
        if (localStorage != null)
          localStorageServiceProvider.overrideWithValue(localStorage),
      ],
      child: const LiveEuyApp(),
    ),
  );
}

class LiveEuyApp extends ConsumerWidget {
  const LiveEuyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deepLinkService = ref.watch(deepLinkServiceProvider);

    return MaterialApp(
      navigatorKey: deepLinkService.navigatorKey,
      title: 'LiveEuy',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationScreen(),
    );
  }
}

typedef StreamFlixApp = LiveEuyApp;

class _VipPackageInfo {
  final String title;
  final String tierName;
  final String price;
  final String period;
  final String badge;
  final Color badgeBg;
  final String quality;
  final String perks;
  final bool isBestValue;

  const _VipPackageInfo({
    required this.title,
    required this.tierName,
    required this.price,
    required this.period,
    required this.badge,
    required this.badgeBg,
    required this.quality,
    required this.perks,
    this.isBestValue = false,
  });
}

class MainNavigationScreen extends ConsumerStatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  ConsumerState<MainNavigationScreen> createState() =>
      _MainNavigationScreenState();
}

class _MainNavigationScreenState extends ConsumerState<MainNavigationScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final deepLinkService = ref.read(deepLinkServiceProvider);
      deepLinkService.onNavigateTab = _onNavigateTab;
      deepLinkService.mediaLookup = (id) {
        return ref.read(mediaProvider.notifier).findMovieById(id);
      };
    });
  }

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
      HomeScreen(
        onNavigateTab: _onNavigateTab,
        isActive: _currentIndex == 0,
      ),
      SearchScreen(onNavigateTab: _onNavigateTab),
      CollectionScreen(
        onNavigateTab: _onNavigateTab,
        onNavigateHome: () => _onNavigateTab(0),
        mediaState: mediaState,
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
/// Aliased ke CollectionScreen yang selaras dengan dev-frontend WatchlistView.
typedef KoleksiTab = CollectionScreen;

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
    final user = ref.read(authProvider);
    if (!user.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Mode Tamu tidak dapat membeli VIP. Silakan masuk terlebih dahulu.',
            style: GoogleFonts.outfit(),
          ),
          backgroundColor: AppColors.surfaceContainerHighest,
          action: SnackBarAction(
            label: 'Masuk',
            textColor: AppColors.brand400,
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ),
      );
      return;
    }

    int selectedPlan = 2; // Default to best-value (Tahunan)
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final plans = [
            const _VipPackageInfo(
              title: 'VIP Standar',
              tierName: 'VIP Standard',
              price: 'Rp 49.000',
              period: '/ bln',
              badge: 'PALING EFISIEN',
              badgeBg: Color(0xFF0284C7),
              quality: 'Full HD 1080p',
              perks: 'Full HD 1080p • Bebas Iklan • 2 Layar Bersamaan',
            ),
            const _VipPackageInfo(
              title: 'VIP Cinema Ultra',
              tierName: 'VIP Cinema Ultra',
              price: 'Rp 89.000',
              period: '/ bln',
              badge: 'STUDIO MASTER',
              badgeBg: Color(0xFFD97706),
              quality: '4K UHD + Atmos',
              perks: '4K Ultra HD & Vision • Dolby Atmos • 4 Layar • Unduh Offline',
            ),
            const _VipPackageInfo(
              title: 'VIP Cinema Ultra 1 Tahun',
              tierName: 'VIP Cinema Ultra',
              price: 'Rp 399.000',
              period: '/ thn',
              badge: 'HEMAT 62%',
              badgeBg: Color(0xFF059669),
              quality: 'Best Value 4K',
              perks: 'Akses 1 Tahun Penuh 4K Ultra HD • Setara Rp 33.250/bln',
              isBestValue: true,
            ),
          ];

          final currentPlan = plans[selectedPlan];

          return Container(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.90,
            ),
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(color: AppColors.glassBorder),
            ),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
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
                  const SizedBox(height: 14),

                  // Header with safe flexible wrapping (fixes right-side overflow)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
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
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Langganan LiveEuy VIP Premium',
                              style: GoogleFonts.outfit(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Pilihan paket sinema fleksibel selaras Web & Mobile',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                        icon: const Icon(Icons.close_rounded, color: AppColors.outline),
                        onPressed: () => Navigator.pop(sheetCtx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Benefits
                  _buildBenefitRow(Icons.hd_rounded, 'Resolusi Full HD 1080p hingga 4K UHD & Dolby Vision'),
                  _buildBenefitRow(Icons.surround_sound_rounded, 'Tata Suara Spasial Bioskop Dolby Atmos'),
                  _buildBenefitRow(Icons.block_rounded, 'Sepenuhnya Bebas Iklan & Tanpa Batas Nonton'),
                  _buildBenefitRow(Icons.devices_rounded, 'Mendukung hingga 4 Perangkat Aktif & Unduh Offline'),

                  const SizedBox(height: 16),

                  Text(
                    'PILIH PAKET LANGGANAN',
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                      color: AppColors.outline,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Plan options
                  ...List.generate(plans.length, (index) {
                    final p = plans[index];
                    final isSelected = selectedPlan == index;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: GestureDetector(
                        onTap: () => setModalState(() => selectedPlan = index),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF433FFE).withValues(alpha: 0.16)
                                : AppColors.surfaceContainerLowest,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFF433FFE)
                                  : AppColors.outlineVariant.withValues(alpha: 0.25),
                              width: isSelected ? 1.8 : 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.only(top: 2.0),
                                    child: Icon(
                                      isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                                      color: isSelected ? const Color(0xFF81CFFF) : AppColors.outline,
                                      size: 19,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Wrap(
                                          crossAxisAlignment: WrapCrossAlignment.center,
                                          spacing: 6,
                                          runSpacing: 4,
                                          children: [
                                            Text(
                                              p.title,
                                              style: GoogleFonts.outfit(
                                                fontSize: 14.5,
                                                fontWeight: FontWeight.w700,
                                                color: isSelected ? Colors.white : AppColors.onSurface,
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: p.badgeBg.withValues(alpha: 0.2),
                                                borderRadius: BorderRadius.circular(6),
                                                border: Border.all(color: p.badgeBg.withValues(alpha: 0.4)),
                                              ),
                                              child: Text(
                                                p.badge,
                                                style: GoogleFonts.outfit(
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w800,
                                                  letterSpacing: 0.4,
                                                  color: p.badgeBg == const Color(0xFF059669)
                                                      ? Colors.greenAccent
                                                      : p.badgeBg == const Color(0xFFD97706)
                                                          ? Colors.amberAccent
                                                          : const Color(0xFF81CFFF),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 5),
                                        Text(
                                          p.perks,
                                          style: GoogleFonts.inter(
                                            fontSize: 11.5,
                                            height: 1.35,
                                            color: isSelected ? AppColors.onSurfaceVariant : AppColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        p.price,
                                        style: GoogleFonts.outfit(
                                          fontSize: 14.5,
                                          fontWeight: FontWeight.w800,
                                          color: isSelected ? Colors.white : AppColors.onSurface,
                                        ),
                                      ),
                                      Text(
                                        p.period,
                                        style: GoogleFonts.inter(
                                          fontSize: 11,
                                          color: AppColors.outline,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),

                  const SizedBox(height: 14),

                  // Activate CTA Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(sheetCtx);
                        ref.read(authProvider.notifier).upgradeToVip(currentPlan.tierName);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(Icons.workspace_premium_rounded, color: Colors.amberAccent, size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    'Selamat! Akun Anda kini aktif paket ${currentPlan.title}!',
                                    style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                                  ),
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
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Text(
                          'Beli ${currentPlan.title} (${currentPlan.price}${currentPlan.period})',
                          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700),
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

  Widget _buildBenefitRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF81CFFF)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant),
            ),
          ),
        ],
      ),
    );
  }

  void _showStreamingQualitySheet(BuildContext context, UserSettings settings) {
    final isVip = widget.userProfile.isVip;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
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
                          decoration: const BoxDecoration(
                            color: AppColors.primaryContainer,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.high_quality_rounded, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Kualitas Streaming',
                                style: GoogleFonts.outfit(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.onSurface,
                                ),
                              ),
                              Text(
                                'Pilih resolusi dan konsumsi kuota data tontonan',
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
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.outline),
                    onPressed: () => Navigator.pop(sheetCtx),
                  ),
                ],
              ),
            const SizedBox(height: 16),
            ...StreamingQuality.values.map((q) {
              final isSelected = settings.streamingQuality == q;
              final isLocked = q.requiresVip && !isVip;

              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: InkWell(
                  onTap: () {
                    if (isLocked) {
                      Navigator.pop(sheetCtx);
                      _showBuyVipDialog(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Kualitas tertinggi eksklusif untuk member LIVEEUY VIP Premium.',
                            style: GoogleFonts.outfit(),
                          ),
                          backgroundColor: AppColors.surfaceContainerHighest,
                        ),
                      );
                      return;
                    }

                    ref.read(userSettingsProvider.notifier).setStreamingQuality(q);
                    Navigator.pop(sheetCtx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(
                          children: [
                            const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Kualitas streaming diubah ke ${q.label}',
                                style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                        backgroundColor: AppColors.surfaceContainerHighest,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.15)
                          : AppColors.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.outlineVariant.withValues(alpha: 0.2),
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected
                              ? Icons.radio_button_checked_rounded
                              : (isLocked ? Icons.lock_outline_rounded : Icons.radio_button_off_rounded),
                          color: isSelected
                              ? AppColors.primary
                              : (isLocked ? AppColors.outline : AppColors.outlineVariant),
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      q.label,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.outfit(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: isSelected
                                            ? AppColors.primary
                                            : AppColors.onSurface,
                                      ),
                                    ),
                                  ),
                                  if (q.badge != null) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        gradient: q.requiresVip
                                            ? const LinearGradient(
                                                colors: [Color(0xFF433FFE), Color(0xFF81CFFF)],
                                              )
                                            : null,
                                        color: q.requiresVip
                                            ? null
                                            : (q.id == 'DATA_SAVER'
                                                ? Colors.greenAccent.withValues(alpha: 0.2)
                                                : AppColors.primaryContainer.withValues(alpha: 0.2)),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        q.badge!,
                                        style: GoogleFonts.outfit(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                          color: q.requiresVip
                                              ? Colors.white
                                              : (q.id == 'DATA_SAVER'
                                                  ? Colors.greenAccent
                                                  : AppColors.primary),
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${q.resolutionLabel} • ${q.estimatedUsage}',
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
                ),
              );
            }),
          ],
        ),
      ),
    ),
  );
}

  void _showStorageCacheSheet(BuildContext context, UserSettings settings) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (sheetCtx) => Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
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
                          decoration: const BoxDecoration(
                            color: AppColors.primaryContainer,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.sd_card_rounded, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Penyimpanan & Cache',
                                style: GoogleFonts.outfit(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.onSurface,
                                ),
                              ),
                              Text(
                                'Kelola pemakaian ruang memori aplikasi',
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
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.outline),
                    onPressed: () => Navigator.pop(sheetCtx),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Storage breakdown
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            'Total Penyimpanan Terpakai',
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ),
                        Text(
                          '12.4 GB / 128 GB',
                          style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.onSurface),
                        ),
                      ],
                    ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: 0.097,
                      backgroundColor: AppColors.surfaceContainerHighest,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildStorageRow(Icons.file_download_done_rounded, 'Video Unduhan Offline', '11.8 GB'),
                  const SizedBox(height: 8),
                  _buildStorageRow(Icons.image_outlined, 'Cache Gambar & Metadata', settings.cacheFormatted),
                  const SizedBox(height: 8),
                  _buildStorageRow(Icons.storage_rounded, 'Ruang Bebas Perangkat', '115.6 GB'),
                ],
              ),
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: settings.cacheSizeBytes <= 0
                    ? null
                    : () {
                        final clearedSize = settings.cacheFormatted;
                        ref.read(userSettingsProvider.notifier).clearCache();
                        Navigator.pop(sheetCtx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(Icons.cleaning_services_rounded, color: Colors.greenAccent, size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    'Cache aplikasi ($clearedSize) berhasil dibersihkan!',
                                    style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                            backgroundColor: AppColors.surfaceContainerHighest,
                          ),
                        );
                      },
                icon: const Icon(Icons.cleaning_services_rounded, size: 18),
                label: Text(
                  settings.cacheSizeBytes <= 0
                      ? 'Cache Bersih'
                      : 'Bersihkan Cache (${settings.cacheFormatted})',
                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryContainer,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

  Widget _buildStorageRow(IconData icon, String label, String size) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.outline),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant),
          ),
        ),
        Text(
          size,
          style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.onSurface),
        ),
      ],
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: AppColors.surfaceContainerHigh,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            StreamFlixLogo(fontSize: 20),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'LiveEuy Cinematic Streaming',
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.onSurface,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Versi 2.4.0 (Build 412) • 2026',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.primary),
            ),
            const SizedBox(height: 12),
            Text(
              'Platform streaming film dan serial modern dengan teknologi Dynamic Ambient Glow dan pemutaran video berkecepatan tinggi.',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 12),
            Divider(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
            const SizedBox(height: 8),
            Text(
              '© 2026 LiveEuy Team. Hak cipta dilindungi undang-undang.',
              style: GoogleFonts.inter(fontSize: 10, color: AppColors.outline),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(dialogCtx),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryContainer,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(
              'Tutup',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    final currentPassController = TextEditingController();
    final newPassController = TextEditingController();
    final confirmPassController = TextEditingController();
    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;
    bool isSubmitting = false;
    String? errorMessage;

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.surfaceContainerHigh,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.lock_reset_rounded, color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 10),
              Text(
                'Ganti Kata Sandi',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurface,
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Masukkan kata sandi saat ini dan buat kata sandi baru (minimal 6 karakter).',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 16),
                if (errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.errorContainer.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.errorContainer),
                    ),
                    child: Text(
                      errorMessage!,
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.error),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                TextField(
                  key: const Key('change_password_current_field'),
                  controller: currentPassController,
                  obscureText: obscureCurrent,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'Kata Sandi Saat Ini',
                    labelStyle: GoogleFonts.inter(color: AppColors.outline, fontSize: 12),
                    filled: true,
                    fillColor: AppColors.surfaceContainerLowest,
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureCurrent ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: AppColors.outline,
                        size: 18,
                      ),
                      onPressed: () => setDialogState(() => obscureCurrent = !obscureCurrent),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  key: const Key('change_password_new_field'),
                  controller: newPassController,
                  obscureText: obscureNew,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'Kata Sandi Baru (Min. 6 Karakter)',
                    labelStyle: GoogleFonts.inter(color: AppColors.outline, fontSize: 12),
                    filled: true,
                    fillColor: AppColors.surfaceContainerLowest,
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureNew ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: AppColors.outline,
                        size: 18,
                      ),
                      onPressed: () => setDialogState(() => obscureNew = !obscureNew),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  key: const Key('change_password_confirm_field'),
                  controller: confirmPassController,
                  obscureText: obscureConfirm,
                  style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: 'Konfirmasi Kata Sandi Baru',
                    labelStyle: GoogleFonts.inter(color: AppColors.outline, fontSize: 12),
                    filled: true,
                    fillColor: AppColors.surfaceContainerLowest,
                    suffixIcon: IconButton(
                      icon: Icon(
                        obscureConfirm ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: AppColors.outline,
                        size: 18,
                      ),
                      onPressed: () => setDialogState(() => obscureConfirm = !obscureConfirm),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSubmitting ? null : () => Navigator.pop(dialogCtx),
              child: Text(
                'Batal',
                style: GoogleFonts.outfit(color: AppColors.outline),
              ),
            ),
            ElevatedButton(
              key: const Key('change_password_submit_button'),
              onPressed: isSubmitting
                  ? null
                  : () async {
                      final currentPass = currentPassController.text.trim();
                      final newPass = newPassController.text.trim();
                      final confirmPass = confirmPassController.text.trim();

                      if (currentPass.isEmpty) {
                        setDialogState(() => errorMessage = 'Kata sandi saat ini tidak boleh kosong.');
                        return;
                      }
                      if (newPass.length < 6) {
                        setDialogState(() => errorMessage = 'Kata sandi baru minimal 6 karakter.');
                        return;
                      }
                      if (newPass != confirmPass) {
                        setDialogState(() => errorMessage = 'Konfirmasi kata sandi tidak cocok.');
                        return;
                      }

                      setDialogState(() {
                        isSubmitting = true;
                        errorMessage = null;
                      });

                      final success = await ref
                          .read(authProvider.notifier)
                          .changePassword(currentPassword: currentPass, newPassword: newPass);

                      if (context.mounted) {
                        Navigator.pop(dialogCtx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              success
                                  ? 'Kata sandi berhasil diperbarui.'
                                  : 'Gagal memperbarui kata sandi. Periksa kata sandi lama Anda.',
                              style: GoogleFonts.outfit(),
                            ),
                            backgroundColor: success
                                ? AppColors.surfaceContainerHighest
                                : AppColors.errorContainer,
                          ),
                        );
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryContainer,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text(
                      'Simpan',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.userProfile;
    final userSettings = ref.watch(userSettingsProvider);

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
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.workspace_premium_rounded, color: Colors.white, size: 14),
                                      const SizedBox(width: 4),
                                      Text(
                                        user.membershipTier.isNotEmpty && user.membershipTier != 'REGULAR'
                                            ? user.membershipTier.toUpperCase()
                                            : 'LIVEEUY VIP',
                                        maxLines: 1,
                                        style: GoogleFonts.outfit(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: 0.6,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            else if (user.isLoggedIn)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: AppColors.outlineVariant.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.person_rounded, color: AppColors.outline, size: 14),
                                      const SizedBox(width: 4),
                                      Text(
                                        'MEMBER STANDAR',
                                        maxLines: 1,
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
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.visibility_outlined, color: AppColors.outline, size: 14),
                                      const SizedBox(width: 4),
                                      Text(
                                        'MODE TAMU',
                                        maxLines: 1,
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
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Metrics Row
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Expanded(child: _buildStatItem('28', 'Ditonton')),
                        Container(width: 1, height: 26, color: AppColors.surfaceVariant),
                        Expanded(child: _buildStatItem('${widget.mediaState.watchlistIds.length}', 'Koleksi')),
                        Container(width: 1, height: 26, color: AppColors.surfaceVariant),
                        Expanded(child: _buildStatItem('Full HD', 'Kualitas')),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // VIP Upgrade Banner (Hanya ditampilkan untuk pengguna terdaftar yang belum VIP)
            if (user.isLoggedIn && !user.isVip) ...[
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
                              'Tingkatkan ke VIP Premium',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Nikmati streaming kualitas tinggi tanpa batas dan bebas iklan.',
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
            ] else if (!user.isLoggedIn) ...[
              // Banner Pengguna Tamu: Tamu tidak bisa beli VIP, diarahkan untuk Masuk Akun
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHigh.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.outlineVariant.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          color: AppColors.surfaceContainerHighest,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.login_rounded, color: AppColors.primary, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Masuk ke Akun Anda',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Masuk untuk menyimpan koleksi tontonan dan riwayat pemutaran.',
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
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginScreen()),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryContainer,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'Masuk',
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
              subtitle: userSettings.streamingQualitySubtitle,
              onTap: () => _showStreamingQualitySheet(context, userSettings),
            ),
            _buildSwitchTile(
              icon: Icons.fast_forward_rounded,
              title: 'Lewati Intro & Rekap Otomatis',
              subtitle: 'Langsung tonton cerita utama',
              value: userSettings.autoSkipIntro,
              onChanged: (v) => ref.read(userSettingsProvider.notifier).setAutoSkipIntro(v),
            ),

            const SizedBox(height: 20),
            _buildSectionHeader('UNDUHAN & PENYIMPANAN'),
            _buildSwitchTile(
              icon: Icons.wifi_rounded,
              title: 'Unduh Hanya via Wi-Fi',
              subtitle: 'Mencegah pemakaian kuota data seluler',
              value: userSettings.wifiOnlyDownload,
              onChanged: (v) => ref.read(userSettingsProvider.notifier).setWifiOnlyDownload(v),
            ),
            _buildSettingsTile(
              icon: Icons.sd_card_rounded,
              title: 'Penyimpanan & Cache',
              subtitle: 'Cache: ${userSettings.cacheFormatted} • Total Digunakan 12.4 GB',
              onTap: () => _showStorageCacheSheet(context, userSettings),
            ),

            const SizedBox(height: 20),
            _buildSectionHeader('NOTIFIKASI & APLIKASI'),
            _buildSwitchTile(
              icon: Icons.notifications_active_outlined,
              title: 'Pemberitahuan Rilis Baru',
              subtitle: 'Rekomendasi film & serial terkini',
              value: userSettings.notifications,
              onChanged: (v) => ref.read(userSettingsProvider.notifier).setNotifications(v),
            ),
            _buildSettingsTile(
              icon: Icons.info_outline_rounded,
              title: 'Tentang LiveEuy',
              subtitle: 'Versi 2.4.0 (Build 412) • Kebijakan Privasi',
              onTap: () => _showAboutDialog(context),
            ),

            const SizedBox(height: 20),
            _buildSectionHeader('KEAMANAN & PERANGKAT'),
            _buildSettingsTile(
              icon: Icons.devices_rounded,
              title: 'Perangkat Terhubung & Sesi',
              subtitle: user.isLoggedIn
                  ? 'Perangkat ini: Mobile • ${user.activeSessions.where((s) => !s.isCurrentDevice).length} sesi Web aktif'
                  : 'Lihat status sesi dan perangkat login',
              onTap: () {
                if (!user.isLoggedIn) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Silakan masuk terlebih dahulu untuk melihat sesi perangkat.',
                        style: GoogleFonts.outfit(),
                      ),
                      backgroundColor: AppColors.surfaceContainerHighest,
                    ),
                  );
                  return;
                }
                DeviceSecuritySheet.show(context);
              },
            ),
            _buildSettingsTile(
              icon: Icons.lock_reset_rounded,
              title: 'Ganti Kata Sandi',
              subtitle: user.isLoggedIn
                  ? 'Perbarui kata sandi akun Anda secara berkala'
                  : 'Masuk untuk mengatur kata sandi',
              onTap: () {
                if (!user.isLoggedIn) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Silakan masuk terlebih dahulu untuk mengganti kata sandi.',
                        style: GoogleFonts.outfit(),
                      ),
                      backgroundColor: AppColors.surfaceContainerHighest,
                    ),
                  );
                  return;
                }
                _showChangePasswordDialog(context);
              },
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
      mainAxisSize: MainAxisSize.min,
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
        ),
        const SizedBox(height: 2),
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
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
