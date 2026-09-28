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

  /// Client User-Agent identifying LiveEuy Mobile client
  static String get clientUserAgent {
    if (kIsWeb) return 'LiveEuy-Web/2.4.0 (Flutter Web)';
    try {
      if (Platform.isIOS) return 'LiveEuy-Mobile/2.4.0 (iOS; Mobile)';
      if (Platform.isAndroid) return 'LiveEuy-Mobile/2.4.0 (Android; Mobile)';
    } catch (_) {}
    return 'LiveEuy-Mobile/2.4.0 (Mobile; Dart)';
  }

  /// Device classification matching dev-frontend ('Mobile' | 'Desktop' | 'Tablet')
  static String get deviceType {
    if (kIsWeb) return 'Desktop';
    return 'Mobile';
  }

  /// Client platform string ('Android' | 'iOS' | 'Web')
  static String get clientPlatform {
    if (kIsWeb) return 'Web';
    try {
      if (Platform.isIOS) return 'iOS';
      if (Platform.isAndroid) return 'Android';
    } catch (_) {}
    return 'Mobile';
  }

  /// Default HTTP headers distinguishing mobile app from web
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json',
    'User-Agent': clientUserAgent,
    'X-Device-Type': deviceType,
    'X-Client-Platform': clientPlatform,
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
  static const String watchlistBatchDeletePath = '/user/watchlist/batch-delete';

  static const String progressPath = '/user/progress';
  static String reviewsPath(String mediaId) => '/media/$mediaId/reviews';
  static const String settingsPath = '/user/settings';

  // Device & Auth Security paths
  static const String loginPath = '/auth/login';
  static const String registerPath = '/auth/register';
  static const String refreshPath = '/auth/refresh';
  static const String mePath = '/auth/me';
  static const String logoutPath = '/auth/logout';
  static const String logoutAllPath = '/auth/logout-all';
  static String revokeDevicePath(String deviceId) => '/auth/devices/$deviceId';
  static String deviceCheckPath(String email) => '/auth/device-check?email=${Uri.encodeComponent(email)}';
}

