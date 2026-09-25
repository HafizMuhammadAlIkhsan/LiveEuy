import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liveeuy_mob/main.dart';

void main() {
  testWidgets('Test clicking profile tab and profile avatar', (tester) async {
    // Set a phone screen resolution
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      const ProviderScope(
        child: LiveEuyApp(),
      ),
    );
    await tester.pump(const Duration(milliseconds: 200));

    // 1. Tap on AKUN tab in bottom nav
    final akunTab = find.text('AKUN');
    expect(akunTab, findsOneWidget);
    await tester.tap(akunTab);
    await tester.pump(const Duration(milliseconds: 200));

    // Verify profile elements are visible
    expect(find.text('PREFERENSI PEMUTAR & STREAMING'), findsOneWidget);

    // 2. Switch back to BERANDA tab
    final berandaTab = find.text('BERANDA');
    expect(berandaTab, findsOneWidget);
    await tester.tap(berandaTab);
    await tester.pump(const Duration(milliseconds: 200));

    // 3. Tap on profile avatar from Beranda SliverAppBar using explicit key
    final homeAvatar = find.byKey(const Key('home_profile_avatar'));
    expect(homeAvatar, findsOneWidget);
    await tester.tap(homeAvatar);
    await tester.pump(const Duration(milliseconds: 200));

    // Verify switched to Akun tab
    expect(find.text('PREFERENSI PEMUTAR & STREAMING'), findsOneWidget);

    // 4. Switch to CARI tab
    final cariTab = find.text('CARI');
    expect(cariTab, findsOneWidget);
    await tester.tap(cariTab);
    await tester.pump(const Duration(milliseconds: 200));

    // 5. Tap on profile avatar from Cari SliverAppBar using explicit key
    final searchAvatar = find.byKey(const Key('search_profile_avatar'));
    expect(searchAvatar, findsOneWidget);
    await tester.tap(searchAvatar);
    await tester.pump(const Duration(milliseconds: 200));

    // Verify switched to Akun tab
    expect(find.text('PREFERENSI PEMUTAR & STREAMING'), findsOneWidget);

    // 6. Switch to KOLEKSI tab
    final koleksiTab = find.text('KOLEKSI');
    expect(koleksiTab, findsOneWidget);
    await tester.tap(koleksiTab);
    await tester.pump(const Duration(milliseconds: 200));

    // 7. Switch back to AKUN tab
    await tester.tap(akunTab);
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('PREFERENSI PEMUTAR & STREAMING'), findsOneWidget);
  });
}
