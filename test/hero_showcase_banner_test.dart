import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/core/data/mock_data.dart';
import 'package:liveeuy_mob/features/home/widgets/hero_showcase_banner.dart';
import 'package:liveeuy_mob/models/movie_model.dart';

void main() {
  group('HeroShowcaseBanner Tests', () {
    testWidgets('Renders hero banner with top hari ini badge and action buttons', (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final movies = MockData.heroMovies;
      Movie? playedMovie;
      Movie? detailMovie;
      final bookmarked = <String>{};

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: HeroShowcaseBanner(
                heroMovies: movies,
                isActive: true,
                onPlay: (m) => playedMovie = m,
                onDetail: (m) => detailMovie = m,
                onToggleWatchlist: (m) {
                  if (bookmarked.contains(m.id)) {
                    bookmarked.remove(m.id);
                  } else {
                    bookmarked.add(m.id);
                  }
                },
                isBookmarked: (m) => bookmarked.contains(m.id),
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      // Verify TOP 1 HARI INI badge is shown
      expect(find.text('TOP 1 HARI INI'), findsOneWidget);

      // Verify title of first hero movie is rendered
      expect(find.text(movies.first.title), findsOneWidget);

      // Verify Putar and Koleksi Saya buttons exist
      expect(find.text('Putar'), findsOneWidget);
      expect(find.text('Koleksi Saya'), findsOneWidget);

      // Verify sound button toggle
      final soundBtn = find.byIcon(Icons.volume_off_rounded);
      expect(soundBtn, findsOneWidget);

      await tester.tap(soundBtn);
      await tester.pump();

      // Sound should now be unmuted
      expect(find.byIcon(Icons.volume_up_rounded), findsOneWidget);

      // Test Putar button callback
      await tester.tap(find.text('Putar'));
      expect(playedMovie?.id, movies.first.id);

      // Test Info button callback
      final infoBtn = find.byIcon(Icons.info_outline_rounded);
      expect(infoBtn, findsOneWidget);
      await tester.tap(infoBtn);
      expect(detailMovie?.id, movies.first.id);
    });

    testWidgets('Auto slides to next movie after max 15 seconds elapsed', (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final movies = MockData.heroMovies;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: HeroShowcaseBanner(
                heroMovies: movies,
                isActive: true,
                onPlay: (_) {},
                onDetail: (_) {},
                onToggleWatchlist: (_) {},
                isBookmarked: (_) => false,
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      // First movie title is displayed
      expect(find.text(movies[0].title), findsOneWidget);

      // Advance time by 15.5 seconds to trigger auto slide
      await tester.pump(const Duration(seconds: 15, milliseconds: 600));
      // Pump animation duration
      await tester.pump(const Duration(milliseconds: 700));

      // After auto-slide, the second movie or next slide is active
      expect(find.text(movies[1].title), findsOneWidget);
    });
  });
}
