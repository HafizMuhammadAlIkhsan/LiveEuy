class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Uri? uri;
  final dynamic originalError;

  const ApiException({
    required this.message,
    this.statusCode,
    this.uri,
    this.originalError,
  });

  @override
  String toString() {
    if (statusCode != null) {
      return 'ApiException [$statusCode]: $message (URI: $uri)';
    }
    return 'ApiException: $message';
  }
}

class NetworkException extends ApiException {
  const NetworkException({
    required super.message,
    super.uri,
    super.originalError,
  });
}

class ApiTimeoutException extends ApiException {
  const ApiTimeoutException({
    required super.message,
    super.uri,
    super.originalError,
  });
}

class NotFoundException extends ApiException {
  const NotFoundException({
    required super.message,
    super.statusCode = 404,
    super.uri,
  });
}

class ServerException extends ApiException {
  const ServerException({
    required super.message,
    super.statusCode = 500,
    super.uri,
  });
}
