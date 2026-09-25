import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'api_exception.dart';
import 'api_response.dart';

class ApiClient {
  final http.Client _httpClient;
  final String? _baseUrlOverride;

  ApiClient({
    http.Client? httpClient,
    String? baseUrl,
  })  : _httpClient = httpClient ?? http.Client(),
        _baseUrlOverride = baseUrl;

  String get baseUrl => _baseUrlOverride ?? ApiConfig.baseUrl;

  /// Builds a Uri from a relative path and optional query parameters.
  Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    final cleanBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '$cleanBase$cleanPath';
    final baseUri = Uri.parse(fullUrl);

    if (queryParams != null && queryParams.isNotEmpty) {
      final sanitizedParams = queryParams.map(
        (key, value) => MapEntry(key, value?.toString() ?? ''),
      );
      return baseUri.replace(queryParameters: {
        ...baseUri.queryParameters,
        ...sanitizedParams,
      });
    }
    return baseUri;
  }

  /// Sends a GET request to the given [path].
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    T Function(dynamic data)? fromJson,
    Duration? timeout,
  }) async {
    final uri = _buildUri(path, queryParams);
    return _sendRequest<T>(
      () => _httpClient.get(
        uri,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...?headers,
        },
      ),
      method: 'GET',
      uri: uri,
      fromJson: fromJson,
      timeout: timeout,
    );
  }

  /// Sends a POST request to the given [path].
  Future<ApiResponse<T>> post<T>(
    String path, {
    Map<String, dynamic>? queryParams,
    Object? body,
    Map<String, String>? headers,
    T Function(dynamic data)? fromJson,
    Duration? timeout,
  }) async {
    final uri = _buildUri(path, queryParams);
    final encodedBody = _encodeBody(body);

    return _sendRequest<T>(
      () => _httpClient.post(
        uri,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...?headers,
        },
        body: encodedBody,
      ),
      method: 'POST',
      uri: uri,
      fromJson: fromJson,
      timeout: timeout,
    );
  }

  /// Sends a PUT request to the given [path].
  Future<ApiResponse<T>> put<T>(
    String path, {
    Map<String, dynamic>? queryParams,
    Object? body,
    Map<String, String>? headers,
    T Function(dynamic data)? fromJson,
    Duration? timeout,
  }) async {
    final uri = _buildUri(path, queryParams);
    final encodedBody = _encodeBody(body);

    return _sendRequest<T>(
      () => _httpClient.put(
        uri,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...?headers,
        },
        body: encodedBody,
      ),
      method: 'PUT',
      uri: uri,
      fromJson: fromJson,
      timeout: timeout,
    );
  }

  /// Sends a DELETE request to the given [path].
  Future<ApiResponse<T>> delete<T>(
    String path, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    T Function(dynamic data)? fromJson,
    Duration? timeout,
  }) async {
    final uri = _buildUri(path, queryParams);

    return _sendRequest<T>(
      () => _httpClient.delete(
        uri,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...?headers,
        },
      ),
      method: 'DELETE',
      uri: uri,
      fromJson: fromJson,
      timeout: timeout,
    );
  }

  String? _encodeBody(Object? body) {
    if (body == null) return null;
    if (body is String) return body;
    return jsonEncode(body);
  }

  Future<ApiResponse<T>> _sendRequest<T>(
    Future<http.Response> Function() requestFn, {
    required String method,
    required Uri uri,
    T Function(dynamic data)? fromJson,
    Duration? timeout,
  }) async {
    final requestTimeout = timeout ?? ApiConfig.timeout;

    try {
      if (kDebugMode) {
        debugPrint('[ApiClient] $method $uri');
      }

      final response = await requestFn().timeout(requestTimeout);

      if (kDebugMode) {
        debugPrint('[ApiClient] Response [${response.statusCode}] for $method $uri');
      }

      return _processResponse<T>(response, uri, fromJson);
    } on SocketException catch (e) {
      if (kDebugMode) {
        debugPrint('[ApiClient] SocketException for $method $uri: ${e.message}');
      }
      throw NetworkException(
        message: 'Koneksi ke server gagal: periksa koneksi internet atau server backend.',
        uri: uri,
        originalError: e,
      );
    } on http.ClientException catch (e) {
      if (kDebugMode) {
        debugPrint('[ApiClient] ClientException for $method $uri: ${e.message}');
      }
      throw NetworkException(
        message: 'Gagal menghubungi server: ${e.message}',
        uri: uri,
        originalError: e,
      );
    } on TimeoutException catch (e) {
      if (kDebugMode) {
        debugPrint('[ApiClient] TimeoutException for $method $uri');
      }
      throw ApiTimeoutException(
        message: 'Koneksi timeout setelah ${requestTimeout.inSeconds} detik.',
        uri: uri,
        originalError: e,
      );
    } catch (e) {
      if (e is ApiException) rethrow;
      if (kDebugMode) {
        debugPrint('[ApiClient] Unexpected error for $method $uri: $e');
      }
      throw ApiException(
        message: 'Terjadi kesalahan tidak terduga: $e',
        uri: uri,
        originalError: e,
      );
    }
  }

  ApiResponse<T> _processResponse<T>(
    http.Response response,
    Uri uri,
    T Function(dynamic data)? fromJson,
  ) {
    final statusCode = response.statusCode;
    final responseBody = utf8.decode(response.bodyBytes);

    Map<String, dynamic> jsonMap;
    try {
      final decoded = jsonDecode(responseBody);
      if (decoded is Map<String, dynamic>) {
        jsonMap = decoded;
      } else {
        jsonMap = {
          'success': statusCode >= 200 && statusCode < 300,
          'message': 'OK',
          'data': decoded,
        };
      }
    } catch (_) {
      // Body is not JSON
      if (statusCode >= 200 && statusCode < 300) {
        return ApiResponse<T>(
          success: true,
          message: 'OK',
          data: responseBody as dynamic,
          timestamp: DateTime.now(),
        );
      } else if (statusCode == 404) {
        throw NotFoundException(
          message: 'Sumber daya tidak ditemukan (404)',
          statusCode: 404,
          uri: uri,
        );
      } else {
        throw ServerException(
          message: 'Server mengembalikan kesalahan HTTP $statusCode',
          statusCode: statusCode,
          uri: uri,
        );
      }
    }

    // Check HTTP status code
    if (statusCode >= 200 && statusCode < 300) {
      return ApiResponse<T>.fromJson(jsonMap, fromJson);
    } else if (statusCode == 404) {
      throw NotFoundException(
        message: jsonMap['message'] as String? ?? 'Data tidak ditemukan (404)',
        statusCode: 404,
        uri: uri,
      );
    } else if (statusCode >= 500) {
      throw ServerException(
        message: jsonMap['message'] as String? ?? 'Kesalahan internal server ($statusCode)',
        statusCode: statusCode,
        uri: uri,
      );
    } else {
      throw ApiException(
        message: jsonMap['message'] as String? ?? 'Permintaan gagal ($statusCode)',
        statusCode: statusCode,
        uri: uri,
      );
    }
  }

  void close() {
    try {
      _httpClient.close();
    } catch (_) {}
  }
}
