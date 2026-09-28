import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/login_screen.dart';
import '../../features/detail/content_detail_screen.dart';
import '../../features/player/video_player_screen.dart';
import '../../models/movie_model.dart';

enum DeepLinkTarget {
  mediaDetail,
  videoPlayer,
  search,
  collection,
  account,
  login,
  home,
  unknown,
}

class ParsedDeepLink {
  final Uri uri;
  final DeepLinkTarget target;
  final String? mediaId;
  final String? searchQuery;
  final Map<String, String> queryParameters;

  const ParsedDeepLink({
    required this.uri,
    required this.target,
    this.mediaId,
    this.searchQuery,
    this.queryParameters = const {},
  });
}

/// Service untuk menangani routing Deep Linking (Custom Scheme & App Links).
/// Mendukung skema:
/// - `liveeuy://media/{id}` atau `https://liveeuy.id/media/{id}` (Detail Konten)
/// - `liveeuy://watch/{id}` atau `https://liveeuy.id/watch/{id}` (Pemutar Video)
/// - `liveeuy://player/{id}`
/// - `liveeuy://search?q={query}` (Pencarian Katalog)
/// - `liveeuy://collection` atau `https://liveeuy.id/collection` (Tab Koleksi)
/// - `liveeuy://account` atau `liveeuy://profile` (Tab Akun)
/// - `liveeuy://login` (Layar Masuk)
class DeepLinkService {
  final GlobalKey<NavigatorState> navigatorKey;
  void Function(int tabIndex)? onNavigateTab;
  void Function(String query)? onSearchQuery;
  Movie? Function(String mediaId)? mediaLookup;

  final _controller = StreamController<ParsedDeepLink>.broadcast();
  Stream<ParsedDeepLink> get onDeepLinkReceived => _controller.stream;

  DeepLinkService({GlobalKey<NavigatorState>? navigatorKey})
      : navigatorKey = navigatorKey ?? GlobalKey<NavigatorState>();

  /// Parse tautan URL mentah menjadi [ParsedDeepLink]
  ParsedDeepLink parse(String urlString) {
    final uri = Uri.parse(urlString.trim());
    final host = uri.host.toLowerCase();
    final pathSegments = uri.pathSegments
        .where((s) => s.isNotEmpty)
        .map((s) => s.toLowerCase())
        .toList();
    final queryParams = uri.queryParameters;

    // 1. Skema Custom `liveeuy://`
    // Contoh: liveeuy://media/m1 atau liveeuy://watch/m_hero atau liveeuy://search?q=cyberpunk
    if (uri.scheme.toLowerCase() == 'liveeuy') {
      if (host == 'media' || host == 'detail') {
        final id = pathSegments.isNotEmpty ? uri.pathSegments.first : queryParams['id'];
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.mediaDetail,
          mediaId: id,
          queryParameters: queryParams,
        );
      }

      if (host == 'watch' || host == 'player') {
        final id = pathSegments.isNotEmpty ? uri.pathSegments.first : queryParams['id'];
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.videoPlayer,
          mediaId: id,
          queryParameters: queryParams,
        );
      }

      if (host == 'search') {
        final q = queryParams['q'] ?? (pathSegments.isNotEmpty ? uri.pathSegments.first : null);
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.search,
          searchQuery: q,
          queryParameters: queryParams,
        );
      }

      if (host == 'collection' || host == 'watchlist') {
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.collection,
          queryParameters: queryParams,
        );
      }

      if (host == 'account' || host == 'profile') {
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.account,
          queryParameters: queryParams,
        );
      }

      if (host == 'login') {
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.login,
          queryParameters: queryParams,
        );
      }

      if (host == 'home') {
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.home,
          queryParameters: queryParams,
        );
      }
    }

    // 2. HTTP/HTTPS App Links (e.g. https://liveeuy.id/media/m1)
    if (uri.scheme == 'http' || uri.scheme == 'https') {
      if (pathSegments.contains('media') || pathSegments.contains('detail')) {
        final idx = pathSegments.contains('media')
            ? pathSegments.indexOf('media')
            : pathSegments.indexOf('detail');
        final id = (idx + 1 < uri.pathSegments.length)
            ? uri.pathSegments[idx + 1]
            : queryParams['id'];
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.mediaDetail,
          mediaId: id,
          queryParameters: queryParams,
        );
      }

      if (pathSegments.contains('watch') || pathSegments.contains('player')) {
        final idx = pathSegments.contains('watch')
            ? pathSegments.indexOf('watch')
            : pathSegments.indexOf('player');
        final id = (idx + 1 < uri.pathSegments.length)
            ? uri.pathSegments[idx + 1]
            : queryParams['id'];
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.videoPlayer,
          mediaId: id,
          queryParameters: queryParams,
        );
      }

      if (pathSegments.contains('search')) {
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.search,
          searchQuery: queryParams['q'],
          queryParameters: queryParams,
        );
      }

      if (pathSegments.contains('collection') || pathSegments.contains('watchlist')) {
        return ParsedDeepLink(
          uri: uri,
          target: DeepLinkTarget.collection,
          queryParameters: queryParams,
        );
      }
    }

    return ParsedDeepLink(
      uri: uri,
      target: DeepLinkTarget.unknown,
      queryParameters: queryParams,
    );
  }

  /// Eksekusi navigasi langsung berdasarkan URL deep link
  bool handleDeepLink(String urlString) {
    if (urlString.isEmpty) return false;
    try {
      final parsed = parse(urlString);
      _controller.add(parsed);
      return navigateTo(parsed);
    } catch (e) {
      debugPrint('[DeepLinkService] Gagal memproses deep link ($urlString): $e');
      return false;
    }
  }

  /// Melakukan transisi halaman sesuai [ParsedDeepLink]
  bool navigateTo(ParsedDeepLink parsed) {
    switch (parsed.target) {
      case DeepLinkTarget.mediaDetail:
        if (parsed.mediaId == null || parsed.mediaId!.isEmpty) return false;
        final movie = mediaLookup?.call(parsed.mediaId!) ?? _createFallbackMovie(parsed.mediaId!);
        navigatorKey.currentState?.push(
          MaterialPageRoute(builder: (_) => ContentDetailScreen(movie: movie)),
        );
        return true;

      case DeepLinkTarget.videoPlayer:
        if (parsed.mediaId == null || parsed.mediaId!.isEmpty) return false;
        final movie = mediaLookup?.call(parsed.mediaId!) ?? _createFallbackMovie(parsed.mediaId!);
        navigatorKey.currentState?.push(
          MaterialPageRoute(builder: (_) => VideoPlayerScreen(movie: movie)),
        );
        return true;

      case DeepLinkTarget.search:
        onNavigateTab?.call(1); // Tab 1 = Cari
        if (parsed.searchQuery != null && parsed.searchQuery!.isNotEmpty) {
          onSearchQuery?.call(parsed.searchQuery!);
        }
        return true;

      case DeepLinkTarget.collection:
        onNavigateTab?.call(2); // Tab 2 = Koleksi
        return true;

      case DeepLinkTarget.account:
        onNavigateTab?.call(3); // Tab 3 = Akun
        return true;

      case DeepLinkTarget.login:
        navigatorKey.currentState?.push(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
        return true;

      case DeepLinkTarget.home:
        onNavigateTab?.call(0); // Tab 0 = Beranda
        return true;

      case DeepLinkTarget.unknown:
        return false;
    }
  }

  Movie _createFallbackMovie(String id) {
    return Movie(
      id: id,
      title: 'Tayangan #$id',
      synopsis: 'Memuat data konten LiveEuy dari tautan...',
      posterUrl:
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
      backdropUrl:
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      matchScore: 95.0,
      ageRating: '13+',
      resolutionBadges: const ['Full HD'],
      genre: 'LiveEuy Stream',
      durationOrSeasons: '1 Jam 45 Min',
      releaseYear: 2024,
      director: 'LiveEuy Studio',
      cast: const ['Pemeran Utama'],
    );
  }

  void dispose() {
    _controller.close();
  }
}

/// Provider singleton DeepLinkService
final deepLinkServiceProvider = Provider<DeepLinkService>((ref) {
  return DeepLinkService();
});
