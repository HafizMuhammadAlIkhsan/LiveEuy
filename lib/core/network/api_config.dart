import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class ApiConfig {
  /// Default backend ports
  static const int defaultPort = 8080;
  static const int authPort = 8080;
  static const int catalogPort = 8081;
  static const int gatewayPort = 80;
  static const int trendingPort = 3000;
  static const int transcoderPort = 8082;

  /// Custom URL override if set programmatically
  static String? _customBaseUrl;
  static String? _customAuthBaseUrl;
  static String? _customCatalogBaseUrl;
  static String? _customGatewayBaseUrl;
  static String? _customTrendingBaseUrl;
  static String? _customTranscoderBaseUrl;

  /// Set a custom base URL at runtime (e.g. for testing with physical devices or staging server)
  static void setBaseUrl(String? url) {
    _customBaseUrl = url;
  }

  /// Set custom base URL for auth-service
  static void setAuthBaseUrl(String? url) {
    _customAuthBaseUrl = url;
  }

  /// Set custom base URL for catalog-service
  static void setCatalogBaseUrl(String? url) {
    _customCatalogBaseUrl = url;
  }

  /// Set custom base URL for unified Nginx gateway
  static void setGatewayBaseUrl(String? url) {
    _customGatewayBaseUrl = url;
  }

  /// Set custom base URL for trending-service
  static void setTrendingBaseUrl(String? url) {
    _customTrendingBaseUrl = url;
  }

  /// Set custom base URL for transcoder-service
  static void setTranscoderBaseUrl(String? url) {
    _customTranscoderBaseUrl = url;
  }

  /// Determines the auth-service base URL (Port 8080 by default)
  static String get authBaseUrl {
    if (_customAuthBaseUrl != null && _customAuthBaseUrl!.isNotEmpty) {
      return _customAuthBaseUrl!;
    }
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    const envAuthUrl = String.fromEnvironment('AUTH_API_BASE_URL');
    if (envAuthUrl.isNotEmpty) return envAuthUrl;

    const envBaseUrl = String.fromEnvironment('API_BASE_URL');
    if (envBaseUrl.isNotEmpty) return envBaseUrl;

    if (kIsWeb) return 'http://localhost:$authPort/api/v1';

    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:$authPort/api/v1';
    } catch (_) {}

    return 'http://localhost:$authPort/api/v1';
  }

  /// Determines the catalog-service base URL (Port 8081 by default)
  static String get catalogBaseUrl {
    if (_customCatalogBaseUrl != null && _customCatalogBaseUrl!.isNotEmpty) {
      return _customCatalogBaseUrl!;
    }
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    const envCatalogUrl = String.fromEnvironment('CATALOG_API_BASE_URL');
    if (envCatalogUrl.isNotEmpty) return envCatalogUrl;

    const envBaseUrl = String.fromEnvironment('API_BASE_URL');
    if (envBaseUrl.isNotEmpty) return envBaseUrl;

    if (kIsWeb) return 'http://localhost:$catalogPort/api/v1';

    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:$catalogPort/api/v1';
    } catch (_) {}

    return 'http://localhost:$catalogPort/api/v1';
  }

  /// Determines the unified Nginx gateway base URL (Port 80 in Docker/Staging)
  static String get gatewayBaseUrl {
    if (_customGatewayBaseUrl != null && _customGatewayBaseUrl!.isNotEmpty) {
      return _customGatewayBaseUrl!;
    }
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    const envGatewayUrl = String.fromEnvironment('GATEWAY_API_BASE_URL');
    if (envGatewayUrl.isNotEmpty) return envGatewayUrl;

    const envBaseUrl = String.fromEnvironment('API_BASE_URL');
    if (envBaseUrl.isNotEmpty) return envBaseUrl;

    if (kIsWeb) return 'http://localhost:$gatewayPort/api/v1';

    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:$gatewayPort/api/v1';
    } catch (_) {}

    return 'http://localhost:$gatewayPort/api/v1';
  }

  /// Determines the trending-service base URL (Port 3000 by default or unified gateway)
  static String get trendingBaseUrl {
    if (_customTrendingBaseUrl != null && _customTrendingBaseUrl!.isNotEmpty) {
      return _customTrendingBaseUrl!;
    }
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    const envTrendingUrl = String.fromEnvironment('TRENDING_API_BASE_URL');
    if (envTrendingUrl.isNotEmpty) return envTrendingUrl;

    const useGateway = bool.fromEnvironment('USE_GATEWAY', defaultValue: false);
    if (useGateway) return gatewayBaseUrl;

    if (kIsWeb) return 'http://localhost:$trendingPort/api/v1';

    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:$trendingPort/api/v1';
    } catch (_) {}

    return 'http://localhost:$trendingPort/api/v1';
  }

  /// Determines the transcoder-service base URL (Port 8082 by default or unified gateway)
  static String get transcoderBaseUrl {
    if (_customTranscoderBaseUrl != null && _customTranscoderBaseUrl!.isNotEmpty) {
      return _customTranscoderBaseUrl!;
    }
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!;
    }

    const envTranscoderUrl = String.fromEnvironment('TRANSCODER_API_BASE_URL');
    if (envTranscoderUrl.isNotEmpty) return envTranscoderUrl;

    const useGateway = bool.fromEnvironment('USE_GATEWAY', defaultValue: false);
    if (useGateway) return gatewayBaseUrl;

    if (kIsWeb) return 'http://localhost:$transcoderPort/api/v1';

    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:$transcoderPort/api/v1';
    } catch (_) {}

    return 'http://localhost:$transcoderPort/api/v1';
  }

  /// Default base URL for unified/backward compatibility
  static String get baseUrl => catalogBaseUrl;

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

  static const String batchMediaPath = '/media/batch';

  static const String progressPath = '/user/progress';
  static String reviewsPath(String mediaId) => '/media/$mediaId/reviews';
  static const String settingsPath = '/user/settings';

  // Device & Auth Security paths
  static const String loginPath = '/auth/login';
  static const String demoLoginPath = '/auth/demo-login';
  static const String registerPath = '/auth/register';
  static const String refreshPath = '/auth/refresh';
  static const String mePath = '/auth/me';
  static const String profilePath = '/auth/profile';
  static const String changePasswordPath = '/auth/change-password';
  static const String forgotPasswordPath = '/auth/forgot-password';
  static const String resetPasswordPath = '/auth/reset-password';
  static const String verifyEmailPath = '/auth/verify-email';
  static const String resendVerificationPath = '/auth/resend-verification';
  static const String logoutPath = '/auth/logout';
  static const String logoutAllPath = '/auth/logout-all';
  static String revokeDevicePath(String deviceId) => '/auth/devices/$deviceId';
  static String deviceRevokePath(String deviceId) => revokeDevicePath(deviceId);
  static String deviceCheckPath(String email) => '/auth/device-check?email=${Uri.encodeComponent(email)}';


  // Offline Downloads & Cloudflare R2 paths
  static const String downloadRequestPath = '/downloads/request';
  static const String downloadRenewLicensePath = '/downloads/renew-license';
  static String downloadDeletePath(String downloadId) => '/downloads/$downloadId';
  static const String downloadSyncPath = '/downloads/sync';

  // Trending paths (trending-service)
  static const String trendingPath = '/trending';
  static const String trendingInteractPath = '/trending/interact';

  // Transcoder & Adaptive Streaming paths (transcoder-service)
  static String transcoderStreamPath(String mediaId, {String playlist = 'master.m3u8'}) =>
      '/transcoder/stream/$mediaId/$playlist';
  static String transcoderStatusPath(String jobId) => '/transcoder/status/$jobId';
}

