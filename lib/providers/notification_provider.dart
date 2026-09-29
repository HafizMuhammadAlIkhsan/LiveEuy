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
      title: 'Cyberpunk: Neo Nusantara',
      message: 'Musim 2 Ep. 1 sudah tayang.',
      time: '15 mnt lalu',
      iconType: 'sparkles',
      targetMediaId: 'm_hero',
      deepLinkUrl: 'liveeuy://media/m_hero',
      isRead: false,
    ),
    NotificationItem(
      id: 'notif_2',
      title: 'Bayang di Balik Kabut',
      message: 'Masuk Top 3 minggu ini.',
      time: '2 jam lalu',
      iconType: 'flame',
      targetMediaId: 'm3',
      deepLinkUrl: 'liveeuy://media/m3',
      isRead: false,
    ),
  ];

  NotificationNotifier({
    this._storageService,
    this._deepLinkService,
  })  : super(const NotificationState(
          items: _defaultItems,
          hasUnread: true,
        )) {
    _loadFromStorage();
  }

  void _loadFromStorage() {
    final storage = _storageService;
    if (storage == null) return;
    try {
      final saved = storage.getNotifications();
      if (saved.isNotEmpty) {
        final anyUnread = saved.any((item) => !item.isRead);
        state = NotificationState(items: saved, hasUnread: anyUnread);
      } else {
        // Save initial default items to storage
        storage.saveNotifications(_defaultItems);
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
    final deepLink = _deepLinkService;
    if (deepLink != null) {
      return deepLink.handleDeepLink(item.effectiveDeepLink);
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
