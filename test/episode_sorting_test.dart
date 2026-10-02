import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:liveeuy_mob/core/data/mock_data.dart';
import 'package:liveeuy_mob/features/detail/content_detail_screen.dart';
import 'test_helper.dart';

const List<int> _kTransparentImage = <int>[
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44,
  0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D,
  0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
  0x60, 0x82,
];

class _MockHttpClient extends Fake implements HttpClient {
  @override
  bool autoUncompress = true;

  @override
  Future<HttpClientRequest> getUrl(Uri url) async => _MockHttpClientRequest();
}

class _MockHttpClientRequest extends Fake implements HttpClientRequest {
  @override
  final HttpHeaders headers = _MockHttpHeaders();

  @override
  Future<HttpClientResponse> close() async => _MockHttpClientResponse();
}

class _MockHttpHeaders extends Fake implements HttpHeaders {
  @override
  void set(String name, Object value, {bool preserveHeaderCase = false}) {}
}

class _MockHttpClientResponse extends Fake implements HttpClientResponse {
  @override
  int get statusCode => 200;

  @override
  int get contentLength => _kTransparentImage.length;

  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int> event)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return Stream<List<int>>.fromIterable([_kTransparentImage]).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }
}

class _MockHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) => _MockHttpClient();
}

void main() {
  setUpAll(() {
    HttpOverrides.global = _MockHttpOverrides();
  });

  group('Episode Sorting & Season Selector Tests', () {
    testWidgets('Toggles episode sorting between Ascending (1-5) and Descending (5-1)', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await initTestDependencies();

      await tester.pumpWidget(
        GetMaterialApp(
          home: ContentDetailScreen(movie: MockData.heroMovies.first),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Verify Sort Button exists and initially displays Ep 1-5
      final sortButton = find.byKey(const Key('episode_sort_button'));
      expect(sortButton, findsOneWidget);
      expect(find.text('Ep 1-5'), findsOneWidget);

      // Verify that Episode 1 is displayed before Episode 5
      final ep1Finder = find.text('1. Jeng Yah');
      final ep5Finder = find.text('5. Gadis Kretek (Final)');
      expect(ep1Finder, findsOneWidget);
      expect(ep5Finder, findsOneWidget);

      final ep1TopBefore = tester.getTopLeft(ep1Finder).dy;
      final ep5TopBefore = tester.getTopLeft(ep5Finder).dy;
      expect(ep1TopBefore, lessThan(ep5TopBefore));

      // Tap Sort Button to reverse order
      await tester.tap(sortButton);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Now button displays Ep 5-1
      expect(find.text('Ep 5-1'), findsOneWidget);

      // Verify that Episode 5 is now above Episode 1
      final ep1TopAfter = tester.getTopLeft(ep1Finder).dy;
      final ep5TopAfter = tester.getTopLeft(ep5Finder).dy;
      expect(ep5TopAfter, lessThan(ep1TopAfter));

      // Tap Sort Button again to revert to Ascending order
      await tester.tap(sortButton);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Ep 1-5'), findsOneWidget);
      final ep1TopReverted = tester.getTopLeft(ep1Finder).dy;
      final ep5TopReverted = tester.getTopLeft(ep5Finder).dy;
      expect(ep1TopReverted, lessThan(ep5TopReverted));
    });

    testWidgets('Tapping Season selector opens season bottom sheet', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await initTestDependencies();

      await tester.pumpWidget(
        GetMaterialApp(
          home: ContentDetailScreen(movie: MockData.heroMovies.first),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      final seasonDropdown = find.text('Musim 1 (5 Episode)');
      expect(seasonDropdown, findsOneWidget);

      await tester.tap(seasonDropdown);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Pilih Musim'), findsOneWidget);
      expect(find.text('Musim 1'), findsOneWidget);
      expect(find.text('5 Episode • Rilis 2023'), findsOneWidget);

      // Tap to close
      await tester.tap(find.text('Musim 1'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Pilih Musim'), findsNothing);
    });
  });
}
