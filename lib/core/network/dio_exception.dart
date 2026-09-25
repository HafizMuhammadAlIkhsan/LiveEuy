import 'dart:convert';
import 'api_exception.dart';

/// Jenis / tipe error pada DioException sesuai spesifikasi resmi Dio 5.x.
enum DioExceptionType {
  /// Terjadi timeout saat mencoba membuat koneksi TCP/TLS ke server backend.
  connectionTimeout,

  /// Terjadi timeout saat mengirim data request body ke server.
  sendTimeout,

  /// Terjadi timeout saat menunggu respon dari server setelah request terkirim.
  receiveTimeout,

  /// Sertifikat SSL/TLS server tidak valid atau gagal diverifikasi.
  badCertificate,

  /// Server merespon dengan status code HTTP di luar rentang sukses (4xx atau 5xx).
  badResponse,

  /// Request dibatalkan oleh klien sebelum selesai diproses.
  cancel,

  /// Terjadi kegagalan koneksi jaringan (misal: offline, DNS error, SocketException).
  connectionError,

  /// Kesalahan lain di luar kategori di atas.
  unknown,
}

/// Opsi konfigurasi request HTTP (mirip RequestOptions pada Dio).
class RequestOptions {
  final String path;
  final String method;
  final Map<String, dynamic> headers;
  final Map<String, dynamic>? queryParameters;
  final dynamic data;
  final String baseUrl;
  final Duration? connectTimeout;
  final Duration? receiveTimeout;
  final Duration? sendTimeout;
  final Map<String, dynamic> extra;

  RequestOptions({
    required this.path,
    this.method = 'GET',
    Map<String, dynamic>? headers,
    this.queryParameters,
    this.data,
    this.baseUrl = '',
    this.connectTimeout,
    this.receiveTimeout,
    this.sendTimeout,
    Map<String, dynamic>? extra,
  })  : headers = headers ?? <String, dynamic>{},
        extra = extra ?? <String, dynamic>{};

  /// Menghasilkan [Uri] utuh dari baseUrl, path, dan queryParameters.
  Uri get uri {
    final cleanBase = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '$cleanBase$cleanPath';
    final baseUri = Uri.parse(fullUrl);

    if (queryParameters != null && queryParameters!.isNotEmpty) {
      final sanitized = queryParameters!.map(
        (k, v) => MapEntry(k, v?.toString() ?? ''),
      );
      return baseUri.replace(queryParameters: {
        ...baseUri.queryParameters,
        ...sanitized,
      });
    }
    return baseUri;
  }

  RequestOptions copyWith({
    String? path,
    String? method,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? queryParameters,
    dynamic data,
    String? baseUrl,
    Duration? connectTimeout,
    Duration? receiveTimeout,
    Duration? sendTimeout,
    Map<String, dynamic>? extra,
  }) {
    return RequestOptions(
      path: path ?? this.path,
      method: method ?? this.method,
      headers: headers ?? this.headers,
      queryParameters: queryParameters ?? this.queryParameters,
      data: data ?? this.data,
      baseUrl: baseUrl ?? this.baseUrl,
      connectTimeout: connectTimeout ?? this.connectTimeout,
      receiveTimeout: receiveTimeout ?? this.receiveTimeout,
      sendTimeout: sendTimeout ?? this.sendTimeout,
      extra: extra ?? this.extra,
    );
  }
}

/// Struktur data respon HTTP (mirip `Response<T>` pada Dio).
class Response<T> {
  T? data;
  final int? statusCode;
  final String? statusMessage;
  final Map<String, List<String>> headers;
  final RequestOptions requestOptions;
  final bool isRedirect;
  final Map<String, dynamic> extra;

  Response({
    this.data,
    this.statusCode,
    this.statusMessage,
    Map<String, List<String>>? headers,
    required this.requestOptions,
    this.isRedirect = false,
    Map<String, dynamic>? extra,
  })  : headers = headers ?? <String, List<String>>{},
        extra = extra ?? <String, dynamic>{};

  bool get isSuccess =>
      statusCode != null && statusCode! >= 200 && statusCode! < 300;

  @override
  String toString() {
    return 'Response [Status: $statusCode, Path: ${requestOptions.path}]';
  }
}

/// Exception standar Dio 5.x untuk LiveEuy Client.
/// Menyediakan informasi komprehensif terkait kegagalan HTTP, status code,
/// dan pesan error dari backend Spring Boot.
class DioException implements Exception, ApiException {
  final RequestOptions requestOptions;

  final Response<dynamic>? response;

  final DioExceptionType type;

  final dynamic error;

  final StackTrace? stackTrace;

  @override
  final String message;

  DioException({
    required this.requestOptions,
    this.response,
    this.type = DioExceptionType.unknown,
    this.error,
    this.stackTrace,
    String? message,
  }) : message = message ?? _resolveDefaultMessage(type, response, error);

  // ---------------------------------------------------------------------------
  // Factory Constructors
  // ---------------------------------------------------------------------------

  /// Factory untuk HTTP 4xx atau 5xx bad response.
  factory DioException.badResponse({
    required RequestOptions requestOptions,
    required Response response,
    String? message,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    final resolvedMessage = message ?? extractBackendMessage(response.data) ??
        'Server mengembalikan kesalahan HTTP ${response.statusCode}';
    return DioException(
      requestOptions: requestOptions,
      response: response,
      type: DioExceptionType.badResponse,
      message: resolvedMessage,
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Factory untuk error timeout koneksi.
  factory DioException.connectionTimeout({
    required RequestOptions requestOptions,
    Duration? timeout,
    String? message,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    final timeoutSec = timeout?.inSeconds ?? 15;
    return DioException(
      requestOptions: requestOptions,
      type: DioExceptionType.connectionTimeout,
      message: message ?? 'Koneksi timeout setelah $timeoutSec detik saat menghubungi server.',
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Factory untuk error timeout pengiriman data.
  factory DioException.sendTimeout({
    required RequestOptions requestOptions,
    Duration? timeout,
    String? message,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    return DioException(
      requestOptions: requestOptions,
      type: DioExceptionType.sendTimeout,
      message: message ?? 'Timeout saat mengirim data permintaan ke server.',
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Factory untuk error timeout penerimaan respon.
  factory DioException.receiveTimeout({
    required RequestOptions requestOptions,
    Duration? timeout,
    String? message,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    return DioException(
      requestOptions: requestOptions,
      type: DioExceptionType.receiveTimeout,
      message: message ?? 'Timeout saat menunggu balasan respon dari server.',
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Factory untuk error koneksi jaringan (offline / server mati / socket error).
  factory DioException.connectionError({
    required RequestOptions requestOptions,
    required String reason,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    return DioException(
      requestOptions: requestOptions,
      type: DioExceptionType.connectionError,
      message: 'Koneksi jaringan gagal: $reason',
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Factory saat request dibatalkan.
  factory DioException.cancel({
    required RequestOptions requestOptions,
    String? reason,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    return DioException(
      requestOptions: requestOptions,
      type: DioExceptionType.cancel,
      message: reason ?? 'Permintaan dibatalkan oleh pengguna.',
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Factory untuk kesalahan sertifikat SSL/TLS.
  factory DioException.badCertificate({
    required RequestOptions requestOptions,
    String? message,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    return DioException(
      requestOptions: requestOptions,
      type: DioExceptionType.badCertificate,
      message: message ?? 'Sertifikat keamanan SSL/TLS server tidak valid.',
      error: error,
      stackTrace: stackTrace,
    );
  }

  /// Factory untuk kesalahan tidak terduga atau tipe unknown.
  factory DioException.unknown({
    required RequestOptions requestOptions,
    String? message,
    dynamic error,
    StackTrace? stackTrace,
  }) {
    return DioException(
      requestOptions: requestOptions,
      type: DioExceptionType.unknown,
      message: message ?? error?.toString() ?? 'Terjadi kesalahan tidak terduga pada jaringan.',
      error: error,
      stackTrace: stackTrace,
    );
  }

  // ---------------------------------------------------------------------------
  // ApiException Protocol Compliance
  // ---------------------------------------------------------------------------

  @override
  int? get statusCode => response?.statusCode;

  @override
  Uri? get uri => requestOptions.uri;

  @override
  dynamic get originalError => error;

  @override
  DioException? get dioException => this;

  // ---------------------------------------------------------------------------
  // Helper Getters & Status Checks
  // ---------------------------------------------------------------------------

  /// Mengambil pesan spesifik dari backend (field `message` di JSON ApiResponse).
  @override
  String? get backendMessage => extractBackendMessage(response?.data);

  /// Status HTTP 400 Bad Request atau 422 Unprocessable Entity
  @override
  bool get isBadRequest => statusCode == 400 || statusCode == 422;

  /// Status HTTP 401 Unauthorized (Access token expired / kredensial salah)
  @override
  bool get isUnauthorized => statusCode == 401;

  /// Status HTTP 403 Forbidden (Akses dilarang)
  @override
  bool get isForbidden => statusCode == 403;

  /// Status HTTP 404 Not Found (Data tidak ditemukan)
  @override
  bool get isNotFound => statusCode == 404;

  /// Status HTTP 409 Conflict (Data sudah ada)
  @override
  bool get isConflict => statusCode == 409;

  /// Status HTTP 5xx Server Error
  @override
  bool get isServerError => statusCode != null && statusCode! >= 500;

  /// Apakah error disebabkan masalah jaringan / offline
  @override
  bool get isNetworkError =>
      type == DioExceptionType.connectionError ||
      type == DioExceptionType.connectionTimeout;

  /// Apakah error disebabkan timeout (connect, send, receive)
  @override
  bool get isTimeout =>
      type == DioExceptionType.connectionTimeout ||
      type == DioExceptionType.sendTimeout ||
      type == DioExceptionType.receiveTimeout;

  /// Apakah error disebabkan oleh kegagalan sertifikat SSL/TLS
  @override
  bool get isBadCertificate => type == DioExceptionType.badCertificate;

  /// Apakah error disebabkan oleh pembatalan request oleh pengguna
  @override
  bool get isCancelled => type == DioExceptionType.cancel;

  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return DioException(
      requestOptions: requestOptions ?? this.requestOptions,
      response: response ?? this.response,
      type: type ?? this.type,
      error: error ?? this.error,
      stackTrace: stackTrace ?? this.stackTrace,
      message: message ?? this.message,
    );
  }

  @override
  String toString() {
    final statusStr = statusCode != null ? ' [HTTP $statusCode]' : '';
    return 'DioException [${type.name}]$statusStr: $message (Path: ${requestOptions.path})';
  }

  /// Ekstraksi pesan kesalahan dari respon server backend (Spring Boot JSON envelope).
  static String? extractBackendMessage(dynamic data) {
    if (data == null) return null;
    if (data is Map) {
      if (data.containsKey('message') &&
          data['message'] != null &&
          data['message'].toString().trim().isNotEmpty) {
        return data['message'].toString();
      }
      if (data.containsKey('error') &&
          data['error'] != null &&
          data['error'].toString().trim().isNotEmpty) {
        return data['error'].toString();
      }
      if (data.containsKey('errors')) {
        final errors = data['errors'];
        if (errors is List && errors.isNotEmpty) {
          return errors.map((e) => e.toString()).join(', ');
        } else if (errors is Map && errors.isNotEmpty) {
          return errors.values.map((e) => e.toString()).join(', ');
        }
      }
    } else if (data is String) {
      final trimmed = data.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          final decoded = jsonDecode(trimmed);
          if (decoded is Map) {
            return extractBackendMessage(decoded);
          }
        } catch (_) {}
      }
      if (trimmed.isNotEmpty && !trimmed.startsWith('<')) {
        return trimmed;
      }
    }
    return null;
  }

  static String _resolveDefaultMessage(
    DioExceptionType type,
    Response<dynamic>? response,
    dynamic error,
  ) {
    final backendMsg = extractBackendMessage(response?.data);
    if (backendMsg != null && backendMsg.isNotEmpty) {
      return backendMsg;
    }

    switch (type) {
      case DioExceptionType.connectionTimeout:
        return 'Koneksi ke server backend timeout.';
      case DioExceptionType.sendTimeout:
        return 'Timeout saat mengirim data ke server.';
      case DioExceptionType.receiveTimeout:
        return 'Timeout saat menunggu balasan respon server.';
      case DioExceptionType.badCertificate:
        return 'Sertifikat keamanan server tidak valid.';
      case DioExceptionType.badResponse:
        final code = response?.statusCode;
        return 'Server mengembalikan kesalahan HTTP $code.';
      case DioExceptionType.cancel:
        return 'Permintaan dibatalkan.';
      case DioExceptionType.connectionError:
        return 'Gagal terhubung ke server backend.';
      case DioExceptionType.unknown:
        return error?.toString() ?? 'Terjadi kesalahan tidak terduga pada jaringan.';
    }
  }
}
