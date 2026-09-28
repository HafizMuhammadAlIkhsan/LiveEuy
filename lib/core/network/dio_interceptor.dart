import 'package:flutter/foundation.dart';
import 'dio_exception.dart';

/// Handler untuk melanjutkan atau memodifikasi request pada Interceptor.
class RequestInterceptorHandler {
  void next(RequestOptions options) {}
  void resolve(Response response) {}
  void reject(DioException error) {
    throw error;
  }
}

/// Handler untuk melanjutkan atau memodifikasi respon pada Interceptor.
class ResponseInterceptorHandler {
  void next(Response response) {}
  void resolve(Response response) {}
  void reject(DioException error) {
    throw error;
  }
}

/// Handler untuk melanjutkan atau menyelesaikan error pada Interceptor.
class ErrorInterceptorHandler {
  void next(DioException err) {
    throw err;
  }

  void resolve(Response response) {}
  void reject(DioException error) {
    throw error;
  }
}

/// Basis Interceptor standar Dio 5.x untuk modifikasi request, response, dan error.
abstract class Interceptor {
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    handler.next(options);
  }

  void onResponse(Response response, ResponseInterceptorHandler handler) {
    handler.next(response);
  }

  void onError(DioException err, ErrorInterceptorHandler handler) {
    handler.next(err);
  }
}

/// Interceptor untuk mencetak log HTTP terperinci saat debug mode.
class LoggingInterceptor extends Interceptor {
  final bool logBody;
  LoggingInterceptor({this.logBody = false});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('[Dio/HTTP] --> ${options.method} ${options.uri}');
      if (logBody && options.data != null) {
        debugPrint('[Dio/HTTP] Body: ${options.data}');
      }
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('[Dio/HTTP] <-- [${response.statusCode}] ${response.requestOptions.method} ${response.requestOptions.uri}');
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('[Dio/HTTP] <-- ERROR [${err.statusCode ?? err.type.name}] ${err.requestOptions.method} ${err.requestOptions.uri}: ${err.message}');
    }
    handler.next(err);
  }
}

/// Interceptor untuk otomatis menyematkan Bearer token autentikasi.
class AuthInterceptor extends Interceptor {
  final String? Function() tokenProvider;

  AuthInterceptor({required this.tokenProvider});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = tokenProvider();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}

/// Interceptor untuk menangkap, mencatat, atau mentransformasikan DioException secara global.
class ErrorInterceptor extends Interceptor {
  final void Function(DioException err)? onErrorCallback;

  ErrorInterceptor({this.onErrorCallback});

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (onErrorCallback != null) {
      onErrorCallback!(err);
    }
    handler.next(err);
  }
}

