import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class ApiConfig {
  /// Default backend port
  static const int defaultPort = 8080;

  /// Custom URL override if set programmatically
  static String? _customBaseUrl;

  /// Set a custom base URL at runtime (e.g. for testing with physical devices or staging server)
  static void setBaseUrl(String? url) {
    _customBaseUrl = url;
  }

  /// Determines the base URL dynamically based on environment, platform, or override.
  /// - Priority 1: Runtime custom base URL override (`ApiConfig.setBaseUrl(...)`)
  /// - Priority 2: Compile-time environment variable (`--dart-define=API_BASE_URL=...`)
  /// - Priority 3: Android Emulator default (`http://10.0.2.2:8080/api/v1`)
  /// - Priority 4: Web / iOS Simulator / Desktop default (`http://localhost:8080/api/v1`)
  static String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    const envBaseUrl = String.fromEnvironment('API_BASE_URL');
    if (envBaseUrl.isNotEmpty) {
      return envBaseUrl;
    }

    if (kIsWeb) {
      return 'http://localhost:$defaultPort/api/v1';
    }

    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:$defaultPort/api/v1';
      }
    } catch (_) {
      // In case Platform check is unsupported on a specific platform
    }

    return 'http://localhost:$defaultPort/api/v1';
  }

  /// Request timeout duration
  static const Duration timeout = Duration(seconds: 10);

  /// Default HTTP headers
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json',
  };

  /// Default active user ID for user-scoped endpoints
  static const String defaultUserId = 'u1';

  // Endpoint paths
  static const String mediaPath = '/media';
  static const String top10Path = '/media/top10';
  static String mediaDetailPath(String id) => '/media/$id';

  static const String watchlistPath = '/user/watchlist';
  static const String watchlistIdsPath = '/user/watchlist/ids';
  static String watchlistTogglePath(String mediaId) => '/user/watchlist/$mediaId';

  static const String progressPath = '/user/progress';
  static String reviewsPath(String mediaId) => '/media/$mediaId/reviews';
}
