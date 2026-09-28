import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/deeplink/deep_link_service.dart';
import '../core/storage/local_storage_service.dart';
import '../models/notification_model.dart';

class NotificationState {
  final List<NotificationItem> items;
  final bool hasUnread;

  const NotificationState({
    required this.items,
    required this.hasUnread,
  });

  NotificationState copyWith({
    List<NotificationItem>? items,
    bool? hasUnread,
  }) {
    return NotificationState(
      items: items ?? this.items,
      hasUnread: hasUnread ?? this.hasUnread,
    );
  }
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  final LocalStorageService? _storageService;
  final DeepLinkService? _deepLinkService;

  static const List<NotificationItem> _defaultItems = [
    NotificationItem(
      id: 'notif_1',
      title: 'Episode Baru Rilis!',
      message:
          'Cyberpunk: Neo Nusantara Musim 2 Episode 1 sekarang sudah tayang dalam format Full HD Original.',
      time: '15 menit lalu',
      iconType: 'sparkles',
      targetMediaId: 'm_hero',
      deepLinkUrl: 'liveeuy://media/m_hero',
      isRead: false,
    ),
    NotificationItem(
      id: 'notif_2',
      title: 'Rekomendasi Minggu Ini',
      message:
          'Film horor terlaris "Bayang di Balik Kabut" menempati Top 3 di Indonesia.',
      time: '2 jam lalu',
      iconType: 'flame',
      targetMediaId: 'm3',
      deepLinkUrl: 'liveeuy://media/m3',
      isRead: false,
    ),
  ];

  NotificationNotifier({
    LocalStorageService? storageService,
    DeepLinkService? deepLinkService,
  })  : _storageService = storageService,
        _deepLinkService = deepLinkService,
        super(const NotificationState(
          items: _defaultItems,
          hasUnread: true,
        )) {
    _loadFromStorage();
  }

  void _loadFromStorage() {
    if (_storageService == null) return;
    try {
      final saved = _storageService.getNotifications();
      if (saved.isNotEmpty) {
        final anyUnread = saved.any((item) => !item.isRead);
        state = NotificationState(items: saved, hasUnread: anyUnread);
      } else {
        // Save initial default items to storage
        _storageService.saveNotifications(_defaultItems);
      }
    } catch (_) {}
  }

  void _persist() {
    _storageService?.saveNotifications(state.items);
  }

  void markAllAsRead() {
    final updated = state.items.map((item) => item.copyWith(isRead: true)).toList();
    state = NotificationState(items: updated, hasUnread: false);
    _persist();
  }

  void markAsRead(String id) {
    final updated = state.items.map((item) {
      if (item.id == id) return item.copyWith(isRead: true);
      return item;
    }).toList();
    final anyUnread = updated.any((item) => !item.isRead);
    state = NotificationState(items: updated, hasUnread: anyUnread);
    _persist();
  }

  void addNotification(NotificationItem item) {
    final updated = [item, ...state.items];
    state = NotificationState(items: updated, hasUnread: true);
    _persist();
  }

  bool openNotification(NotificationItem item) {
    markAsRead(item.id);
    if (_deepLinkService != null) {
      return _deepLinkService.handleDeepLink(item.effectiveDeepLink);
    }
    return false;
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  LocalStorageService? storage;
  try {
    storage = ref.watch(localStorageServiceProvider);
  } catch (_) {}
  final deepLinkService = ref.watch(deepLinkServiceProvider);

  return NotificationNotifier(
    storageService: storage,
    deepLinkService: deepLinkService,
  );
});
