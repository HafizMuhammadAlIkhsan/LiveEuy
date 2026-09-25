import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  NotificationNotifier()
      : super(const NotificationState(
          items: [
            NotificationItem(
              id: 'notif_1',
              title: 'Episode Baru Rilis!',
              message:
                  'Cyberpunk: Neo Nusantara Musim 2 Episode 1 sekarang sudah tayang dalam format Full HD Original.',
              time: '15 menit lalu',
              iconType: 'sparkles',
              targetMediaId: 'm_hero',
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
              isRead: false,
            ),
          ],
          hasUnread: true,
        ));

  void markAllAsRead() {
    final updated = state.items.map((item) => item.copyWith(isRead: true)).toList();
    state = NotificationState(items: updated, hasUnread: false);
  }

  void markAsRead(String id) {
    final updated = state.items.map((item) {
      if (item.id == id) return item.copyWith(isRead: true);
      return item;
    }).toList();
    final anyUnread = updated.any((item) => !item.isRead);
    state = NotificationState(items: updated, hasUnread: anyUnread);
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier();
});
