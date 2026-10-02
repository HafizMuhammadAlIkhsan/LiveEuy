import 'package:get/get.dart';
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

class NotificationController extends GetxController {
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

  NotificationState _state = const NotificationState(
    items: _defaultItems,
    hasUnread: true,
  );

  NotificationState get state => _state;
  set state(NotificationState val) {
    _state = val;
    update();
  }

  NotificationController({
    LocalStorageService? storageService,
    DeepLinkService? deepLinkService,
  })  : _storageService = storageService,
        _deepLinkService = deepLinkService;

  @override
  void onInit() {
    super.onInit();
    _loadFromStorage();
  }

  void _loadFromStorage() {
    final storage = _storageService ?? (Get.isRegistered<LocalStorageService>() ? Get.find<LocalStorageService>() : null);
    if (storage == null) return;
    try {
      final saved = storage.getNotifications();
      if (saved.isNotEmpty) {
        final anyUnread = saved.any((item) => !item.isRead);
        state = NotificationState(items: saved, hasUnread: anyUnread);
      } else {
        storage.saveNotifications(_defaultItems);
      }
    } catch (_) {}
  }

  void _persist() {
    final storage = _storageService ?? (Get.isRegistered<LocalStorageService>() ? Get.find<LocalStorageService>() : null);
    storage?.saveNotifications(state.items);
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

  void removeNotification(String id) {
    final updated = state.items.where((item) => item.id != id).toList();
    final anyUnread = updated.any((item) => !item.isRead);
    state = NotificationState(items: updated, hasUnread: anyUnread);
    _persist();
  }

  void clearAll() {
    state = const NotificationState(items: [], hasUnread: false);
    _persist();
  }

  void triggerContinueWatchingReminder({
    required String mediaId,
    required String title,
    required double progressPercent,
  }) {
    final alreadyExists = state.items.any(
      (item) => item.targetMediaId == mediaId && !item.isRead,
    );
    if (alreadyExists) return;

    final percentStr = (progressPercent * 100).toInt();
    final newItem = NotificationItem(
      id: 'notif_cw_${mediaId}_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Lanjutkan: $title',
      message: 'Tersisa ${100 - percentStr}% lagi. Yuk lanjutkan tontonanmu!',
      time: 'Baru saja',
      iconType: 'flame',
      targetMediaId: mediaId,
      deepLinkUrl: 'liveeuy://watch/$mediaId',
      isRead: false,
      createdAt: DateTime.now(),
    );
    addNotification(newItem);
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

typedef NotificationNotifier = NotificationController;
