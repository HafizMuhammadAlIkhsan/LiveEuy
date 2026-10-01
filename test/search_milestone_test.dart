import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:liveeuy_mob/core/network/api_client.dart';
import 'package:liveeuy_mob/core/network/api_service.dart';
import 'package:liveeuy_mob/features/search/search_screen.dart';
import 'package:liveeuy_mob/providers/search_provider.dart';

void main() {
  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('Milestone 2 - CancelToken Specification Tests', () {
    test('CancelToken initial state and cancellation', () async {
      final token = CancelToken();
      expect(token.isCancelled, isFalse);
      expect(token.cancelError, isNull);
      expect(token.reason, isNull);

      bool whenCancelledFired = false;
      token.whenCancelled.then((err) {
        whenCancelledFired = true;
        expect(err.type, equals(DioExceptionType.cancel));
        expect(err.message, equals('Pencarian dibatalkan pengguna'));
      });

      token.cancel('Pencarian dibatalkan pengguna');

      expect(token.isCancelled, isTrue);
      expect(token.reason, equals('Pencarian dibatalkan pengguna'));
      expect(token.cancelError?.type, equals(DioExceptionType.cancel));

      await Future.delayed(Duration.zero);
      expect(whenCancelledFired, isTrue);

      // Idempotency: multiple calls should not change state
      token.cancel('Alasan kedua');
      expect(token.reason, equals('Pencarian dibatalkan pengguna'));
    });

    test('CancelToken.throwIfCancelled throws DioException', () {
      final token = CancelToken();
      // Should not throw before cancel
      expect(() => token.throwIfCancelled(), returnsNormally);

      token.cancel('Dibatalkan');
      expect(
        () => token.throwIfCancelled(),
        throwsA(isA<DioException>().having(
          (e) => e.type,
          'type',
          equals(DioExceptionType.cancel),
        )),
      );
    });

    test('ApiClient cancels before request starts if token is already cancelled', () async {
      final token = CancelToken()..cancel('Pra-pembatalan');
      int callCount = 0;
      final mockClient = MockClient((request) async {
        callCount++;
        return http.Response(jsonEncode({'success': true, 'data': []}), 200);
      });

      final apiClient = ApiClient(httpClient: mockClient);

      try {
        await apiClient.get('/test', cancelToken: token);
        fail('Harus melempar DioException.cancel');
      } on DioException catch (e) {
        expect(e.type, equals(DioExceptionType.cancel));
        expect(e.message, contains('Pra-pembatalan'));
        expect(callCount, equals(0)); // Tidak boleh ada HTTP request yang dikirim
      }
    });

    test('ApiClient in-flight cancellation terminates request with DioException.cancel', () async {
      final token = CancelToken();
      final completer = Completer<http.Response>();

      final mockClient = MockClient((request) async {
        return completer.future; // Menunggu terus sampai diselesaikan
      });

      final apiClient = ApiClient(httpClient: mockClient);

      final requestFuture = apiClient.get('/long-running', cancelToken: token);

      // Batalkan request saat masih in-flight
      token.cancel('Dibatalkan saat proses download');

      try {
        await requestFuture;
        fail('Harus melempar DioException.cancel');
      } on DioException catch (e) {
        expect(e.type, equals(DioExceptionType.cancel));
        expect(e.message, contains('Dibatalkan saat proses download'));
      }

      // Pastikan bila backend akhirnya merespon belakangan, tidak meledak
      completer.complete(http.Response('{"success": true}', 200));
    });
  });

  group('Milestone 2 - SearchNotifier Pagination & Cancellation Tests', () {
    test('Initial search initializes with page 0, pageSize 10, and hasMore true', () {
      final container = ProviderContainer();
      final notifier = container.read(searchProvider.notifier);

      final state = container.read(searchProvider);
      expect(state.currentPage, equals(0));
      expect(state.pageSize, equals(10));
      expect(state.results.length, lessThanOrEqualTo(10));
      expect(state.hasMore, isTrue);
      expect(notifier.currentCancelToken, isNotNull);
      expect(notifier.currentCancelToken!.isCancelled, isFalse);
    });

    test('Calling setQuery cancels prior token and triggers new search', () {
      final container = ProviderContainer();
      final notifier = container.read(searchProvider.notifier);

      final firstToken = notifier.currentCancelToken;
      expect(firstToken?.isCancelled, isFalse);

      notifier.setQuery('Gadis Kretek');
      expect(firstToken?.isCancelled, isTrue);
      expect(notifier.currentCancelToken, isNot(equals(firstToken)));

      final results = container.read(searchProvider).results;
      expect(results.any((m) => m.title == 'Gadis Kretek'), isTrue);
    });

    test('loadMore appends unique next slice and updates page counter', () async {
      final container = ProviderContainer();
      final notifier = container.read(searchProvider.notifier);

      // Reset to empty query to access entire mock catalog
      notifier.reset();
      final initialCount = container.read(searchProvider).results.length;
      expect(initialCount, equals(10));
      expect(container.read(searchProvider).currentPage, equals(0));

      await notifier.loadMore();

      final secondState = container.read(searchProvider);
      expect(secondState.currentPage, equals(1));
      expect(secondState.results.length, greaterThan(initialCount));

      // Verify no duplicate IDs
      final ids = secondState.results.map((m) => m.id).toList();
      expect(ids.toSet().length, equals(ids.length));
    });

    test('loadMore stops loading when hasMore is false', () async {
      final container = ProviderContainer();
      final notifier = container.read(searchProvider.notifier);

      // Filter down to a single unique item
      notifier.setQuery('Gadis Kretek');
      final state = container.read(searchProvider);
      expect(state.hasMore, isFalse);

      final countBefore = state.results.length;
      await notifier.loadMore();
      final countAfter = container.read(searchProvider).results.length;

      expect(countAfter, equals(countBefore));
    });

    test('Backend integration with page and size parameters in ApiService', () async {
      int receivedPage = -1;
      int receivedSize = -1;
      String? receivedSearch;

      final mockClient = MockClient((request) async {
        receivedPage = int.tryParse(request.url.queryParameters['page'] ?? '') ?? -1;
        receivedSize = int.tryParse(request.url.queryParameters['size'] ?? '') ?? -1;
        receivedSearch = request.url.queryParameters['search'];

        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'OK',
            'data': [
              {
                'id': 'backend-1',
                'title': 'Backend Movie 1',
                'description': 'Description',
                'backdropUrl': '',
                'posterUrl': '',
                'genre': 'Action',
                'matchScore': 95.0,
                'ageRating': '13+',
                'durationOrSeasons': '2j 10m',
                'resolutionBadges': ['4K'],
                'audioBadges': ['Dolby Atmos'],
                'userRating': 8.5,
                'releaseYear': 2024,
                'country': 'Indonesia',
                'cast': ['Aktor 1'],
                'director': 'Sutradara 1',
              }
            ],
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiService = ApiService(catalogClient: ApiClient(httpClient: mockClient));
      final items = await apiService.getAllMedia(
        search: 'Laga',
        page: 2,
        size: 15,
      );

      expect(items.length, equals(1));
      expect(items.first.title, equals('Backend Movie 1'));
      expect(receivedPage, equals(2));
      expect(receivedSize, equals(15));
      expect(receivedSearch, equals('Laga'));
    });
  });

  group('Milestone 2 - SearchScreen Widget & Empty State Tests', () {
    testWidgets('SearchScreen shows empty state illustration when query yields 0 results', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final container = ProviderContainer();
      addTearDown(container.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: SearchScreen(),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      // Enter query that does not exist in mock catalog
      container.read(searchProvider.notifier).setQuery('ZzzNonExistentTitleX99');
      await tester.pump(const Duration(milliseconds: 100));

      // Verify empty state is displayed
      expect(find.byKey(const Key('search_empty_state')), findsOneWidget);
      expect(find.text('Tidak ada judul yang cocok'), findsOneWidget);
      expect(find.text('Coba gunakan kata kunci lain atau setel ulang filter pencarian Anda.'), findsOneWidget);
    });

    testWidgets('SearchScreen renders end of results indicator when hasMore is false', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final container = ProviderContainer();
      addTearDown(container.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: SearchScreen(),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      // Filter by a specific single-match title
      container.read(searchProvider.notifier).setQuery('Gadis Kretek');
      await tester.pump(const Duration(milliseconds: 100));

      // Verify end-of-results indicator appears
      expect(find.byKey(const Key('search_end_of_results_indicator')), findsOneWidget);
      expect(find.text('Semua tayangan telah ditampilkan'), findsOneWidget);
    });
  });
}
