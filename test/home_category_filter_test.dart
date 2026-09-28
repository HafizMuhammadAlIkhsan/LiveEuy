import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:liveeuy_mob/main.dart';

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

  testWidgets('Test Category buttons under LIVEEUY: Semua, Film, Serial TV, and Kategori modal', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      const ProviderScope(
        child: LiveEuyApp(),
      ),
    );
    await tester.pump(const Duration(milliseconds: 200));

    // 1. Verify Category Pills exist under LIVEEUY
    expect(find.byKey(const Key('category_pill_Semua')), findsOneWidget);
    expect(find.byKey(const Key('category_pill_Film')), findsOneWidget);
    expect(find.byKey(const Key('category_pill_Serial TV')), findsOneWidget);
    expect(find.byKey(const Key('category_pill_Kategori')), findsOneWidget);

    // Initial state: default title
    expect(find.text('Top 10 Film di Indonesia Hari Ini'), findsOneWidget);

    // 2. Tap on "Film" pill
    await tester.tap(find.byKey(const Key('category_pill_Film')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify filter indicator shows Format: Film
    expect(find.text('Format: Film'), findsOneWidget);
    expect(find.text('Top 10 Film di Indonesia Hari Ini'), findsOneWidget);
    expect(find.text('Film Populer di Indonesia'), findsOneWidget);

    // 3. Tap on "Serial TV" pill
    await tester.tap(find.byKey(const Key('category_pill_Serial TV')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify filter indicator and titles adapted to Serial TV
    expect(find.text('Format: Serial TV'), findsOneWidget);
    expect(find.text('Top 10 Serial TV di Indonesia Hari Ini'), findsOneWidget);
    expect(find.text('Serial TV Populer di Indonesia'), findsOneWidget);

    // 4. Tap on "Kategori" pill to open category bottom sheet
    await tester.tap(find.byKey(const Key('category_pill_Kategori')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // Verify modal bottom sheet opened
    expect(find.text('Kategori & Genre'), findsOneWidget);
    expect(find.text('Aksi & Pahlawan Super'), findsOneWidget);
    expect(find.text('Drama & Misteri'), findsOneWidget);
    expect(find.text('Horor & Thriller'), findsOneWidget);

    // 5. Select "Horor & Thriller" genre
    final hororModalItem = find.descendant(
      of: find.byType(BottomSheet),
      matching: find.text('Horor & Thriller'),
    );
    await tester.tap(hororModalItem);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // Verify category pill now shows the selected genre
    expect(
      find.descendant(
        of: find.byKey(const Key('category_pill_Kategori')),
        matching: find.text('Horor & Thriller'),
      ),
      findsOneWidget,
    );

    // 6. Tap "Atur Ulang" button to reset back to "Semua"
    final aturUlangBtn = find.text('Atur Ulang');
    expect(aturUlangBtn, findsOneWidget);
    await tester.tap(aturUlangBtn);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify reset back to initial home state
    expect(find.text('Kategori'), findsOneWidget);
    expect(find.text('Top 10 Film di Indonesia Hari Ini'), findsOneWidget);

    // 7. Test toggle off: Tap "Film" again to toggle back to "Semua"
    await tester.tap(find.byKey(const Key('category_pill_Film')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Format: Film'), findsOneWidget);

    await tester.tap(find.byKey(const Key('category_pill_Film')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Format: Film'), findsNothing);

    // 8. Test selecting a genre and tapping the close icon on the active pill
    await tester.tap(find.byKey(const Key('category_pill_Kategori')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    final aksiModalItem = find.descendant(
      of: find.byType(BottomSheet),
      matching: find.text('Aksi & Pahlawan Super'),
    );
    await tester.tap(aksiModalItem);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    expect(
      find.descendant(
        of: find.byKey(const Key('category_pill_Kategori')),
        matching: find.text('Aksi & Pahlawan Super'),
      ),
      findsOneWidget,
    );

    // Tap the close (X) icon on the active category pill
    final clearBtn = find.byKey(const Key('clear_selected_genre_btn'));
    await tester.ensureVisible(clearBtn);
    await tester.pump();
    await tester.tap(clearBtn);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(
      find.descendant(
        of: find.byKey(const Key('category_pill_Kategori')),
        matching: find.text('Kategori'),
      ),
      findsOneWidget,
    );

    // 9. Test tapping "Semua" resets everything
    await tester.tap(find.byKey(const Key('category_pill_Serial TV')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Format: Serial TV'), findsOneWidget);

    await tester.tap(find.byKey(const Key('category_pill_Semua')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Format: Serial TV'), findsNothing);
    expect(find.text('Top 10 Film di Indonesia Hari Ini'), findsOneWidget);
  });
}
