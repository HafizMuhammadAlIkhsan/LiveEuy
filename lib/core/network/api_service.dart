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

  ApiService({
    ApiClient? client,
    ApiClient? authClient,
    ApiClient? catalogClient,
  })  : _client = client ?? ApiClient(),
        _authClient = authClient ?? client ?? ApiClient(baseUrl: ApiConfig.authBaseUrl),
        _catalogClient = catalogClient ?? client ?? ApiClient(baseUrl: ApiConfig.catalogBaseUrl);

  ApiClient get client => _client;
  ApiClient get authClient => _authClient;
  ApiClient get catalogClient => _catalogClient;

  // ==========================================
  // 1. Katalog Media & Konten
  // ==========================================

  /// Mengambil semua daftar media film dan serial (`GET /api/v1/media`)
  /// Mendukung filter tipe, genre, search, dan pagination dari backend Spring Boot
  Future<List<Movie>> getAllMedia({
    String? type,
    String? genre,
    String? search,
    String? sortBy,
    int? page,
    int? size,
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
        'oldPassword': oldPassword,
        'newPassword': newPassword,
      },
    );
    return response.success;
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
}


