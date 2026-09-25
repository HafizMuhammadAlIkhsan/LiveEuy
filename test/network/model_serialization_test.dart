import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/core/network/api_response.dart';
import 'package:liveeuy_mob/models/movie_model.dart';
import 'package:liveeuy_mob/models/season_model.dart';
import 'package:liveeuy_mob/models/episode_model.dart';
import 'package:liveeuy_mob/models/review_model.dart';
import 'package:liveeuy_mob/models/watch_progress_model.dart';

void main() {
  group('Model Serialization Tests', () {
    test('ApiResponse parses JSON correctly', () {
      final json = {
        'success': true,
        'message': 'Data berhasil diambil',
        'data': {'id': 'm1', 'title': 'Gadis Kretek'},
        'timestamp': '2026-09-24T20:00:00',
      };

      final response = ApiResponse<Map<String, dynamic>>.fromJson(
        json,
        (data) => data as Map<String, dynamic>,
      );

      expect(response.success, isTrue);
      expect(response.message, 'Data berhasil diambil');
      expect(response.data?['title'], 'Gadis Kretek');
      expect(response.timestamp, isNotNull);
    });

    test('Episode serialization roundtrip', () {
      final episode = Episode(
        id: 'ep1',
        episodeNumber: 1,
        seasonNumber: 1,
        title: 'Mawar Hitam',
        duration: '48 Min',
        synopsis: 'Awal kisah kretek.',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        videoUrl: 'https://example.com/video.mp4',
        progress: 0.5,
      );

      final json = episode.toJson();
      final fromJson = Episode.fromJson(json);

      expect(fromJson.id, 'ep1');
      expect(fromJson.episodeNumber, 1);
      expect(fromJson.title, 'Mawar Hitam');
      expect(fromJson.progress, 0.5);
    });

    test('Season serialization roundtrip', () {
      final season = Season(
        id: 's1',
        seasonNumber: 1,
        title: 'Musim 1',
        episodes: [
          const Episode(
            id: 'ep1',
            episodeNumber: 1,
            title: 'Ep 1',
            duration: '45m',
            synopsis: 'Intro',
            thumbnailUrl: '',
            videoUrl: '',
          ),
        ],
      );

      final json = season.toJson();
      final fromJson = Season.fromJson(json);

      expect(fromJson.id, 's1');
      expect(fromJson.seasonNumber, 1);
      expect(fromJson.episodes.length, 1);
      expect(fromJson.episodes.first.title, 'Ep 1');
    });

    test('Movie serialization roundtrip with backend contract fields', () {
      final movie = Movie(
        id: 'm1',
        title: 'Gadis Kretek',
        synopsis: 'Perjalanan cinta dan industri kretek.',
        posterUrl: 'https://example.com/poster.jpg',
        backdropUrl: 'https://example.com/backdrop.jpg',
        videoUrl: 'https://example.com/video.mp4',
        matchScore: 99.0,
        ageRating: '16+',
        resolutionBadges: const ['4K UHD', 'Dolby Atmos'],
        genre: 'Drama Periode',
        durationOrSeasons: '1 Musim',
        releaseYear: 2023,
        director: 'Kamila Andini',
        cast: const ['Dian Sastrowardoyo', 'Ario Bayu'],
        isTop10: true,
        top10Rank: 1,
        userRating: 8.8,
        continueWatchingProgress: 0.35,
      );

      final json = movie.toJson();
      final fromJson = Movie.fromJson(json);

      expect(fromJson.id, 'm1');
      expect(fromJson.title, 'Gadis Kretek');
      expect(fromJson.matchScore, 99.0);
      expect(fromJson.isTop10, isTrue);
      expect(fromJson.top10Rank, 1);
      expect(fromJson.userRating, 8.8);
      expect(fromJson.continueWatchingProgress, 0.35);
      expect(fromJson.cast, contains('Dian Sastrowardoyo'));
      expect(fromJson.resolutionBadges, contains('4K UHD'));
    });

    test('Review serialization roundtrip', () {
      final review = Review(
        id: 'rev_1',
        mediaId: 'm1',
        userName: 'Aria',
        userAvatarUrl: 'https://example.com/avatar.jpg',
        rating: 9.5,
        comment: 'Sinematografi sangat indah!',
        createdAt: DateTime(2026, 9, 24, 12, 0),
        likesCount: 15,
      );

      final json = review.toJson();
      final fromJson = Review.fromJson(json);

      expect(fromJson.id, 'rev_1');
      expect(fromJson.mediaId, 'm1');
      expect(fromJson.userName, 'Aria');
      expect(fromJson.rating, 9.5);
      expect(fromJson.comment, 'Sinematografi sangat indah!');
      expect(fromJson.likesCount, 15);
    });

    test('WatchProgress serialization roundtrip', () {
      final progress = WatchProgress(
        id: 'wp_1',
        userId: 'u1',
        mediaId: 'm1',
        progress: 0.72,
        lastEpisodeId: 'ep2',
        updatedAt: DateTime(2026, 9, 25, 9, 0),
      );

      final json = progress.toJson();
      final fromJson = WatchProgress.fromJson(json);

      expect(fromJson.id, 'wp_1');
      expect(fromJson.userId, 'u1');
      expect(fromJson.mediaId, 'm1');
      expect(fromJson.progress, 0.72);
      expect(fromJson.lastEpisodeId, 'ep2');
    });

    test('Movie, Episode, and Review parse Web Frontend (src/types.ts) schema seamlessly', () {
      final webMediaJson = {
        'id': 'cyberpunk-neo-nusantara',
        'title': 'Cyberpunk: Neo Nusantara',
        'overview': 'Di megalopolis Nusantara pada tahun 2099...',
        'posterUrl': 'https://images.unsplash.com/poster.jpg',
        'backdropUrl': 'https://images.unsplash.com/backdrop.jpg',
        'releaseYear': 2026,
        'rating': 9.4,
        'matchScore': 99,
        'ageRating': '18+',
        'genres': ['Fiksi Ilmiah', 'Aksi'],
        'cast': ['Iko Uwais'],
        'director': 'Timo Tjahjanto',
        'videoUrl': 'https://example.com/video.mp4',
        'topRank': 1,
        'quality': '4K UHD',
        'audio': 'Dolby Atmos',
      };

      final movie = Movie.fromJson(webMediaJson);
      expect(movie.id, 'cyberpunk-neo-nusantara');
      expect(movie.synopsis, 'Di megalopolis Nusantara pada tahun 2099...');
      expect(movie.genre, 'Fiksi Ilmiah');
      expect(movie.userRating, 9.4);
      expect(movie.top10Rank, 1);
      expect(movie.isTop10, isTrue);
      expect(movie.resolutionBadges, containsAll(['4K UHD', 'Dolby Atmos']));

      final webReviewJson = {
        'id': 'rev_web',
        'author': 'Budi Santoso',
        'avatar': 'https://example.com/budi.jpg',
        'rating': 9.0,
        'comment': 'Sangat keren!',
        'date': '2026-09-24T18:00:00',
      };

      final review = Review.fromJson(webReviewJson);
      expect(review.userName, 'Budi Santoso');
      expect(review.userAvatarUrl, 'https://example.com/budi.jpg');
      expect(review.rating, 9.0);
    });
  });
}

