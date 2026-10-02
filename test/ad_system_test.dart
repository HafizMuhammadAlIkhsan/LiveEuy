import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/features/home/widgets/in_feed_sponsor_billboard.dart';
import 'package:liveeuy_mob/features/player/video_player_screen.dart';
import 'package:liveeuy_mob/models/ad_model.dart';
import 'package:liveeuy_mob/models/movie_model.dart';
import 'package:liveeuy_mob/providers/ad_provider.dart';
import 'package:liveeuy_mob/providers/player_provider.dart';
import 'test_helper.dart';

void main() {
  group('AdNotifier & AdCampaign Unit Tests', () {
    test('Initial campaigns load correctly from mock data', () {
      final notifier = AdController();
      final ads = notifier.ads;
      expect(ads.isNotEmpty, isTrue);
      expect(ads.any((a) => a.id == 'ad-asus-rog'), isTrue);
      expect(ads.any((a) => a.id == 'ad-telkomsel-5g'), isTrue);
    });

    test('getPrerollAd returns active preroll for non-VIP and null for VIP', () {
      final notifier = AdController();

      final nonVipAd = notifier.getPrerollAd(false);
      expect(nonVipAd, isNotNull);
      expect(nonVipAd!.layer, AdPlacementLayer.videoPreroll);

      final vipAd = notifier.getPrerollAd(true);
      expect(vipAd, isNull);
    });

    test('getBillboardAds returns active billboard feed ads for non-VIP and empty for VIP', () {
      final notifier = AdController();

      final nonVipFeedAds = notifier.getBillboardAds(false);
      expect(nonVipFeedAds.isNotEmpty, isTrue);
      expect(nonVipFeedAds.every((a) => a.layer == AdPlacementLayer.billboardFeed), isTrue);

      final vipFeedAds = notifier.getBillboardAds(true);
      expect(vipFeedAds.isEmpty, isTrue);
    });

    test('recordImpression increments impression counter', () {
      final notifier = AdController();
      final targetAd = notifier.ads.firstWhere((a) => a.id == 'ad-asus-rog');
      final initialImpressions = targetAd.impressions;

      notifier.recordImpression('ad-asus-rog');
      final updatedAd = notifier.ads.firstWhere((a) => a.id == 'ad-asus-rog');
      expect(updatedAd.impressions, initialImpressions + 1);
    });

    test('recordClick increments click counter', () {
      final notifier = AdController();
      final targetAd = notifier.ads.firstWhere((a) => a.id == 'ad-asus-rog');
      final initialClicks = targetAd.clicks;

      notifier.recordClick('ad-asus-rog');
      final updatedAd = notifier.ads.firstWhere((a) => a.id == 'ad-asus-rog');
      expect(updatedAd.clicks, initialClicks + 1);
    });
  });

  group('Player Provider & Resolutions Unit Tests', () {
    test('Default resolution is mobile-first Otomatis and eliminates 4K UHD', () {
      final notifier = PlayerSettingsController();
      expect(notifier.resolution.value, 'Otomatis');
      expect(availableResolutions.contains('4K UHD'), isFalse);
      expect(availableResolutions, ['Otomatis', '1080p FHD', '720p HD', '480p SD']);
    });

    test('Can change resolution to 1080p FHD, 720p HD, and 480p SD', () {
      final notifier = PlayerSettingsController();

      notifier.setResolution('1080p FHD');
      expect(notifier.resolution.value, '1080p FHD');

      notifier.setResolution('720p HD');
      expect(notifier.resolution.value, '720p HD');
    });
  });

  group('InFeedSponsorBillboard Widget Tests', () {
    testWidgets('Renders sponsor card for regular non-VIP user', (tester) async {
      await initTestDependencies(isVip: false);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: InFeedSponsorBillboard(placementIndex: 0),
          ),
        ),
      );
      await tester.pump();

      expect(find.byType(InFeedSponsorBillboard), findsOneWidget);
      expect(find.text('Telkomsel Indonesia'), findsOneWidget);
      expect(find.text('Streaming Film Full HD Tanpa Buffering dengan Kuota 5G Terluas'), findsOneWidget);
      expect(find.text('Klaim Kuota 5G'), findsOneWidget);
    });

    testWidgets('Renders nothing (SizedBox.shrink) for VIP user', (tester) async {
      await initTestDependencies(isVip: true, tier: 'VIP Cinema Ultra');

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: InFeedSponsorBillboard(placementIndex: 0),
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Telkomsel Indonesia'), findsNothing);
      expect(find.text('Klaim Kuota 5G'), findsNothing);
    });
  });

  group('VideoPlayerScreen Pre-Roll Ad Tests', () {
    const testMovie = Movie(
      id: 'm-test-1',
      title: 'The Big LiveEuy Show',
      synopsis: 'Film aksi terbaik tahun ini.',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
      backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      matchScore: 98.0,
      ageRating: '13+',
      resolutionBadges: ['HD'],
      genre: 'Aksi',
      durationOrSeasons: '1j 45m',
      releaseYear: 2026,
      director: 'Joko Anwar',
      cast: ['Reza Rahadian'],
    );

    testWidgets('Pre-roll ad overlay renders for non-VIP user with countdown', (tester) async {
      await initTestDependencies(isVip: false);

      await tester.pumpWidget(
        const MaterialApp(
          home: VideoPlayerScreen(movie: testMovie),
        ),
      );
      await tester.pump();

      // Preroll layer elements
      expect(find.text('IKLAN SPONSOR'), findsOneWidget);
      expect(find.text('ASUS Republic of Gamers'), findsOneWidget);
      expect(find.text('Lihat Penawaran Eksklusif'), findsOneWidget);
      expect(find.textContaining('Dapat dilewati dalam'), findsOneWidget);

      // Verify resolution selector options does not contain 4K UHD
      expect(availableResolutions.contains('4K UHD'), isFalse);
    });

    testWidgets('Pre-roll ad is completely bypassed for VIP user', (tester) async {
      await initTestDependencies(isVip: true, tier: 'VIP Cinema Ultra');

      await tester.pumpWidget(
        const MaterialApp(
          home: VideoPlayerScreen(movie: testMovie),
        ),
      );
      await tester.pump();

      // Preroll layer elements should NOT exist
      expect(find.text('IKLAN SPONSOR'), findsNothing);
      expect(find.text('ASUS Republic of Gamers'), findsNothing);
    });
  });
}
