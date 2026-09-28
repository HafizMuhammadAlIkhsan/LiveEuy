import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liveeuy_mob/main.dart';
import 'package:liveeuy_mob/features/detail/content_detail_screen.dart';

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

  testWidgets('Test continue watching interactions: bottom bar, 3-dots sheet, and delete with undo', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      const ProviderScope(
        child: LiveEuyApp(),
      ),
    );
    await tester.pump(const Duration(milliseconds: 200));

    // Verify "Lanjutkan Menonton" section title exists
    expect(find.text('Lanjutkan Menonton'), findsOneWidget);

    // Verify 3-dots icon button is present
    final moreButtons = find.byTooltip('Pilihan lainnya');
    expect(moreButtons, findsWidgets);

    // 1. Tap the first 3-dots button to open options sheet
    await tester.tap(moreButtons.first);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // Verify sheet items
    expect(find.text('Lanjutkan Menonton'), findsWidgets);
    expect(find.text('Lihat Detail & Episode'), findsOneWidget);
    expect(find.text('Unduh Tayangan'), findsOneWidget);
    expect(find.text('Bagikan Tayangan'), findsOneWidget);
    expect(find.text('Hapus dari Lanjutkan Menonton'), findsOneWidget);

    // 2. Tap "Hapus dari Lanjutkan Menonton"
    await tester.tap(find.text('Hapus dari Lanjutkan Menonton'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // SnackBar should appear with "Batalkan" button
    expect(find.text('Batalkan'), findsOneWidget);

    // 3. Tap "Batalkan" to undo deletion
    await tester.tap(find.text('Batalkan'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // 4. Tap the title / info area of continue watching card to open details
    final gadisKretekText = find.text('Gadis Kretek');
    expect(gadisKretekText, findsOneWidget);
    await tester.ensureVisible(gadisKretekText);
    await tester.pump(const Duration(milliseconds: 200));
    await tester.tap(gadisKretekText);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // Verify navigated to ContentDetailScreen
    expect(find.byType(ContentDetailScreen), findsOneWidget);
  });
}
