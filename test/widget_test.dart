import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/providers/media_provider.dart';
import 'package:liveeuy_mob/providers/search_provider.dart';

void main() {
  group('LiveEuy App Logic Tests', () {
    test('MediaNotifier initializes with mock data and updates watchlist', () {
      final container = ProviderContainer();
      final media = container.read(mediaProvider);

      expect(media.heroList.isNotEmpty, true);
      expect(media.top10List.length, 4);

      final initialWatchlistCount = media.watchlistIds.length;
      container.read(mediaProvider.notifier).toggleWatchlist('m2');

      final updatedMedia = container.read(mediaProvider);
      expect(updatedMedia.watchlistIds.contains('m2'), true);
      expect(updatedMedia.watchlistIds.length, initialWatchlistCount + 1);
    });

    test('SearchNotifier filters movies correctly', () {
      final container = ProviderContainer();
      final searchNotifier = container.read(searchProvider.notifier);

      searchNotifier.setQuery('Gadis Kretek');
      var results = container.read(searchProvider).results;
      expect(results.any((m) => m.title == 'Gadis Kretek'), true);

      searchNotifier.setFormatFilter('Serial');
      results = container.read(searchProvider).results;
      expect(results.every((m) => m.durationOrSeasons.contains('Musim')), true);
    });
  });
}
