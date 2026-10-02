import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:liveeuy_mob/features/auth/presentation/controllers/auth_controller.dart';
import 'package:liveeuy_mob/main.dart';
import 'test_helper.dart';

void main() {
  group('VIP Subscription Modal & Plan Alignment Tests', () {
    testWidgets('Opens VIP subscription modal on narrow screen with NO text overflow', (tester) async {
      // Narrow device screen (360 width, devicePixelRatio 1.0)
      tester.view.physicalSize = const Size(360, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await initTestDependencies(
        isLoggedIn: true,
        isVip: false,
        name: 'Aria Tester',
        email: 'aria@liveeuy.id',
      );

      await tester.pumpWidget(const LiveEuyApp());
      await tester.pump(const Duration(milliseconds: 100));

      // Navigate to AKUN tab
      await tester.tap(find.text('AKUN'));
      await tester.pump(const Duration(milliseconds: 100));

      // Tap on 'Beli VIP'
      final buyVipBtn = find.text('Beli VIP');
      expect(buyVipBtn, findsOneWidget);
      await tester.tap(buyVipBtn);
      await tester.pump(const Duration(milliseconds: 100));

      // 1. Verify header title renders without any overflow
      expect(find.text('Langganan LiveEuy VIP Premium'), findsOneWidget);
      expect(tester.takeException(), isNull);

      // 2. Verify all 3 tiers aligned with dev-frontend exist
      expect(find.text('VIP Standar'), findsOneWidget);
      expect(find.text('PALING EFISIEN'), findsOneWidget);
      expect(find.textContaining('Rp 49.000'), findsOneWidget);

      expect(find.text('VIP Cinema Ultra'), findsOneWidget);
      expect(find.text('STUDIO MASTER'), findsOneWidget);
      expect(find.textContaining('Rp 89.000'), findsOneWidget);

      expect(find.text('VIP Cinema Ultra 1 Tahun'), findsOneWidget);
      expect(find.text('HEMAT 62%'), findsOneWidget);
      expect(find.textContaining('Rp 399.000'), findsWidgets);

      // 3. Test selecting 'VIP Standar' (Index 0)
      final standarCard = find.text('VIP Standar');
      await tester.ensureVisible(standarCard);
      await tester.pump(const Duration(milliseconds: 50));
      await tester.tap(standarCard);
      await tester.pump(const Duration(milliseconds: 50));

      expect(find.text('Beli VIP Standar (Rp 49.000/ bln)'), findsOneWidget);

      // 4. Test selecting 'VIP Cinema Ultra' (Index 1)
      final ultraCard = find.text('VIP Cinema Ultra');
      await tester.ensureVisible(ultraCard);
      await tester.pump(const Duration(milliseconds: 50));
      await tester.tap(ultraCard);
      await tester.pump(const Duration(milliseconds: 50));

      expect(find.text('Beli VIP Cinema Ultra (Rp 89.000/ bln)'), findsOneWidget);

      // 5. Test selecting 'VIP Cinema Ultra 1 Tahun' (Index 2) and purchasing
      final yearlyCard = find.text('VIP Cinema Ultra 1 Tahun');
      await tester.ensureVisible(yearlyCard);
      await tester.pump(const Duration(milliseconds: 50));
      await tester.tap(yearlyCard);
      await tester.pump(const Duration(milliseconds: 50));

      final purchaseBtn = find.text('Beli VIP Cinema Ultra 1 Tahun (Rp 399.000/ thn)');
      await tester.ensureVisible(purchaseBtn);
      await tester.pump(const Duration(milliseconds: 50));
      expect(purchaseBtn, findsOneWidget);
      await tester.tap(purchaseBtn);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // Verify user state upgraded to VIP with Cinema Ultra tier
      final updatedUser = Get.find<AuthController>().currentUser;
      expect(updatedUser?.isVip, isTrue);
      expect(updatedUser?.membershipTier, 'VIP Cinema Ultra');
      expect(find.textContaining('Selamat! Akun Anda kini aktif paket VIP Cinema Ultra 1 Tahun!'), findsOneWidget);
    });
  });
}
