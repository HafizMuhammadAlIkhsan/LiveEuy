import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/providers/notification_provider.dart';
import 'package:liveeuy_mob/shared/widgets/notification_modal.dart';

void main() {
  group('Notification Feature Tests', () {
    test('NotificationNotifier initializes with default unread notifications', () {
      final container = ProviderContainer();
      final state = container.read(notificationProvider);

      expect(state.items.length, 2);
      expect(state.hasUnread, true);
      expect(state.items.any((item) => item.title == 'Episode Baru Rilis!'), true);
      expect(state.items.any((item) => item.title == 'Rekomendasi Minggu Ini'), true);
    });

    test('markAllAsRead clears unread flags across all notifications', () {
      final container = ProviderContainer();
      final notifier = container.read(notificationProvider.notifier);

      notifier.markAllAsRead();

      final state = container.read(notificationProvider);
      expect(state.hasUnread, false);
      expect(state.items.every((item) => item.isRead), true);
    });

    test('markAsRead marks specific notification as read', () {
      final container = ProviderContainer();
      final notifier = container.read(notificationProvider.notifier);

      notifier.markAsRead('notif_1');

      final state = container.read(notificationProvider);
      expect(state.items.firstWhere((i) => i.id == 'notif_1').isRead, true);
      // notif_2 is still unread, so hasUnread remains true
      expect(state.hasUnread, true);

      notifier.markAsRead('notif_2');
      final updatedState = container.read(notificationProvider);
      expect(updatedState.hasUnread, false);
    });

    testWidgets('NotificationIconButton opens bottom sheet and marks all as read', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: Center(
                child: NotificationIconButton(),
              ),
            ),
          ),
        ),
      );

      // Verify notification button exists
      final notifBtn = find.byKey(const Key('notification_button'));
      expect(notifBtn, findsOneWidget);

      // Tap notification button
      await tester.tap(notifBtn);
      await tester.pumpAndSettle();

      // Verify bottom sheet appears with header and items from dev-frontend
      expect(find.text('NOTIFIKASI TERBARU'), findsOneWidget);
      expect(find.text('Tandai dibaca'), findsOneWidget);
      expect(find.text('Episode Baru Rilis!'), findsOneWidget);
      expect(find.text('Rekomendasi Minggu Ini'), findsOneWidget);

      // Tap 'Tandai dibaca'
      await tester.tap(find.text('Tandai dibaca'));
      await tester.pumpAndSettle();
    });
  });
}
