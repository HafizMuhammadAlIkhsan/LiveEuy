import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/core/network/dio_exception.dart';
import 'package:liveeuy_mob/core/network/dio_interceptor.dart';
import 'package:liveeuy_mob/models/auth_response_model.dart';
import 'package:liveeuy_mob/models/movie_model.dart';
import 'package:liveeuy_mob/providers/search_provider.dart';

void main() {
  group('Backend Crosscheck & Integration Tests', () {
    test('UserData correctly parses status enum and defaults to active', () {
      final activeUser = UserData.fromJson({
        'id': 'usr-101',
        'name': 'Hafiz',
        'email': 'hafiz@liveeuy.id',
        'status': 'active',
        'tier': 'VIP Ultra',
      });
      expect(activeUser.status, UserStatus.active);
      expect(activeUser.isSuspended, isFalse);

      final suspendedUser = UserData.fromJson({
        'id': 'usr-102',
        'name': 'Banned User',
        'email': 'banned@liveeuy.id',
        'status': 'suspended',
        'tier': 'VIP Standard',
      });
      expect(suspendedUser.status, UserStatus.suspended);
      expect(suspendedUser.isSuspended, isTrue);

      final json = suspendedUser.toJson();
      expect(json['status'], 'suspended');
    });

    test('Movie model supports country field with default and serialization', () {
      const defaultMovie = Movie(
        id: 'm1',
        title: 'The Raid',
        synopsis: 'Laga Indonesia',
        posterUrl: 'https://image.png',
        backdropUrl: 'https://backdrop.png',
        videoUrl: 'https://video.mp4',
        matchScore: 98,
        ageRating: '18+',
        resolutionBadges: ['4K UHD'],
        genre: 'Aksi',
        durationOrSeasons: '1 Jam 40 Min',
        releaseYear: 2011,
        director: 'Gareth Evans',
        cast: ['Iko Uwais'],
      );
      expect(defaultMovie.country, 'Indonesia');

      final koreanMovie = defaultMovie.copyWith(country: 'Korea Selatan', title: 'Parasite');
      expect(koreanMovie.country, 'Korea Selatan');
      expect(koreanMovie.title, 'Parasite');

      final fromJsonMovie = Movie.fromJson({
        'id': 'm2',
        'title': 'Train to Busan',
        'country': 'Korea Selatan',
        'releaseYear': 2016,
      });
      expect(fromJsonMovie.country, 'Korea Selatan');
      expect(fromJsonMovie.toJson()['country'], 'Korea Selatan');
    });

    test('SessionSecurityInterceptor catches ACCOUNT_SUSPENDED (HTTP 403)', () async {
      String? caughtReason;
      final interceptor = SessionSecurityInterceptor(
        onAccountSuspended: (reason) async {
          caughtReason = reason;
        },
      );

      final reqOptions = RequestOptions(path: '/api/v1/user/profile');
      final dioErr = DioException.badResponse(
        requestOptions: reqOptions,
        response: Response(
          statusCode: 403,
          requestOptions: reqOptions,
          data: {
            'success': false,
            'error_code': 'ACCOUNT_SUSPENDED',
            'message': 'Akun Anda telah ditangguhkan oleh Administrator LiveEuy.',
          },
        ),
      );

      final handler = ErrorInterceptorHandler();
      interceptor.onError(dioErr, handler);
      await Future.delayed(const Duration(milliseconds: 50));

      expect(caughtReason, contains('Akun Anda telah ditangguhkan'));
    });

    test('SessionSecurityInterceptor catches SESSION_REVOKED (HTTP 401)', () async {
      String? caughtReason;
      final interceptor = SessionSecurityInterceptor(
        onSessionRevoked: (reason) async {
          caughtReason = reason;
        },
      );

      final reqOptions = RequestOptions(path: '/api/v1/auth/me');
      final dioErr = DioException.badResponse(
        requestOptions: reqOptions,
        response: Response(
          statusCode: 401,
          requestOptions: reqOptions,
          data: {
            'success': false,
            'error_code': 'SESSION_REVOKED',
            'message': 'Sesi login telah dicabut oleh admin atau batas perangkat tercapai.',
          },
        ),
      );

      final handler = ErrorInterceptorHandler();
      interceptor.onError(dioErr, handler);
      await Future.delayed(const Duration(milliseconds: 50));

      expect(caughtReason, contains('dicabut'));
    });

    test('SearchNotifier filters catalog by countryFilter correctly', () {
      final notifier = SearchNotifier();
      
      notifier.setCountryFilter('Indonesia');
      expect(notifier.state.countryFilter, 'Indonesia');
      expect(notifier.state.results, isNotEmpty);
      expect(notifier.state.results.every((m) => m.country.toLowerCase() == 'indonesia'), isTrue);

      notifier.setCountryFilter('Semua');
      expect(notifier.state.countryFilter, 'Semua');
      expect(notifier.state.results, isNotEmpty);
    });
  });
}
