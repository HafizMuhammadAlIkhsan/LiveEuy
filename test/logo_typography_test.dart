import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/core/theme/app_theme.dart';
import 'package:liveeuy_mob/shared/widgets/liveeuy_logo.dart';
import 'package:liveeuy_mob/shared/widgets/streamflix_logo.dart';

void main() {
  group('LiveEuy Typography Logo Tests', () {
    testWidgets('Renders typography LIVEEUY with pure font without raster images', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: LiveEuyLogo(fontSize: 24),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify no raster Image widget is rendered
      expect(find.byType(Image), findsNothing);

      // Verify typography logo exists via Key
      final typographyFinder = find.byKey(const Key('liveeuy_typography_logo'));
      expect(typographyFinder, findsOneWidget);

      final Text textWidget = tester.widget<Text>(typographyFinder);
      final TextSpan rootSpan = textWidget.textSpan! as TextSpan;

      // Verify children span has LIVE and EUY
      expect(rootSpan.children, isNotNull);
      expect(rootSpan.children!.length, equals(2));

      final TextSpan liveSpan = rootSpan.children![0] as TextSpan;
      final TextSpan euySpan = rootSpan.children![1] as TextSpan;

      expect(liveSpan.text, equals('LIVE'));
      expect(liveSpan.style?.color, equals(AppColors.brandLive));

      expect(euySpan.text, equals('EUY'));
      expect(euySpan.style?.color, equals(AppColors.brandEuy));

      // Badge should not be rendered by default when showText is true
      expect(find.byKey(const Key('liveeuy_badge_box')), findsNothing);
    });

    testWidgets('StreamFlixLogo renders LiveEuy typography logo cleanly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: StreamFlixLogo(fontSize: 20),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Finds LiveEuyLogo inside StreamFlixLogo
      expect(find.byType(LiveEuyLogo), findsOneWidget);

      final Text textWidget = tester.widget<Text>(find.byKey(const Key('liveeuy_typography_logo')));
      final TextSpan rootSpan = textWidget.textSpan! as TextSpan;

      final TextSpan liveSpan = rootSpan.children![0] as TextSpan;
      final TextSpan euySpan = rootSpan.children![1] as TextSpan;

      expect(liveSpan.text, equals('LIVE'));
      expect(liveSpan.style?.color, equals(Colors.white));
      expect(euySpan.text, equals('EUY'));
      expect(euySpan.style?.color, equals(const Color(0xFF5D5FE6)));
    });

    testWidgets('Icon-only mode (showText: false) renders badge mark with brand gradient', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: StreamFlixLogo(fontSize: 18, showText: false, height: 26),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // No text rendered in icon-only mode
      expect(find.byKey(const Key('liveeuy_typography_logo')), findsNothing);

      // Squircle badge container exists with play arrow icon
      expect(find.byKey(const Key('liveeuy_badge_box')), findsOneWidget);
      expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
    });

    testWidgets('Explicit showBadge: true displays both badge and typography logo', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: LiveEuyLogo(fontSize: 20, showBadge: true),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('liveeuy_badge_box')), findsOneWidget);
      expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
      expect(find.byKey(const Key('liveeuy_typography_logo')), findsOneWidget);
    });
  });
}
