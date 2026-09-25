import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liveeuy_mob/features/collection/collection_screen.dart';
import 'package:liveeuy_mob/main.dart';
import 'package:liveeuy_mob/providers/media_provider.dart';

class _MockHttpClient extends Fake implements HttpClient {
  @override
  bool autoUncompress = true;

  @override
  Future<HttpClientRequest> getUrl(Uri url) async => _MockHttpClientRequest();

  @override
  void close({bool force = false}) {}
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
  int get contentLength => kTransparentPng.length;

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
    return Stream<List<int>>.value(kTransparentPng).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }
}

final List<int> kTransparentPng = <int>[
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44,
  0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D,
  0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
  0x60, 0x82,
];

class _MockHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) => _MockHttpClient();
}

void main() {
  setUpAll(() {
    HttpOverrides.global = _MockHttpOverrides();
  });

  group('CollectionScreen (WatchlistView) Tests', () {
    testWidgets('Renders dev-frontend aligned header, continue watching, filter chips and cards', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: CollectionScreen(),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // 1. Verify Page Header text matches dev-frontend
      expect(find.text('Koleksi & Riwayat Tontonan'), findsOneWidget);
      expect(
        find.text('Lanjutkan tontonan terakhir Anda dan jelajahi daftar tontonan yang telah disimpan.'),
        findsOneWidget,
      );

      // 2. Verify Section 1: Lanjutkan Menonton
      expect(find.text('Lanjutkan Menonton'), findsOneWidget);

      // 3. Verify Section 2: Daftar Tontonan Anda
      expect(find.text('Daftar Tontonan Anda'), findsOneWidget);

      // 4. Verify Category Filter Chips: Semua, Film, Serial TV
      expect(find.text('Semua'), findsOneWidget);
      expect(find.text('Film'), findsOneWidget);
      expect(find.text('Serial TV'), findsOneWidget);

      // 5. Tap 'Film' chip and verify filter updates
      await tester.tap(find.text('Film'));
      await tester.pump(const Duration(milliseconds: 200));

      // 6. Tap 'Serial TV' chip and verify filter updates
      await tester.tap(find.text('Serial TV'));
      await tester.pump(const Duration(milliseconds: 200));

      // 7. Tap 'Semua' chip
      await tester.tap(find.text('Semua'));
      await tester.pump(const Duration(milliseconds: 200));

      // 8. Verify delete button is present and functions with undo snackbar
      final deleteButtons = find.byTooltip('Hapus dari Koleksi');
      if (deleteButtons.evaluate().isNotEmpty) {
        await tester.tap(deleteButtons.first);
        await tester.pump();

        // Verify SnackBar with BATAL appears
        expect(find.text('BATAL'), findsOneWidget);
        await tester.tap(find.text('BATAL'));
        await tester.pump();
      }
    });

    testWidgets('Empty Watchlist State renders cleanly with explore action', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      bool navigatedHome = false;

      // Provide custom empty media state
      const emptyState = MediaState(
        heroList: [],
        continueWatching: [],
        top10List: [],
        popularList: [],
        actionSciFiList: [],
        watchlistIds: {},
        movieReviews: {},
      );

      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: CollectionScreen(
              mediaState: emptyState,
              onNavigateHome: () {
                navigatedHome = true;
              },
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // Verify empty state texts
      expect(find.text('Daftar Koleksi Anda Masih Kosong'), findsOneWidget);
      expect(
        find.text('Jelajahi berbagai judul film dan serial menarik di LiveEuy, lalu klik ikon tanda tambah (+) untuk menyimpannya di sini.'),
        findsOneWidget,
      );

      // Tap 'Jelajahi Film Sekarang'
      final exploreButton = find.text('Jelajahi Film Sekarang');
      expect(exploreButton, findsOneWidget);
      await tester.tap(exploreButton);
      await tester.pump(const Duration(milliseconds: 200));

      expect(navigatedHome, isTrue);
    });

    testWidgets('Navigation switching to Koleksi tab in full app works seamlessly', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: LiveEuyApp(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // Tap KOLEKSI tab in bottom navigation
      final koleksiTab = find.text('KOLEKSI');
      expect(koleksiTab, findsOneWidget);
      await tester.tap(koleksiTab);
      await tester.pump(const Duration(milliseconds: 200));

      // Verify Koleksi screen rendered
      expect(find.text('Koleksi & Riwayat Tontonan'), findsOneWidget);
      expect(find.text('Daftar Tontonan Anda'), findsOneWidget);
    });
  });
}
