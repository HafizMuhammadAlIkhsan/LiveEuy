import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liveeuy_mob/main.dart';
import 'package:liveeuy_mob/models/user_settings_model.dart';

void main() {
  group('UserSettings Model & Enum Tests', () {
    test('StreamingQuality enum properties & fromString parsing', () {
      expect(StreamingQuality.fromString('AUTO'), StreamingQuality.auto);
      expect(StreamingQuality.fromString('data_saver'), StreamingQuality.dataSaver);
      expect(StreamingQuality.fromString('HD_720P'), StreamingQuality.hd720);
      expect(StreamingQuality.fromString('FHD_1080P'), StreamingQuality.fhd1080);
      expect(StreamingQuality.fromString('UHD_4K'), StreamingQuality.uhd4k);
      expect(StreamingQuality.fromString('UNKNOWN_XYZ'), StreamingQuality.auto);

      expect(StreamingQuality.uhd4k.requiresVip, isTrue);
      expect(StreamingQuality.fhd1080.requiresVip, isFalse);
      expect(StreamingQuality.auto.badge, equals('REKOMENDASI'));
      expect(StreamingQuality.dataSaver.badge, equals('HEMAT KUOTA'));
    });

    test('UserSettings json serialization and format helpers', () {
      final settings = const UserSettings(
        userId: 'usr_test',
        streamingQuality: StreamingQuality.fhd1080,
        cacheSizeBytes: 356515840,
      );

      final json = settings.toJson();
      expect(json['userId'], 'usr_test');
      expect(json['streamingQuality'], 'FHD_1080P');
      expect(json['cacheSizeBytes'], 356515840);

      final parsed = UserSettings.fromJson(json);
      expect(parsed.userId, 'usr_test');
      expect(parsed.streamingQuality, StreamingQuality.fhd1080);
      expect(parsed.cacheFormatted, '340 MB');

      final zeroCache = settings.copyWith(cacheSizeBytes: 0);
      expect(zeroCache.cacheFormatted, '0 MB');
    });
  });

  group('Akun Page Interactive Settings Tests', () {
    testWidgets('Opens streaming quality sheet, displays options, and selects 720p', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: LiveEuyApp(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // 1. Navigate to AKUN tab
      await tester.tap(find.text('AKUN'));
      await tester.pump(const Duration(milliseconds: 300));

      // 2. Tap on Kualitas Streaming tile
      final qualityTile = find.text('Kualitas Streaming');
      expect(qualityTile, findsOneWidget);
      await tester.tap(qualityTile);
      await tester.pump(const Duration(milliseconds: 400));

      // Verify bottom sheet is displayed
      expect(find.text('Pilih resolusi dan konsumsi kuota data tontonan'), findsOneWidget);
      expect(find.text('Standar HD (720p)'), findsOneWidget);
      expect(find.text('Hemat Data (480p)'), findsOneWidget);
      expect(find.text('Tinggi Full HD (1080p)'), findsOneWidget);
      expect(find.text('Kualitas Maksimal (Original HD)'), findsOneWidget);

      // Select Standar HD (720p)
      final option720 = find.text('Standar HD (720p)');
      expect(option720, findsOneWidget);
      await tester.ensureVisible(option720);
      await tester.pump(const Duration(milliseconds: 200));
      await tester.tap(option720);
      await tester.pump(const Duration(milliseconds: 400));

      // Verify bottom sheet closed and subtitle updated
      expect(find.text('Standar HD (720p • ~0.7 GB/jam)'), findsOneWidget);
    });

    testWidgets('Opens storage and cache sheet and clears cache', (tester) async {
      tester.view.physicalSize = const Size(1080, 2800);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: LiveEuyApp(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // Navigate to AKUN tab
      await tester.tap(find.text('AKUN'));
      await tester.pump(const Duration(milliseconds: 300));

      // Tap on Penyimpanan & Cache
      final storageTile = find.text('Penyimpanan & Cache');
      expect(storageTile, findsOneWidget);
      await tester.tap(storageTile);
      await tester.pump(const Duration(milliseconds: 400));

      // Verify storage sheet is displayed
      expect(find.text('Kelola pemakaian ruang memori aplikasi'), findsOneWidget);
      expect(find.text('Total Penyimpanan Terpakai'), findsOneWidget);

      final clearButton = find.text('Bersihkan Cache (340 MB)');
      expect(clearButton, findsOneWidget);
      await tester.ensureVisible(clearButton);
      await tester.pump(const Duration(milliseconds: 200));
      await tester.tap(clearButton);
      await tester.pump(const Duration(milliseconds: 400));

      // Verify cache subtitle shows 0 MB
      expect(find.textContaining('Cache: 0 MB'), findsOneWidget);
    });

    testWidgets('Opens About dialog', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: LiveEuyApp(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // Navigate to AKUN tab
      await tester.tap(find.text('AKUN'));
      await tester.pump(const Duration(milliseconds: 300));

      // Tap on Tentang LiveEuy
      final aboutTile = find.text('Tentang LiveEuy');
      expect(aboutTile, findsOneWidget);
      await tester.tap(aboutTile);
      await tester.pump(const Duration(milliseconds: 400));

      // Verify dialog is displayed
      expect(find.text('LiveEuy Cinematic Streaming'), findsOneWidget);
      expect(find.text('Versi 2.4.0 (Build 412) • 2026'), findsOneWidget);

      // Close dialog
      await tester.tap(find.text('Tutup'));
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text('LiveEuy Cinematic Streaming'), findsNothing);
    });

    testWidgets('Guest user cannot upgrade VIP account and Dolby Atmos is removed from profile', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: LiveEuyApp(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // Navigate to AKUN tab
      await tester.tap(find.text('AKUN'));
      await tester.pump(const Duration(milliseconds: 300));

      // 1. Verify Guest Badge and Profile Info
      expect(find.text('MODE TAMU'), findsOneWidget);
      expect(find.text('Tamu LiveEuy'), findsOneWidget);

      // 2. Verify Guest cannot see 'Beli VIP' or 'Tingkatkan ke VIP Premium'
      expect(find.text('Beli VIP'), findsNothing);
      expect(find.text('Tingkatkan ke VIP Premium'), findsNothing);

      // 3. Verify Guest sees 'Masuk ke Akun Anda' prompt instead
      expect(find.text('Masuk ke Akun Anda'), findsOneWidget);

      // 4. Verify Dolby Atmos switch tile is completely removed
      expect(find.text('Audio Spasial Dolby Atmos'), findsNothing);

      // 5. Verify 4K HDR banter stat is replaced with Full HD
      expect(find.text('4K HDR'), findsNothing);
      expect(find.text('Full HD'), findsOneWidget);
    });
  });
}
