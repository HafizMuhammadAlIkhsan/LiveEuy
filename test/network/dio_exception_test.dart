import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:liveeuy_mob/core/network/api_client.dart';

void main() {
  group('DioException Specification Tests', () {
    test('400 Bad Request throws BadRequestException as DioException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Parameter ID tidak valid',
          }),
          400,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      try {
        await apiClient.get('/media/invalid');
        fail('Should throw BadRequestException');
      } on BadRequestException catch (e) {
        expect(e, isA<DioException>());
        expect(e, isA<ApiException>());
        expect(e.type, equals(DioExceptionType.badResponse));
        expect(e.statusCode, equals(400));
        expect(e.isBadRequest, isTrue);
        expect(e.backendMessage, equals('Parameter ID tidak valid'));
        expect(e.message, equals('Parameter ID tidak valid'));
      }
    });

    test('401 Unauthorized throws UnauthorizedException as DioException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Sesi login telah kedaluwarsa',
          }),
          401,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      try {
        await apiClient.get('/user/watchlist');
        fail('Should throw UnauthorizedException');
      } on UnauthorizedException catch (e) {
        expect(e, isA<DioException>());
        expect(e.type, equals(DioExceptionType.badResponse));
        expect(e.statusCode, equals(401));
        expect(e.isUnauthorized, isTrue);
        expect(e.backendMessage, equals('Sesi login telah kedaluwarsa'));
      }
    });

    test('403 Forbidden throws ForbiddenException as DioException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Akses khusus VIP Premium',
          }),
          403,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      try {
        await apiClient.get('/media/vip-only');
        fail('Should throw ForbiddenException');
      } on ForbiddenException catch (e) {
        expect(e, isA<DioException>());
        expect(e.type, equals(DioExceptionType.badResponse));
        expect(e.statusCode, equals(403));
        expect(e.isForbidden, isTrue);
        expect(e.backendMessage, equals('Akses khusus VIP Premium'));
      }
    });

    test('404 Not Found throws NotFoundException as DioException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Film tidak ditemukan dengan ID: m999',
          }),
          404,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      try {
        await apiClient.get('/media/m999');
        fail('Should throw NotFoundException');
      } on NotFoundException catch (e) {
        expect(e, isA<DioException>());
        expect(e, isA<ApiException>());
        expect(e.type, equals(DioExceptionType.badResponse));
        expect(e.statusCode, equals(404));
        expect(e.isNotFound, isTrue);
        expect(e.backendMessage, equals('Film tidak ditemukan dengan ID: m999'));
      }
    });

    test('500 Server Error throws ServerException as DioException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Database connection failed',
          }),
          500,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      try {
        await apiClient.get('/media');
        fail('Should throw ServerException');
      } on ServerException catch (e) {
        expect(e, isA<DioException>());
        expect(e.type, equals(DioExceptionType.badResponse));
        expect(e.statusCode, equals(500));
        expect(e.isServerError, isTrue);
        expect(e.backendMessage, equals('Database connection failed'));
      }
    });

    test('Network failure throws NetworkException as DioException with connectionError type', () async {
      final mockClient = MockClient((request) async {
        throw http.ClientException('Network unreachable');
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      try {
        await apiClient.get('/media');
        fail('Should throw NetworkException');
      } on NetworkException catch (e) {
        expect(e, isA<DioException>());
        expect(e.type, equals(DioExceptionType.connectionError));
        expect(e.isNetworkError, isTrue);
        expect(e.statusCode, isNull);
      }
    });

    test('ApiClient.request returns raw Response object and handles headers', () async {
      final mockClient = MockClient((request) async {
        expect(request.headers['Authorization'], equals('Bearer secret_token_123'));
        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Berhasil',
            'data': {'title': 'Gundala'},
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
        customInterceptors: [
          AuthInterceptor(tokenProvider: () => 'secret_token_123'),
        ],
      );

      final response = await apiClient.request<Map<String, dynamic>>(
        '/media/m1',
        method: 'GET',
      );

      expect(response, isA<Response>());
      expect(response.statusCode, equals(200));
      expect(response.isSuccess, isTrue);
      expect(response.data, isNotNull);
      expect((response.data as Map)['title'], equals('Gundala'));
    });

    test('Manual DioException factory constructors work as expected', () {
      final options = RequestOptions(path: '/test/endpoint', method: 'POST');

      // 1. Connection Timeout
      final timeoutErr = DioException.connectionTimeout(
        requestOptions: options,
        timeout: const Duration(seconds: 10),
      );
      expect(timeoutErr.type, equals(DioExceptionType.connectionTimeout));
      expect(timeoutErr.isTimeout, isTrue);

      // 2. Connection Error
      final connErr = DioException.connectionError(
        requestOptions: options,
        reason: 'Host unreachable',
      );
      expect(connErr.type, equals(DioExceptionType.connectionError));
      expect(connErr.isNetworkError, isTrue);

      // 3. Cancel
      final cancelErr = DioException.cancel(
        requestOptions: options,
        reason: 'Pengguna menavigasi keluar',
      );
      expect(cancelErr.type, equals(DioExceptionType.cancel));
      expect(cancelErr.message, equals('Pengguna menavigasi keluar'));

      // 4. Bad Certificate
      final certErr = DioException.badCertificate(requestOptions: options);
      expect(certErr.type, equals(DioExceptionType.badCertificate));
      expect(certErr.isBadCertificate, isTrue);

      // 5. Unknown
      final unknownErr = DioException.unknown(
        requestOptions: options,
        message: 'Unknown failure',
      );
      expect(unknownErr.type, equals(DioExceptionType.unknown));
      expect(unknownErr.message, equals('Unknown failure'));
    });

    test('409 Conflict throws ConflictException as DioException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Email hafiz@streamflix.id sudah terdaftar',
          }),
          409,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      try {
        await apiClient.post('/auth/register', body: {'email': 'hafiz@streamflix.id'});
        fail('Should throw ConflictException');
      } on ConflictException catch (e) {
        expect(e, isA<DioException>());
        expect(e, isA<ApiException>());
        expect(e.statusCode, equals(409));
        expect(e.isConflict, isTrue);
        expect(e.backendMessage, equals('Email hafiz@streamflix.id sudah terdaftar'));
        expect(e.isBadRequest, isFalse);
      }
    });

    test('ErrorInterceptor intercepts error and triggers callback', () async {
      DioException? capturedError;
      final errorInterceptor = ErrorInterceptor(
        onErrorCallback: (err) {
          capturedError = err;
        },
      );

      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({'message': 'Server down'}),
          503,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
        customInterceptors: [errorInterceptor],
      );

      try {
        await apiClient.get('/test');
        fail('Should throw ServerException');
      } on ServerException catch (e) {
        expect(capturedError, isNotNull);
        expect(capturedError?.statusCode, equals(503));
        expect(capturedError?.backendMessage, equals('Server down'));
        expect(e.isServerError, isTrue);
      }
    });

    test('extractBackendMessage correctly parses various backend error payloads', () {
      // 1. Spring Boot ApiResponse message field
      expect(
        DioException.extractBackendMessage({'message': 'Error custom'}),
        equals('Error custom'),
      );

      // 2. Spring Boot default error attribute
      expect(
        DioException.extractBackendMessage({'error': 'Not Found'}),
        equals('Not Found'),
      );

      // 3. Validation errors list
      expect(
        DioException.extractBackendMessage({
          'errors': ['Email invalid', 'Password too short']
        }),
        equals('Email invalid, Password too short'),
      );

      // 4. Raw JSON string
      expect(
        DioException.extractBackendMessage('{"message": "JSON raw error"}'),
        equals('JSON raw error'),
      );

      // 5. Plain text
      expect(
        DioException.extractBackendMessage('Service Unavailable'),
        equals('Service Unavailable'),
      );

      // 6. Null or HTML response ignored
      expect(DioException.extractBackendMessage(null), isNull);
      expect(DioException.extractBackendMessage('<html><body>Error</body></html>'), isNull);
    });

    test('PATCH and HEAD methods execute correctly via ApiClient', () async {
      final mockClient = MockClient((request) async {
        if (request.method == 'PATCH') {
          return http.Response(
            jsonEncode({'success': true, 'message': 'Patched', 'data': {'patched': true}}),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'HEAD') {
          return http.Response('', 200, headers: {'x-custom-header': 'val'});
        }
        return http.Response('Not supported', 400);
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      final patchRes = await apiClient.patch<Map<String, dynamic>>(
        '/patch-test',
        body: {'field': 'update'},
        fromJson: (d) => d as Map<String, dynamic>,
      );
      expect(patchRes.success, isTrue);
      expect(patchRes.data?['patched'], isTrue);

      final headRes = await apiClient.head('/head-test');
      expect(headRes.success, isTrue);
    });
  });
}
