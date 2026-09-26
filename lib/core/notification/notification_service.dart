import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/notification_model.dart';
import '../deeplink/deep_link_service.dart';
import '../storage/local_storage_service.dart';
import '../theme/app_theme.dart';

/// Service untuk mengelola siklus hidup notifikasi (Offline Storage + In-App Dispatcher + Deep Link).
class NotificationService {
  final LocalStorageService? _storageService;
  final DeepLinkService _deepLinkService;

  NotificationService({
    LocalStorageService? storageService,
    required DeepLinkService deepLinkService,
  })  : _storageService = storageService,
        _deepLinkService = deepLinkService;

  /// Memuat notifikasi tersimpan dari penyimpanan lokal (Offline-First)
  List<NotificationItem> loadSavedNotifications() {
    if (_storageService == null) return [];
    return _storageService.getNotifications();
  }

  /// Menyimpan daftar notifikasi ke penyimpanan lokal
  Future<void> persistNotifications(List<NotificationItem> items) async {
    if (_storageService == null) return;
    await _storageService.saveNotifications(items);
  }

  /// Handler saat item notifikasi diklik pengguna (Navigasi via Deep Link)
  bool handleNotificationClick(NotificationItem item) {
    final link = item.effectiveDeepLink;
    return _deepLinkService.handleDeepLink(link);
  }

  /// Menampilkan In-App Notification Banner interaktif di bagian atas layar
  void showInAppBanner(
    BuildContext context,
    NotificationItem item, {
    VoidCallback? onDismissed,
  }) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;

    messenger.removeCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        duration: const Duration(seconds: 5),
        content: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerHigh.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.primary.withValues(alpha: 0.3),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  item.iconType == 'flame'
                      ? Icons.local_fire_department_rounded
                      : Icons.auto_awesome_rounded,
                  color: AppColors.primary,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.message,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 11,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () {
                  messenger.hideCurrentSnackBar();
                  handleNotificationClick(item);
                  onDismissed?.call();
                },
                child: const Text(
                  'Lihat',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // Trigger Cases untuk Platform Streaming LiveEuy
  // ===========================================================================

  /// Case 1: Notifikasi rilis episode serial baru
  NotificationItem createNewEpisodeNotification({
    required String seriesTitle,
    required String episodeTitle,
    required String mediaId,
  }) {
    return NotificationItem(
      id: 'notif_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Episode Baru: $seriesTitle',
      message: '$episodeTitle sekarang sudah tayang dalam kualitas Full HD.',
      time: 'Baru saja',
      iconType: 'sparkles',
      targetMediaId: mediaId,
      deepLinkUrl: 'liveeuy://media/$mediaId',
      isRead: false,
      createdAt: DateTime.now(),
    );
  }

  /// Case 2: Reminder Lanjutkan Tontonan (Continue Watching)
  NotificationItem createContinueWatchingReminder({
    required String movieTitle,
    required String mediaId,
    required double progressPercent,
  }) {
    final percentStr = (progressPercent * 100).toInt();
    return NotificationItem(
      id: 'notif_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Lanjutkan Menonton: $movieTitle',
      message: 'Anda baru menonton $percentStr%. Klik di sini untuk melanjutkan.',
      time: 'Baru saja',
      iconType: 'flame',
      targetMediaId: mediaId,
      deepLinkUrl: 'liveeuy://watch/$mediaId',
      isRead: false,
      createdAt: DateTime.now(),
    );
  }

  /// Case 3: Rekomendasi Tontonan Trending
  NotificationItem createRecommendationNotification({
    required String title,
    required String genre,
    required String mediaId,
  }) {
    return NotificationItem(
      id: 'notif_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Sedang Hangat di LiveEuy',
      message: '$title ($genre) masuk jajaran tayangan paling diminati penonton.',
      time: 'Baru saja',
      iconType: 'flame',
      targetMediaId: mediaId,
      deepLinkUrl: 'liveeuy://media/$mediaId',
      isRead: false,
      createdAt: DateTime.now(),
    );
  }
}

/// Provider singleton NotificationService
final notificationServiceProvider = Provider<NotificationService>((ref) {
  LocalStorageService? storage;
  try {
    storage = ref.watch(localStorageServiceProvider);
  } catch (_) {}
  final deepLinkService = ref.watch(deepLinkServiceProvider);

  return NotificationService(
    storageService: storage,
    deepLinkService: deepLinkService,
  );
});
