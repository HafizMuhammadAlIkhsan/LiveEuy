import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:liveeuy_mob/core/network/api_client.dart';
import 'package:liveeuy_mob/core/network/api_exception.dart';

void main() {
  group('ApiClient Tests', () {
    test('GET request returns successful ApiResponse', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'GET');
        expect(request.url.path, '/api/v1/media');
        expect(request.url.queryParameters['limit'], '10');

        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'OK',
            'data': [
              {'id': 'm1', 'title': 'Gadis Kretek'}
            ],
            'timestamp': '2026-09-24T20:00:00',
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      final response = await apiClient.get<List<dynamic>>(
        '/media',
        queryParams: {'limit': 10},
        fromJson: (data) => data as List<dynamic>,
      );

      expect(response.success, isTrue);
      expect(response.data?.length, 1);
      expect(response.data?.first['id'], 'm1');
    });

    test('POST request sends JSON body and processes response', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.url.path, '/api/v1/user/progress');
        final decodedBody = jsonDecode(request.body);
        expect(decodedBody['mediaId'], 'm1');
        expect(decodedBody['progress'], 0.5);

        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Progress saved',
            'data': {'mediaId': 'm1', 'progress': 0.5},
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      final response = await apiClient.post<Map<String, dynamic>>(
        '/user/progress',
        body: {'mediaId': 'm1', 'progress': 0.5},
        fromJson: (data) => data as Map<String, dynamic>,
      );

      expect(response.success, isTrue);
      expect(response.data?['mediaId'], 'm1');
    });

    test('PUT request executes properly', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'PUT');
        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Updated',
            'data': true,
          }),
          200,
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      final response = await apiClient.put<bool>(
        '/update',
        body: {'key': 'val'},
        fromJson: (data) => data as bool,
      );

      expect(response.success, isTrue);
      expect(response.data, isTrue);
    });

    test('DELETE request executes properly', () async {
      final mockClient = MockClient((request) async {
        expect(request.method, 'DELETE');
        return http.Response(
          jsonEncode({
            'success': true,
            'message': 'Deleted',
            'data': null,
          }),
          200,
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      final response = await apiClient.delete('/delete/1');
      expect(response.success, isTrue);
    });

    test('404 response throws NotFoundException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Media tidak ditemukan',
          }),
          404,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      expect(
        () => apiClient.get('/media/unknown_id'),
        throwsA(isA<NotFoundException>()),
      );
    });

    test('500 response throws ServerException', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': false,
            'message': 'Internal Server Error',
          }),
          500,
          headers: {'content-type': 'application/json'},
        );
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      expect(
        () => apiClient.get('/media'),
        throwsA(isA<ServerException>()),
      );
    });

    test('Network error throws NetworkException', () async {
      final mockClient = MockClient((request) async {
        throw http.ClientException('Connection refused');
      });

      final apiClient = ApiClient(
        httpClient: mockClient,
        baseUrl: 'http://localhost:8080/api/v1',
      );

      expect(
        () => apiClient.get('/media'),
        throwsA(isA<NetworkException>()),
      );
    });
  });
}
