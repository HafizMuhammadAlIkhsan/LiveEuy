import 'api_client.dart';
import '../../models/movie_model.dart';
import '../../models/review_model.dart';
import '../../models/watch_progress_model.dart';
import '../../models/user_settings_model.dart';

class ApiService {
  final ApiClient _client;

  ApiService({ApiClient? client}) : _client = client ?? ApiClient();

  ApiClient get client => _client;

  // ==========================================
  // 1. Katalog Media & Konten
  // ==========================================

  /// Mengambil semua daftar media film dan serial (`GET /api/v1/media`)
  Future<List<Movie>> getAllMedia() async {
    final response = await _client.get<List<Movie>>(
      ApiConfig.mediaPath,
      fromJson: (data) => (data as List<dynamic>)
          .map((item) => Movie.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
    return response.data ?? [];
  }

  /// Mengambil detail media berdasarkan ID lengkap dengan musim dan episode (`GET /api/v1/media/{id}`)
  Future<Movie?> getMediaById(String id) async {
    final response = await _client.get<Movie>(
      ApiConfig.mediaDetailPath(id),
      fromJson: (data) => Movie.fromJson(data as Map<String, dynamic>),
    );
    return response.data;
  }

  /// Mengambil daftar tayangan Top 10 Indonesia (`GET /api/v1/media/top10`)
  Future<List<Movie>> getTop10Media() async {
    final response = await _client.get<List<Movie>>(
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
}

