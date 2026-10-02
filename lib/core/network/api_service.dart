import 'api_client.dart';
import '../../models/auth_response_model.dart';
import '../../models/movie_model.dart';
import '../../models/review_model.dart';
import '../../models/watch_progress_model.dart';
import '../../models/user_settings_model.dart';

class ApiService {
  final ApiClient _client;
  final ApiClient _authClient;
  final ApiClient _catalogClient;
  final ApiClient _trendingClient;
  final ApiClient _transcoderClient;

  ApiService({
    ApiClient? client,
    ApiClient? authClient,
    ApiClient? catalogClient,
    ApiClient? trendingClient,
    ApiClient? transcoderClient,
  })  : _client = client ?? ApiClient(),
        _authClient = authClient ?? client ?? ApiClient(baseUrl: ApiConfig.authBaseUrl),
        _catalogClient = catalogClient ?? client ?? ApiClient(baseUrl: ApiConfig.catalogBaseUrl),
        _trendingClient = trendingClient ?? client ?? ApiClient(baseUrl: ApiConfig.trendingBaseUrl),
        _transcoderClient = transcoderClient ?? client ?? ApiClient(baseUrl: ApiConfig.transcoderBaseUrl);

  ApiClient get client => _client;
  ApiClient get authClient => _authClient;
  ApiClient get catalogClient => _catalogClient;
  ApiClient get trendingClient => _trendingClient;
  ApiClient get transcoderClient => _transcoderClient;

  // ==========================================
  // 1. Katalog Media & Konten
  // ==========================================

  /// Mengambil semua daftar media film dan serial (`GET /api/v1/media`)
  /// Mendukung filter tipe, genre, search, pagination, dan cancel token dari backend Spring Boot
  Future<List<Movie>> getAllMedia({
    String? type,
    String? genre,
    String? search,
    String? sortBy,
    int? page,
    int? size,
    CancelToken? cancelToken,
  }) async {
    final queryParams = <String, dynamic>{};
    if (type != null && type.isNotEmpty && type != 'Semua') queryParams['type'] = type;
    if (genre != null && genre.isNotEmpty) queryParams['genre'] = genre;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (sortBy != null && sortBy.isNotEmpty) queryParams['sortBy'] = sortBy;
    if (page != null) queryParams['page'] = page;
    if (size != null) queryParams['size'] = size;

    final response = await _catalogClient.get<List<Movie>>(
      ApiConfig.mediaPath,
      queryParams: queryParams.isNotEmpty ? queryParams : null,
      cancelToken: cancelToken,
      fromJson: (data) {
        final list = data is List
            ? data
            : (data is Map && data['content'] is List ? data['content'] as List : []);
        return list
            .map((item) => Movie.fromJson(item as Map<String, dynamic>))
            .toList();
      },
    );
    return response.data ?? [];
  }

  /// Mengambil daftar media secara batch berdasarkan daftar ID (`POST /api/v1/media/batch`)
  Future<List<Movie>> getMediaBatch(List<String> ids) async {
    if (ids.isEmpty) return [];
    final response = await _catalogClient.post<List<Movie>>(
      ApiConfig.batchMediaPath,
      body: ids,
      fromJson: (data) {
        if (data is List) {
          return data.map((item) => Movie.fromJson(item as Map<String, dynamic>)).toList();
        }
        return [];
      },
    );
    return response.data ?? [];
  }

  /// Mengambil detail media berdasarkan ID lengkap dengan musim dan episode (`GET /api/v1/media/{id}`)
  Future<Movie?> getMediaById(String id) async {
    final response = await _catalogClient.get<Movie>(
      ApiConfig.mediaDetailPath(id),
      fromJson: (data) => Movie.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  /// Mengambil daftar tayangan Top 10 Indonesia (`GET /api/v1/media/top10`)
  Future<List<Movie>> getTop10Media() async {
    final response = await _catalogClient.get<List<Movie>>(
      ApiConfig.top10Path,
      fromJson: (data) => (data as List<dynamic>)
          .map((item) => Movie.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
    return response.data ?? [];
  }

  // ==========================================
  // Trending & Recommendation (Go Fiber :3000)
  // ==========================================

  /// Mengambil daftar media trending secara real-time (`GET /api/v1/trending`)
  Future<List<Movie>> getTrendingMedia({int limit = 10}) async {
    try {
      final response = await _trendingClient.get<List<Movie>>(
        ApiConfig.trendingPath,
        queryParams: {'limit': limit},
        fromJson: (data) {
          final list = data is List
              ? data
              : (data is Map && data['data'] is List ? data['data'] as List : []);
          return list
              .map((item) => Movie.fromJson(item as Map<String, dynamic>))
              .toList();
        },
      );
      return response.data ?? [];
    } catch (_) {
      return [];
    }
  }

  /// Mengirim interaksi media ke Redis ZSET trending (`POST /api/v1/trending/interact`)
  /// [interactionType] dapat bernilai: 'view' | 'click' | 'play' | 'watchlist'
  Future<bool> recordTrendingInteraction({
    required String mediaId,
    required String interactionType,
    double? score,
  }) async {
    try {
      final response = await _trendingClient.post<Map<String, dynamic>>(
        ApiConfig.trendingInteractPath,
        body: {
          'mediaId': mediaId,
          'interactionType': interactionType,
          if (score != null) 'score': score,
        },
      );
      return response.isSuccess;
    } catch (_) {
      return false;
    }
  }

  // ==========================================
  // Transcoder & Adaptive Streaming (Go Gin :8082)
  // ==========================================

  /// Mengambil URL HLS master playlist untuk streaming adaptif
  String getHlsStreamUrl(String mediaId, {String playlist = 'master.m3u8'}) {
    return '${ApiConfig.transcoderBaseUrl}${ApiConfig.transcoderStreamPath(mediaId, playlist: playlist)}';
  }

  /// Mengecek status transcode video (`GET /api/v1/transcoder/status/:jobId`)
  Future<Map<String, dynamic>?> getTranscodeStatus(String jobId) async {
    try {
      final response = await _transcoderClient.get<Map<String, dynamic>>(
        ApiConfig.transcoderStatusPath(jobId),
      );
      return response.data;
    } catch (_) {
      return null;
    }
  }

  // ==========================================
  // 2. Koleksi Tontonan Pengguna (Watchlist)
  // ==========================================

  /// Mengambil daftar media yang disimpan dalam koleksi pengguna (`GET /api/v1/user/watchlist`)
  Future<List<Movie>> getWatchlist({
    String userId = ApiConfig.defaultUserId,
  }) async {
    final response = await _client.get<List<Movie>>(
      ApiConfig.watchlistPath,
      queryParams: {'userId': userId},
      fromJson: (data) => (data as List<dynamic>)
          .map((item) => Movie.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
    return response.data ?? [];
  }

  /// Mengambil himpunan ID media yang ada di watchlist pengguna (`GET /api/v1/user/watchlist/ids`)
  Future<Set<String>> getWatchlistIds({
    String userId = ApiConfig.defaultUserId,
  }) async {
    final response = await _client.get<Set<String>>(
      ApiConfig.watchlistIdsPath,
      queryParams: {'userId': userId},
      fromJson: (data) =>
          (data as List<dynamic>).map((item) => item.toString()).toSet(),
    );
    return response.data ?? {};
  }

  /// Toggle simpan / hapus media dari watchlist (`POST /api/v1/user/watchlist/{mediaId}`)
  /// Mengembalikan status terkini apakah media sekarang ada di watchlist (`true` atau `false`)
  Future<bool> toggleWatchlist(
    String mediaId, {
    String userId = ApiConfig.defaultUserId,
  }) async {
    final response = await _client.post<bool>(
      ApiConfig.watchlistTogglePath(mediaId),
      queryParams: {'userId': userId},
      fromJson: (data) {
        if (data is Map<String, dynamic>) {
          return data['inWatchlist'] as bool? ?? false;
        }
        return false;
      },
    );
    return response.data ?? false;
  }

  /// Menghapus banyak media dari watchlist sekaligus (`POST /api/v1/user/watchlist/batch-delete`)
  Future<bool> removeWatchlistBatch(
    List<String> mediaIds, {
    String userId = ApiConfig.defaultUserId,
  }) async {
    if (mediaIds.isEmpty) return true;
    final response = await _client.post<bool>(
      ApiConfig.watchlistBatchDeletePath,
      queryParams: {'userId': userId},
      body: {'mediaIds': mediaIds},
      fromJson: (data) {
        if (data is Map<String, dynamic>) {
          return data['success'] as bool? ?? true;
        }
        return true;
      },
    );
    return response.data ?? false;
  }

  // ==========================================
  // 3. Riwayat Tontonan & Progres
  // ==========================================

  /// Mengambil riwayat progres tontonan pengguna (`GET /api/v1/user/progress`)
  Future<List<WatchProgress>> getWatchProgress({
    String userId = ApiConfig.defaultUserId,
  }) async {
    final response = await _client.get<List<WatchProgress>>(
      ApiConfig.progressPath,
      queryParams: {'userId': userId},
      fromJson: (data) => (data as List<dynamic>)
          .map((item) => WatchProgress.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
    return response.data ?? [];
  }

  /// Sinkronisasi durasi dan posisi tontonan (UPSERT) (`POST /api/v1/user/progress`)
  Future<WatchProgress?> syncWatchProgress({
    required String mediaId,
    required double progress,
    String? lastEpisodeId,
    String userId = ApiConfig.defaultUserId,
  }) async {
    final body = <String, dynamic>{
      'mediaId': mediaId,
      'progress': progress,
    };
    if (lastEpisodeId != null) {
      body['lastEpisodeId'] = lastEpisodeId;
    }

    final response = await _client.post<WatchProgress>(
      ApiConfig.progressPath,
      queryParams: {'userId': userId},
      body: body,
      fromJson: (data) =>
          WatchProgress.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  // ==========================================
  // 4. Ulasan Penonton (Reviews)
  // ==========================================

  /// Mengambil daftar ulasan tayangan berdasarkan ID media (`GET /api/v1/media/{mediaId}/reviews`)
  Future<List<Review>> getReviews(String mediaId) async {
    final response = await _client.get<List<Review>>(
      ApiConfig.reviewsPath(mediaId),
      fromJson: (data) => (data as List<dynamic>)
          .map((item) => Review.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
    return response.data ?? [];
  }

  /// Mengirim ulasan baru untuk tayangan (`POST /api/v1/media/{mediaId}/reviews`)
  Future<Review?> addReview({
    required String mediaId,
    required double rating,
    required String comment,
    required String userName,
  }) async {
    final response = await _client.post<Review>(
      ApiConfig.reviewsPath(mediaId),
      body: {
        'rating': rating,
        'comment': comment,
        'userName': userName,
      },
      fromJson: (data) => Review.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  // ==========================================
  // 5. Pengaturan & Preferensi Pengguna
  // ==========================================

  /// Mengambil preferensi pengguna (`GET /api/v1/user/settings`)
  Future<UserSettings> getUserSettings({
    String userId = ApiConfig.defaultUserId,
  }) async {
    final response = await _client.get<UserSettings>(
      ApiConfig.settingsPath,
      queryParams: {'userId': userId},
      fromJson: (data) => UserSettings.fromJson(data as Map<String, dynamic>),
    );
    return response.data ?? const UserSettings();
  }

  /// Memperbarui preferensi pengguna (`PUT /api/v1/user/settings`)
  Future<UserSettings> updateUserSettings(
    UserSettings settings, {
    String userId = ApiConfig.defaultUserId,
  }) async {
    final response = await _client.put<UserSettings>(
      ApiConfig.settingsPath,
      queryParams: {'userId': userId},
      body: settings.toJson(),
      fromJson: (data) => UserSettings.fromJson(data as Map<String, dynamic>),
    );
    return response.data ?? settings;
  }

  // ==========================================
  // 6. Autentikasi Pengguna & Keamanan Sesi
  // ==========================================

  /// Melakukan login pengguna ke sistem (`POST /api/v1/auth/login`)
  Future<AuthData?> login({
    required String email,
    required String password,
    bool rememberMe = true,
  }) async {
    final response = await _authClient.post<AuthData>(
      ApiConfig.loginPath,
      body: {
        'email': email,
        'password': password,
        'rememberMe': rememberMe,
      },
      fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  /// Demo Login cepat menggunakan persona ('free', 'standard', 'ultra') (`POST /api/v1/auth/demo-login`)
  Future<AuthData?> demoLogin(String persona) async {
    final response = await _authClient.post<AuthData>(
      ApiConfig.demoLoginPath,
      body: {'persona': persona},
      fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  /// Mendaftarkan pengguna baru (`POST /api/v1/auth/register`)
  Future<AuthData?> register({
    required String name,
    required String email,
    required String password,
    String tier = 'VIP Standard',
  }) async {
    final response = await _authClient.post<AuthData>(
      ApiConfig.registerPath,
      body: {
        'name': name,
        'email': email,
        'password': password,
        'tier': tier,
      },
      fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  /// Memperbarui token akses dengan refresh token rotasi (`POST /api/v1/auth/refresh`)
  Future<AuthData?> refreshToken(String refreshToken) async {
    final response = await _authClient.post<AuthData>(
      ApiConfig.refreshPath,
      body: {'refreshToken': refreshToken},
      fromJson: (data) => AuthData.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  /// Mengambil data profil pengguna yang sedang login (`GET /api/v1/auth/me`)
  Future<UserData?> getCurrentUser({String? accessToken}) async {
    final headers = <String, String>{};
    if (accessToken != null && accessToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $accessToken';
    }
    final response = await _authClient.get<UserData>(
      ApiConfig.mePath,
      headers: headers.isNotEmpty ? headers : null,
      fromJson: (data) => UserData.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  /// Memperbarui nama dan profil pengguna (`PUT /api/v1/auth/profile`)
  Future<bool> updateProfile(String name, {String? avatar, String? accessToken}) async {
    final headers = <String, String>{};
    if (accessToken != null && accessToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $accessToken';
    }
    final response = await _authClient.put<dynamic>(
      ApiConfig.profilePath,
      headers: headers.isNotEmpty ? headers : null,
      body: {
        'name': name,
        'avatar': ?avatar,
      },
    );
    return response.success;
  }

  /// Mengganti kata sandi pengguna (`PUT /api/v1/auth/change-password`)
  Future<bool> changePassword({
    required String oldPassword,
    required String newPassword,
    String? accessToken,
  }) async {
    final headers = <String, String>{};
    if (accessToken != null && accessToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $accessToken';
    }
    final response = await _authClient.put<dynamic>(
      ApiConfig.changePasswordPath,
      headers: headers.isNotEmpty ? headers : null,
      body: {
        'currentPassword': oldPassword,
        'oldPassword': oldPassword,
        'newPassword': newPassword,
      },
    );
    return response.success;
  }

  /// Mengirim permintaan reset kata sandi melalui email (`POST /api/v1/auth/forgot-password`)
  Future<ApiResponse<dynamic>> forgotPassword(String email) async {
    return await _authClient.post<dynamic>(
      ApiConfig.forgotPasswordPath,
      body: {'email': email},
    );
  }

  /// Mereset kata sandi menggunakan token yang diterima (`POST /api/v1/auth/reset-password`)
  Future<ApiResponse<dynamic>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    return await _authClient.post<dynamic>(
      ApiConfig.resetPasswordPath,
      body: {
        'token': token,
        'newPassword': newPassword,
      },
    );
  }

  /// Memverifikasi PIN pendaftaran email pengguna (`POST /api/v1/auth/verify-email`)
  Future<ApiResponse<dynamic>> verifyEmailPin({
    required String email,
    required String pin,
  }) async {
    return await _authClient.post<dynamic>(
      ApiConfig.verifyEmailPath,
      body: {
        'email': email.trim(),
        'pin': pin.trim(),
        'code': pin.trim(),
      },
    );
  }

  /// Mengirim ulang kode PIN verifikasi registrasi ke email (`POST /api/v1/auth/resend-verification`)
  Future<ApiResponse<dynamic>> resendVerificationPin(String email) async {
    return await _authClient.post<dynamic>(
      ApiConfig.resendVerificationPath,
      body: {'email': email.trim()},
    );
  }

  /// Mengakhiri sesi login pengguna saat ini (`POST /api/v1/auth/logout`)
  Future<bool> logout({String? accessToken}) async {
    final headers = <String, String>{};
    if (accessToken != null && accessToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $accessToken';
    }
    final response = await _authClient.post<dynamic>(
      ApiConfig.logoutPath,
      headers: headers.isNotEmpty ? headers : null,
    );
    return response.success;
  }

  // ==========================================
  // 6. Unduhan Offline & Cloudflare R2
  // ==========================================

  /// Meminta izin unduhan dan mendapatkan Presigned URL Cloudflare R2 (`POST /api/v1/downloads/request`)
  Future<Map<String, dynamic>?> requestDownload({
    required String mediaId,
    String? episodeId,
    String quality = '1080p',
    String? deviceId,
  }) async {
    try {
      final response = await _client.post<Map<String, dynamic>>(
        ApiConfig.downloadRequestPath,
        body: {
          'mediaId': mediaId,
          if (episodeId != null) 'episodeId': episodeId,
          'quality': quality,
          if (deviceId != null) 'deviceId': deviceId,
        },
        fromJson: (data) => data is Map<String, dynamic> ? data : {},
      );
      return response.data;
    } catch (_) {
      return null;
    }
  }

  /// Memperbarui lisensi tontonan offline tanpa mengunduh ulang file video (`POST /api/v1/downloads/renew-license`)
  Future<Map<String, dynamic>?> renewDownloadLicense({
    required String downloadId,
    required String mediaId,
    String? episodeId,
    required String currentLicenseToken,
    String? deviceId,
  }) async {
    try {
      final response = await _client.post<Map<String, dynamic>>(
        ApiConfig.downloadRenewLicensePath,
        body: {
          'downloadId': downloadId,
          'mediaId': mediaId,
          if (episodeId != null) 'episodeId': episodeId,
          'currentLicenseToken': currentLicenseToken,
          if (deviceId != null) 'deviceId': deviceId,
        },
        fromJson: (data) => data is Map<String, dynamic> ? data : {},
      );
      return response.data;
    } catch (_) {
      return null;
    }
  }

  /// Menghapus sesi unduhan dari server untuk membebaskan kuota perangkat (`DELETE /api/v1/downloads/{id}`)
  Future<bool> notifyDownloadDeleted(String downloadId) async {
    try {
      final response = await _client.delete<dynamic>(
        ApiConfig.downloadDeletePath(downloadId),
      );
      return response.success;
    } catch (_) {
      return false;
    }
  }

  /// Sinkronisasi metrik/durasi tontonan offline saat online kembali (`POST /api/v1/downloads/sync`)
  Future<bool> syncOfflineSessions(List<Map<String, dynamic>> sessions) async {
    try {
      final response = await _client.post<dynamic>(
        ApiConfig.downloadSyncPath,
        body: {'sessions': sessions},
      );
      return response.success;
    } catch (_) {
      return false;
    }
  }
}


