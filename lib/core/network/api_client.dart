import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'api_exception.dart';
import 'api_response.dart';
import 'dio_exception.dart';
import 'dio_interceptor.dart';

export 'dio_exception.dart';
export 'dio_interceptor.dart';
export 'api_exception.dart';
export 'api_response.dart';
export 'api_config.dart';

/// Klien HTTP terpadu LiveEuy yang mengadopsi arsitektur Dio 5.x.
/// Mendukung:
/// - Penanganan error komprehensif menggunakan [DioException] & [DioExceptionType]
/// - Interceptor untuk logging, token injection, dan transformasi error
/// - Parsing otomatis pesan error backend Spring Boot (`ApiResponse.message`)
/// - Kompatibilitas penuh dengan kontrak API dan unit test yang sudah ada
class ApiClient {
  final http.Client _httpClient;
  final String? _baseUrlOverride;
  final List<Interceptor> interceptors = [];

  ApiClient({
    http.Client? httpClient,
    String? baseUrl,
    List<Interceptor>? customInterceptors,
  })  : _httpClient = httpClient ?? http.Client(),
        _baseUrlOverride = baseUrl {
    interceptors.add(LoggingInterceptor());
    if (customInterceptors != null) {
      interceptors.addAll(customInterceptors);
    }
  }

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
    final requestOptions = RequestOptions(
      path: path,
      method: 'GET',
      baseUrl: baseUrl,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...?headers,
      },
      queryParameters: queryParams,
      connectTimeout: timeout ?? ApiConfig.timeout,
    );

    return _sendRequest<T>(
      () => _httpClient.get(
        requestOptions.uri,
        headers: requestOptions.headers.map((k, v) => MapEntry(k, v.toString())),
      ),
      method: 'GET',
      uri: uri,
      requestOptions: requestOptions,
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
    final requestOptions = RequestOptions(
      path: path,
      method: 'POST',
      baseUrl: baseUrl,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...?headers,
      },
      queryParameters: queryParams,
      data: body,
      connectTimeout: timeout ?? ApiConfig.timeout,
    );

    return _sendRequest<T>(
      () => _httpClient.post(
        requestOptions.uri,
        headers: requestOptions.headers.map((k, v) => MapEntry(k, v.toString())),
        body: encodedBody,
      ),
      method: 'POST',
      uri: uri,
      requestOptions: requestOptions,
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
    final requestOptions = RequestOptions(
      path: path,
      method: 'PUT',
      baseUrl: baseUrl,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...?headers,
      },
      queryParameters: queryParams,
      data: body,
      connectTimeout: timeout ?? ApiConfig.timeout,
    );

    return _sendRequest<T>(
      () => _httpClient.put(
        requestOptions.uri,
        headers: requestOptions.headers.map((k, v) => MapEntry(k, v.toString())),
        body: encodedBody,
      ),
      method: 'PUT',
      uri: uri,
      requestOptions: requestOptions,
      fromJson: fromJson,
      timeout: timeout,
    );
  }

  /// Sends a PATCH request to the given [path].
  Future<ApiResponse<T>> patch<T>(
    String path, {
    Map<String, dynamic>? queryParams,
    Object? body,
    Map<String, String>? headers,
    T Function(dynamic data)? fromJson,
    Duration? timeout,
  }) async {
    final uri = _buildUri(path, queryParams);
    final encodedBody = _encodeBody(body);
    final requestOptions = RequestOptions(
      path: path,
      method: 'PATCH',
      baseUrl: baseUrl,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...?headers,
      },
      queryParameters: queryParams,
      data: body,
      connectTimeout: timeout ?? ApiConfig.timeout,
    );

    return _sendRequest<T>(
      () => _httpClient.patch(
        requestOptions.uri,
        headers: requestOptions.headers.map((k, v) => MapEntry(k, v.toString())),
        body: encodedBody,
      ),
      method: 'PATCH',
      uri: uri,
      requestOptions: requestOptions,
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
    final requestOptions = RequestOptions(
      path: path,
      method: 'DELETE',
      baseUrl: baseUrl,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...?headers,
      },
      queryParameters: queryParams,
      connectTimeout: timeout ?? ApiConfig.timeout,
    );

    return _sendRequest<T>(
      () => _httpClient.delete(
        requestOptions.uri,
        headers: requestOptions.headers.map((k, v) => MapEntry(k, v.toString())),
      ),
      method: 'DELETE',
      uri: uri,
      requestOptions: requestOptions,
      fromJson: fromJson,
      timeout: timeout,
    );
  }

  /// Sends a HEAD request to the given [path].
  Future<ApiResponse<T>> head<T>(
    String path, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
    Duration? timeout,
  }) async {
    final uri = _buildUri(path, queryParams);
    final requestOptions = RequestOptions(
      path: path,
      method: 'HEAD',
      baseUrl: baseUrl,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...?headers,
      },
      queryParameters: queryParams,
      connectTimeout: timeout ?? ApiConfig.timeout,
    );

    return _sendRequest<T>(
      () => _httpClient.head(
        requestOptions.uri,
        headers: requestOptions.headers.map((k, v) => MapEntry(k, v.toString())),
      ),
      method: 'HEAD',
      uri: uri,
      requestOptions: requestOptions,
      timeout: timeout,
    );
  }

  /// Mengirim request mentah bergaya Dio dan mengembalikan [Response<T>].
  /// Melemparkan [DioException] jika terjadi kegagalan HTTP atau koneksi.
  Future<Response<T>> request<T>(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? queryParams,
    dynamic data,
    Map<String, String>? headers,
    Duration? timeout,
  }) async {
    final uri = _buildUri(path, queryParams);
    final requestOptions = RequestOptions(
      path: path,
      method: method,
      baseUrl: baseUrl,
      headers: {
        ...ApiConfig.defaultHeaders,
        ...?headers,
      },
      queryParameters: queryParams,
      data: data,
      connectTimeout: timeout ?? ApiConfig.timeout,
    );

    final apiResponse = await _sendRequest<dynamic>(
      () {
        final encoded = _encodeBody(data);
        switch (method.toUpperCase()) {
          case 'POST':
            return _httpClient.post(uri, headers: requestOptions.headers.cast<String, String>(), body: encoded);
          case 'PUT':
            return _httpClient.put(uri, headers: requestOptions.headers.cast<String, String>(), body: encoded);
          case 'DELETE':
            return _httpClient.delete(uri, headers: requestOptions.headers.cast<String, String>());
          default:
            return _httpClient.get(uri, headers: requestOptions.headers.cast<String, String>());
        }
      },
      method: method,
      uri: uri,
      requestOptions: requestOptions,
      timeout: timeout,
    );

    return Response<T>(
      data: apiResponse.data as T?,
      statusCode: 200,
      statusMessage: apiResponse.message,
      requestOptions: requestOptions,
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
    required RequestOptions requestOptions,
    T Function(dynamic data)? fromJson,
    Duration? timeout,
  }) async {
    final requestTimeout = timeout ?? ApiConfig.timeout;

    // Run onRequest interceptors
    for (final interceptor in interceptors) {
      try {
        interceptor.onRequest(requestOptions, RequestInterceptorHandler());
      } catch (_) {}
    }

    try {
      final response = await requestFn().timeout(requestTimeout);
      final responseBody = utf8.decode(response.bodyBytes);

      dynamic decodedData;
      Map<String, dynamic>? jsonMap;
      if (responseBody.isNotEmpty) {
        try {
          decodedData = jsonDecode(responseBody);
          if (decodedData is Map<String, dynamic>) {
            jsonMap = decodedData;
          }
        } catch (_) {
          decodedData = responseBody;
        }
      }

      final dioResponse = Response(
        data: decodedData,
        statusCode: response.statusCode,
        statusMessage: response.reasonPhrase,
        headers: response.headers.map((k, v) => MapEntry(k, [v])),
        requestOptions: requestOptions,
      );

      // Run onResponse interceptors
      for (final interceptor in interceptors) {
        try {
          interceptor.onResponse(dioResponse, ResponseInterceptorHandler());
        } catch (_) {}
      }

      return _processResponse<T>(
        response,
        uri,
        requestOptions,
        dioResponse,
        decodedData,
        jsonMap,
        fromJson,
      );
    } on SocketException catch (e) {
      final err = NetworkException(
        message: 'Koneksi ke server gagal: periksa koneksi internet atau server backend.',
        uri: uri,
        originalError: e,
        requestOptions: requestOptions,
      );
      _notifyErrorInterceptors(err);
      throw err;
    } on http.ClientException catch (e) {
      final err = NetworkException(
        message: 'Gagal menghubungi server: ${e.message}',
        uri: uri,
        originalError: e,
        requestOptions: requestOptions,
      );
      _notifyErrorInterceptors(err);
      throw err;
    } on TimeoutException catch (e) {
      final err = ApiTimeoutException(
        message: 'Koneksi timeout setelah ${requestTimeout.inSeconds} detik.',
        uri: uri,
        originalError: e,
        requestOptions: requestOptions,
      );
      _notifyErrorInterceptors(err);
      throw err;
    } on DioException catch (e) {
      _notifyErrorInterceptors(e);
      rethrow;
    } catch (e, st) {
      if (e is DioException) {
        _notifyErrorInterceptors(e);
        rethrow;
      }
      if (e is ApiException) {
        rethrow;
      }
      final err = DioException(
        requestOptions: requestOptions,
        type: DioExceptionType.unknown,
        error: e,
        stackTrace: st,
        message: 'Terjadi kesalahan tidak terduga: $e',
      );
      _notifyErrorInterceptors(err);
      throw err;
    }
  }

  void _notifyErrorInterceptors(DioException err) {
    for (final interceptor in interceptors) {
      try {
        interceptor.onError(err, ErrorInterceptorHandler());
      } catch (_) {}
    }
  }

  ApiResponse<T> _processResponse<T>(
    http.Response response,
    Uri uri,
    RequestOptions requestOptions,
    Response dioResponse,
    dynamic decodedData,
    Map<String, dynamic>? jsonMap,
    T Function(dynamic data)? fromJson,
  ) {
    final statusCode = response.statusCode;

    // Check HTTP status code
    if (statusCode >= 200 && statusCode < 300) {
      if (jsonMap != null) {
        return ApiResponse<T>.fromJson(jsonMap, fromJson);
      } else {
        return ApiResponse<T>(
          success: true,
          message: response.reasonPhrase ?? 'OK',
          data: decodedData as dynamic,
          timestamp: DateTime.now(),
        );
      }
    }

    final backendMessage = DioException.extractBackendMessage(decodedData);

    if (statusCode == 400 || statusCode == 422) {
      throw BadRequestException(
        message: backendMessage ?? 'Permintaan tidak valid ($statusCode)',
        statusCode: statusCode,
        uri: uri,
        requestOptions: requestOptions,
        response: dioResponse,
      );
    } else if (statusCode == 401) {
      throw UnauthorizedException(
        message: backendMessage ?? 'Autentikasi gagal / Sesi kedaluwarsa (401)',
        statusCode: 401,
        uri: uri,
        requestOptions: requestOptions,
        response: dioResponse,
      );
    } else if (statusCode == 403) {
      throw ForbiddenException(
        message: backendMessage ?? 'Akses ditolak (403 Forbidden)',
        statusCode: 403,
        uri: uri,
        requestOptions: requestOptions,
        response: dioResponse,
      );
    } else if (statusCode == 404) {
      throw NotFoundException(
        message: backendMessage ?? 'Data tidak ditemukan (404 Not Found)',
        statusCode: 404,
        uri: uri,
        requestOptions: requestOptions,
        response: dioResponse,
      );
    } else if (statusCode == 409) {
      throw ConflictException(
        message: backendMessage ?? 'Terjadi konflik data (409 Conflict)',
        statusCode: 409,
        uri: uri,
        requestOptions: requestOptions,
        response: dioResponse,
      );
    } else if (statusCode >= 500) {
      throw ServerException(
        message: backendMessage ?? 'Kesalahan internal server ($statusCode)',
        statusCode: statusCode,
        uri: uri,
        requestOptions: requestOptions,
        response: dioResponse,
      );
    } else {
      throw DioException.badResponse(
        requestOptions: requestOptions,
        response: dioResponse,
        message: backendMessage ?? 'Server mengembalikan kesalahan HTTP $statusCode',
      );
    }
  }

  void close() {
    try {
      _httpClient.close();
    } catch (_) {}
  }
}
