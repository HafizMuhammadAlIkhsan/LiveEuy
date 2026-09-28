import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:liveeuy_mob/core/network/api_client.dart';
import 'package:liveeuy_mob/core/network/api_service.dart';

void main() {
  group('ApiService Contract Integration Tests', () {
    test('getAllMedia fetches media catalog matching backend contract', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'GET');
        expect(request.url.path, '/api/v1/media');

        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Katalog media berhasil dimuat',
            'data': [
              {
                'id': 'm1',
                'title': 'Gadis Kretek',
                'synopsis': 'Sinopsis Gadis Kretek',
                'posterUrl': 'https://example.com/gk.jpg',
                'backdropUrl': 'https://example.com/gk_bg.jpg',
                'videoUrl': 'https://example.com/gk.mp4',
                'matchScore': 99.0,
                'ageRating': '16+',
                'resolutionBadges': ['4K UHD', 'Dolby Atmos'],
                'genre': 'Drama Periode',
                'durationOrSeasons': '1 Musim',
                'releaseYear': 2023,
                'director': 'Kamila Andini',
                'cast': ['Dian Sastrowardoyo'],
                'isTop10': true,
                'top10Rank': 1,
                'userRating': 8.8,
                'continueWatchingProgress': 0.0,
                'seasons': [],
              }
            ],
            'timestamp': '2026-09-24T20:00:00',
          }),
          200,
        );
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final media = await service.getAllMedia();
      expect(media.length, 1);
      expect(media.first.id, 'm1');
      expect(media.first.title, 'Gadis Kretek');
      expect(media.first.isTop10, isTrue);
    });

    test('getMediaById fetches single media with details', () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/api/v1/media/m1');
        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Detail media',
            'data': {
              'id': 'm1',
              'title': 'Gadis Kretek',
              'synopsis': 'Sinopsis',
              'posterUrl': '',
              'backdropUrl': '',
              'videoUrl': '',
              'matchScore': 98.0,
              'ageRating': '16+',
              'resolutionBadges': [],
              'genre': 'Drama',
              'durationOrSeasons': '1 Musim',
              'releaseYear': 2023,
              'director': 'Kamila Andini',
              'cast': [],
              'isTop10': true,
              'top10Rank': 1,
              'userRating': 8.8,
              'continueWatchingProgress': 0.0,
              'seasons': [
                {
                  'id': 's1',
                  'seasonNumber': 1,
                  'title': 'Musim 1',
                  'episodes': [
                    {
                      'id': 'ep1',
                      'episodeNumber': 1,
                      'title': 'Mawar Hitam',
                      'synopsis': 'Episode 1',
                      'thumbnailUrl': '',
                      'videoUrl': '',
                      'duration': '48 Min',
                    }
                  ]
                }
              ],
            },
          }),
          200,
        );
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final movie = await service.getMediaById('m1');
      expect(movie, isNotNull);
      expect(movie?.id, 'm1');
      expect(movie?.seasons.length, 1);
      expect(movie?.seasons.first.episodes.first.title, 'Mawar Hitam');
    });

    test('getTop10Media fetches top 10 items', () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/api/v1/media/top10');
        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Top 10',
            'data': [
              {
                'id': 'm1',
                'title': 'Top 1 Movie',
                'synopsis': '',
                'posterUrl': '',
                'backdropUrl': '',
                'videoUrl': '',
                'matchScore': 99.0,
                'ageRating': '18+',
                'resolutionBadges': [],
                'genre': 'Action',
                'durationOrSeasons': '2 Jam',
                'releaseYear': 2024,
                'director': '',
                'cast': [],
                'isTop10': true,
                'top10Rank': 1,
                'userRating': 9.0,
                'continueWatchingProgress': 0.0,
              }
            ],
          }),
          200,
        );
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final top10 = await service.getTop10Media();
      expect(top10.length, 1);
      expect(top10.first.top10Rank, 1);
    });

    test('getWatchlistIds and toggleWatchlist', () async {
      final mockClient = MockClient((request) async {
        if (request.method == 'GET' && request.url.path == '/api/v1/user/watchlist/ids') {
          expect(request.url.queryParameters['userId'], 'u1');
          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'OK',
              'data': ['m1', 'm3'],
            }),
            200,
          );
        } else if (request.method == 'POST' && request.url.path == '/api/v1/user/watchlist/m1') {
          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'Watchlist updated',
              'data': {'mediaId': 'm1', 'inWatchlist': false},
            }),
            200,
          );
        }
        return http.Response('Not Found', 404);
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final ids = await service.getWatchlistIds(userId: 'u1');
      expect(ids, containsAll(['m1', 'm3']));

      final inWatchlist = await service.toggleWatchlist('m1', userId: 'u1');
      expect(inWatchlist, isFalse);
    });

    test('getWatchProgress and syncWatchProgress', () async {
      final mockClient = MockClient((request) async {
        if (request.method == 'GET' && request.url.path == '/api/v1/user/progress') {
          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'OK',
              'data': [
                {
                  'id': 'wp_1',
                  'userId': 'u1',
                  'mediaId': 'm1',
                  'progress': 0.65,
                  'lastEpisodeId': 'ep1',
                }
              ],
            }),
            200,
          );
        } else if (request.method == 'POST' && request.url.path == '/api/v1/user/progress') {
          final body = jsonDecode(request.body);
          expect(body['mediaId'], 'm1');
          expect(body['progress'], 0.85);

          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'Progress saved',
              'data': {
                'id': 'wp_1',
                'userId': 'u1',
                'mediaId': 'm1',
                'progress': 0.85,
                'lastEpisodeId': 'ep2',
              },
            }),
            200,
          );
        }
        return http.Response('Not Found', 404);
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final list = await service.getWatchProgress(userId: 'u1');
      expect(list.length, 1);
      expect(list.first.progress, 0.65);

      final updated = await service.syncWatchProgress(
        mediaId: 'm1',
        progress: 0.85,
        lastEpisodeId: 'ep2',
        userId: 'u1',
      );
      expect(updated?.progress, 0.85);
      expect(updated?.lastEpisodeId, 'ep2');
    });

    test('getReviews and addReview', () async {
      final mockClient = MockClient((request) async {
        if (request.method == 'GET' && request.url.path == '/api/v1/media/m1/reviews') {
          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'OK',
              'data': [
                {
                  'id': 'rev_1',
                  'mediaId': 'm1',
                  'userName': 'Budi',
                  'userAvatarUrl': 'https://example.com/avatar.jpg',
                  'rating': 9.0,
                  'comment': 'Sangat bagus!',
                  'createdAt': '2026-09-24T18:00:00',
                  'likesCount': 10,
                }
              ],
            }),
            200,
          );
        } else if (request.method == 'POST' && request.url.path == '/api/v1/media/m1/reviews') {
          final body = jsonDecode(request.body);
          expect(body['rating'], 10.0);
          expect(body['comment'], 'Luar biasa!');

          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'Review added',
              'data': {
                'id': 'rev_2',
                'mediaId': 'm1',
                'userName': 'Aria',
                'userAvatarUrl': 'https://example.com/avatar.jpg',
                'rating': 10.0,
                'comment': 'Luar biasa!',
                'createdAt': '2026-09-25T09:00:00',
                'likesCount': 0,
              },
            }),
            200,
          );
        }
        return http.Response('Not Found', 404);
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final reviews = await service.getReviews('m1');
      expect(reviews.length, 1);
      expect(reviews.first.comment, 'Sangat bagus!');

      final newReview = await service.addReview(
        mediaId: 'm1',
        rating: 10.0,
        comment: 'Luar biasa!',
        userName: 'Aria',
      );
      expect(newReview?.rating, 10.0);
      expect(newReview?.comment, 'Luar biasa!');
    });

    test('login authenticates user and returns AuthData matching backend contract', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.url.path, '/api/v1/auth/login');
        final body = jsonDecode(request.body);
        expect(body['email'], 'hafiz@streamflix.id');
        expect(body['password'], 'password123');
        expect(body['rememberMe'], true);

        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Login berhasil',
            'data': {
              'accessToken': 'jwt_access_mock_123',
              'refreshToken': 'jwt_refresh_mock_456',
              'tokenType': 'Bearer',
              'expiresIn': 900,
              'user': {
                'id': 'usr_1',
                'name': 'Hafiz Muhammad',
                'email': 'hafiz@streamflix.id',
                'avatarUrl': 'https://example.com/avatar.jpg',
                'membershipTier': 'VIP_4K',
              },
            },
            'timestamp': '2026-09-28T10:00:00',
          }),
          200,
        );
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final authData = await service.login(
        email: 'hafiz@streamflix.id',
        password: 'password123',
        rememberMe: true,
      );

      expect(authData, isNotNull);
      expect(authData?.accessToken, 'jwt_access_mock_123');
      expect(authData?.refreshToken, 'jwt_refresh_mock_456');
      expect(authData?.user?.name, 'Hafiz Muhammad');
      expect(authData?.user?.isVip, isTrue);
    });

    test('register creates new account and returns AuthData', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.url.path, '/api/v1/auth/register');
        final body = jsonDecode(request.body);
        expect(body['name'], 'Aria Pratama');
        expect(body['email'], 'aria@liveeuy.id');
        expect(body['password'], 'Secret123');

        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Registrasi berhasil',
            'data': {
              'accessToken': 'jwt_access_aria_1',
              'refreshToken': 'jwt_refresh_aria_1',
              'tokenType': 'Bearer',
              'expiresIn': 900,
              'user': {
                'id': 'usr_aria',
                'name': 'Aria Pratama',
                'email': 'aria@liveeuy.id',
                'avatarUrl': 'https://example.com/aria.jpg',
                'membershipTier': 'REGULAR',
              },
            },
            'timestamp': '2026-09-28T10:00:00',
          }),
          201,
        );
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final authData = await service.register(
        name: 'Aria Pratama',
        email: 'aria@liveeuy.id',
        password: 'Secret123',
      );

      expect(authData, isNotNull);
      expect(authData?.accessToken, 'jwt_access_aria_1');
      expect(authData?.user?.name, 'Aria Pratama');
      expect(authData?.user?.email, 'aria@liveeuy.id');
    });

    test('refreshToken rotates tokens for mobile client', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.url.path, '/api/v1/auth/refresh');
        final body = jsonDecode(request.body);
        expect(body['refreshToken'], 'old_refresh_token');

        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Token refreshed',
            'data': {
              'accessToken': 'new_access_token',
              'refreshToken': 'new_refresh_token',
              'tokenType': 'Bearer',
              'expiresIn': 900,
            },
            'timestamp': '2026-09-28T10:15:00',
          }),
          200,
        );
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final authData = await service.refreshToken('old_refresh_token');
      expect(authData?.accessToken, 'new_access_token');
      expect(authData?.refreshToken, 'new_refresh_token');
    });

    test('getCurrentUser and logout call expected endpoints and headers', () async {
      final mockClient = MockClient((request) async {
        if (request.method == 'GET' && request.url.path == '/api/v1/auth/me') {
          expect(request.headers['authorization'], 'Bearer token_123');
          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'Profile loaded',
              'data': {
                'id': 'usr_1',
                'name': 'Hafiz Muhammad',
                'email': 'hafiz@streamflix.id',
                'avatarUrl': 'https://example.com/avatar.jpg',
                'membershipTier': 'VIP_4K',
              },
            }),
            200,
          );
        } else if (request.method == 'POST' && request.url.path == '/api/v1/auth/logout') {
          return http.Response(
            jsonEncode({
              'success': true,
              'message': 'Logout berhasil',
              'data': null,
            }),
            200,
          );
        }
        return http.Response('Not Found', 404);
      });

      final service = ApiService(
        client: ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1'),
      );

      final user = await service.getCurrentUser(accessToken: 'token_123');
      expect(user?.name, 'Hafiz Muhammad');
      expect(user?.isVip, isTrue);

      final logoutSuccess = await service.logout(accessToken: 'token_123');
      expect(logoutSuccess, isTrue);
    });
  });
}
