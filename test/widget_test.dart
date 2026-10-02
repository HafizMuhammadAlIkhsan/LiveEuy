import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:liveeuy_mob/providers/media_provider.dart';
import 'package:liveeuy_mob/providers/search_provider.dart';

void main() {
  setUp(() {
    Get.reset();
  });

  group('LiveEuy App Logic Tests', () {
    test('MediaNotifier initializes with mock data and updates watchlist', () {
      final mediaNotifier = MediaNotifier();

      expect(mediaNotifier.state.heroList.isNotEmpty, true);
      expect(mediaNotifier.state.top10List.length, 4);

      final initialWatchlistCount = mediaNotifier.state.watchlistIds.length;
      mediaNotifier.toggleWatchlist('m2');

      expect(mediaNotifier.state.watchlistIds.contains('m2'), true);
      expect(mediaNotifier.state.watchlistIds.length, initialWatchlistCount + 1);
    });

    test('SearchNotifier filters movies correctly', () {
      final searchNotifier = SearchNotifier();

      searchNotifier.setQuery('Gadis Kretek');
      var results = searchNotifier.state.results;
      expect(results.any((m) => m.title == 'Gadis Kretek'), true);

      searchNotifier.setFormatFilter('Serial');
      results = searchNotifier.state.results;
      expect(results.every((m) => m.durationOrSeasons.contains('Musim')), true);
    });
  });
}
