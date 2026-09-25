import 'dio_exception.dart';

/// Basis exception untuk semua interaksi API di LiveEuy.
/// Terintegrasi 100% dengan `DioException` standar Dio 5.x.
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Uri? uri;
  final dynamic originalError;
  final DioException? dioException;

  const ApiException({
    required this.message,
    this.statusCode,
    this.uri,
    this.originalError,
    this.dioException,
  });

  /// Pesan error terurai dari backend (jika ada)
  String? get backendMessage => dioException?.backendMessage;

  /// Status HTTP 400 Bad Request atau 422 Unprocessable Entity
  bool get isBadRequest => dioException?.isBadRequest ?? (statusCode == 400 || statusCode == 422);

  /// Status HTTP 401 Unauthorized
  bool get isUnauthorized => dioException?.isUnauthorized ?? (statusCode == 401);

  /// Status HTTP 403 Forbidden
  bool get isForbidden => dioException?.isForbidden ?? (statusCode == 403);

  /// Status HTTP 404 Not Found
  bool get isNotFound => dioException?.isNotFound ?? (statusCode == 404);

  /// Status HTTP 409 Conflict
  bool get isConflict => dioException?.isConflict ?? (statusCode == 409);

  /// Status HTTP 5xx Server Error
  bool get isServerError => dioException?.isServerError ?? (statusCode != null && statusCode! >= 500);

  /// Apakah error jaringan / offline
  bool get isNetworkError => dioException?.isNetworkError ?? false;

  /// Apakah error timeout
  bool get isTimeout => dioException?.isTimeout ?? false;

  /// Apakah error akibat sertifikat SSL/TLS tidak valid
  bool get isBadCertificate => dioException?.isBadCertificate ?? false;

  /// Apakah request dibatalkan oleh klien
  bool get isCancelled => dioException?.isCancelled ?? false;

  @override
  String toString() {
    if (statusCode != null) {
      return 'ApiException [$statusCode]: $message (URI: $uri)';
    }
    return 'ApiException: $message';
  }
}

/// Kesalahan kegagalan koneksi jaringan (mirip DioExceptionType.connectionError).
class NetworkException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  NetworkException({
    required super.message,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = null,
        type = DioExceptionType.connectionError,
        error = originalError,
        super(statusCode: null, dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => null;

  @override
  bool get isBadRequest => false;

  @override
  bool get isUnauthorized => false;

  @override
  bool get isForbidden => false;

  @override
  bool get isNotFound => false;

  @override
  bool get isConflict => false;

  @override
  bool get isServerError => false;

  @override
  bool get isNetworkError => true;

  @override
  bool get isTimeout => false;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return NetworkException(
      message: message ?? this.message,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

/// Kesalahan timeout koneksi atau timeout respon (mirip DioExceptionType.connectionTimeout / receiveTimeout).
class ApiTimeoutException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  ApiTimeoutException({
    required super.message,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    DioExceptionType? timeoutType,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = null,
        type = timeoutType ?? DioExceptionType.connectionTimeout,
        error = originalError,
        super(statusCode: null, dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => null;

  @override
  bool get isBadRequest => false;

  @override
  bool get isUnauthorized => false;

  @override
  bool get isForbidden => false;

  @override
  bool get isNotFound => false;

  @override
  bool get isConflict => false;

  @override
  bool get isServerError => false;

  @override
  bool get isNetworkError => true;

  @override
  bool get isTimeout => true;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return ApiTimeoutException(
      message: message ?? this.message,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      timeoutType: type ?? this.type,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

/// Kesalahan HTTP 404 Not Found (Data tidak ditemukan).
class NotFoundException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  NotFoundException({
    required super.message,
    super.statusCode = 404,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = response ??
            Response(
              statusCode: 404,
              requestOptions: requestOptions ?? RequestOptions(path: uri?.path ?? ''),
            ),
        type = DioExceptionType.badResponse,
        error = originalError,
        super(dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => message;

  @override
  bool get isBadRequest => false;

  @override
  bool get isUnauthorized => false;

  @override
  bool get isForbidden => false;

  @override
  bool get isNotFound => true;

  @override
  bool get isConflict => false;

  @override
  bool get isServerError => false;

  @override
  bool get isNetworkError => false;

  @override
  bool get isTimeout => false;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return NotFoundException(
      message: message ?? this.message,
      statusCode: statusCode ?? 404,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      response: response ?? this.response,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

/// Kesalahan HTTP 5xx Internal Server Error.
class ServerException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  ServerException({
    required super.message,
    super.statusCode = 500,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = response ??
            Response(
              statusCode: statusCode ?? 500,
              requestOptions: requestOptions ?? RequestOptions(path: uri?.path ?? ''),
            ),
        type = DioExceptionType.badResponse,
        error = originalError,
        super(dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => message;

  @override
  bool get isBadRequest => false;

  @override
  bool get isUnauthorized => false;

  @override
  bool get isForbidden => false;

  @override
  bool get isNotFound => false;

  @override
  bool get isConflict => false;

  @override
  bool get isServerError => true;

  @override
  bool get isNetworkError => false;

  @override
  bool get isTimeout => false;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return ServerException(
      message: message ?? this.message,
      statusCode: statusCode ?? 500,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      response: response ?? this.response,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

/// Kesalahan HTTP 401 Unauthorized (Autentikasi gagal / token kedaluwarsa).
class UnauthorizedException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  UnauthorizedException({
    required super.message,
    super.statusCode = 401,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = response ??
            Response(
              statusCode: 401,
              requestOptions: requestOptions ?? RequestOptions(path: uri?.path ?? ''),
            ),
        type = DioExceptionType.badResponse,
        error = originalError,
        super(dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => message;

  @override
  bool get isBadRequest => false;

  @override
  bool get isUnauthorized => true;

  @override
  bool get isForbidden => false;

  @override
  bool get isNotFound => false;

  @override
  bool get isConflict => false;

  @override
  bool get isServerError => false;

  @override
  bool get isNetworkError => false;

  @override
  bool get isTimeout => false;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return UnauthorizedException(
      message: message ?? this.message,
      statusCode: statusCode ?? 401,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      response: response ?? this.response,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

/// Kesalahan HTTP 403 Forbidden (Akses dilarang / izin tidak mencukupi).
class ForbiddenException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  ForbiddenException({
    required super.message,
    super.statusCode = 403,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = response ??
            Response(
              statusCode: 403,
              requestOptions: requestOptions ?? RequestOptions(path: uri?.path ?? ''),
            ),
        type = DioExceptionType.badResponse,
        error = originalError,
        super(dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => message;

  @override
  bool get isBadRequest => false;

  @override
  bool get isUnauthorized => false;

  @override
  bool get isForbidden => true;

  @override
  bool get isNotFound => false;

  @override
  bool get isConflict => false;

  @override
  bool get isServerError => false;

  @override
  bool get isNetworkError => false;

  @override
  bool get isTimeout => false;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return ForbiddenException(
      message: message ?? this.message,
      statusCode: statusCode ?? 403,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      response: response ?? this.response,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

/// Kesalahan HTTP 400 Bad Request (Validasi input gagal).
class BadRequestException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  BadRequestException({
    required super.message,
    super.statusCode = 400,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = response ??
            Response(
              statusCode: 400,
              requestOptions: requestOptions ?? RequestOptions(path: uri?.path ?? ''),
            ),
        type = DioExceptionType.badResponse,
        error = originalError,
        super(dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => message;

  @override
  bool get isBadRequest => true;

  @override
  bool get isUnauthorized => false;

  @override
  bool get isForbidden => false;

  @override
  bool get isNotFound => false;

  @override
  bool get isConflict => false;

  @override
  bool get isServerError => false;

  @override
  bool get isNetworkError => false;

  @override
  bool get isTimeout => false;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return BadRequestException(
      message: message ?? this.message,
      statusCode: statusCode ?? 400,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      response: response ?? this.response,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

/// Kesalahan HTTP 409 Conflict (Data sudah ada / duplikasi entitas di server).
class ConflictException extends ApiException implements DioException {
  @override
  final RequestOptions requestOptions;

  @override
  final Response<dynamic>? response;

  @override
  final DioExceptionType type;

  @override
  final dynamic error;

  @override
  final StackTrace? stackTrace;

  ConflictException({
    required super.message,
    super.statusCode = 409,
    super.uri,
    super.originalError,
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    this.stackTrace,
  })  : requestOptions = requestOptions ?? RequestOptions(path: uri?.path ?? ''),
        response = response ??
            Response(
              statusCode: 409,
              requestOptions: requestOptions ?? RequestOptions(path: uri?.path ?? ''),
            ),
        type = DioExceptionType.badResponse,
        error = originalError,
        super(dioException: null);

  @override
  DioException? get dioException => this;

  @override
  String? get backendMessage => message;

  @override
  bool get isBadRequest => false;

  @override
  bool get isUnauthorized => false;

  @override
  bool get isForbidden => false;

  @override
  bool get isNotFound => false;

  @override
  bool get isConflict => true;

  @override
  bool get isServerError => false;

  @override
  bool get isNetworkError => false;

  @override
  bool get isTimeout => false;

  @override
  bool get isBadCertificate => false;

  @override
  bool get isCancelled => false;

  @override
  DioException copyWith({
    RequestOptions? requestOptions,
    Response<dynamic>? response,
    DioExceptionType? type,
    dynamic error,
    StackTrace? stackTrace,
    String? message,
  }) {
    return ConflictException(
      message: message ?? this.message,
      statusCode: statusCode ?? 409,
      uri: uri,
      originalError: error ?? this.error,
      requestOptions: requestOptions ?? this.requestOptions,
      response: response ?? this.response,
      stackTrace: stackTrace ?? this.stackTrace,
    );
  }
}

