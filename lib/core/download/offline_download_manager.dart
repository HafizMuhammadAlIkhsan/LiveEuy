import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import '../../models/download_item.dart';
import '../../models/episode_model.dart';
import '../../models/movie_model.dart';
import '../network/api_provider.dart';
import '../network/api_service.dart';
import '../storage/offline_storage_service.dart';

/// State list unduhan offline untuk Riverpod
class OfflineDownloadState {
  final List<DownloadItem> downloads;
  final bool isLoading;
  final String? errorMessage;

  const OfflineDownloadState({
    this.downloads = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  OfflineDownloadState copyWith({
    List<DownloadItem>? downloads,
    bool? isLoading,
    String? errorMessage,
  }) {
    return OfflineDownloadState(
      downloads: downloads ?? this.downloads,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

/// Pengelola proses unduh video offline mirip YouTube Offline.
/// - Menyimpan file di folder dokumen aplikasi yang terlindungi (app-private sandbox).
/// - Menggunakan Hive untuk persistensi status & metadata.
/// - Memvalidasi dan memperbarui lisensi offline (default 30 hari).
class OfflineDownloadManager extends StateNotifier<OfflineDownloadState> {
  final OfflineStorageService _storageService;
  final ApiService _apiService;
  final http.Client _httpClient;

  // Active download tasks to support pause/cancel
  final Map<String, StreamSubscription<List<int>>> _activeSubscriptions = {};
  final Map<String, IOSink> _activeSinks = {};

  OfflineDownloadManager({
    required OfflineStorageService storageService,
    required ApiService apiService,
    http.Client? httpClient,
  })  : _storageService = storageService,
        _apiService = apiService,
        _httpClient = httpClient ?? http.Client(),
        super(const OfflineDownloadState(isLoading: true)) {
    _init();
  }

  Future<void> _init() async {
    await _storageService.init();
    _refreshDownloads();
  }

  void _refreshDownloads() {
    final list = _storageService.getAllDownloads();
    state = state.copyWith(downloads: list, isLoading: false);
  }

  /// Cek apakah suatu media/episode sudah terunduh
  bool isDownloaded(String id) {
    return _storageService.isDownloaded(id);
  }

  /// Dapatkan item unduhan berdasarkan ID
  DownloadItem? getDownload(String id) {
    return _storageService.getDownload(id);
  }

  /// Dapatkan direktori penyimpanan privat aplikasi
  Future<String> _getAppStorageDirectory() async {
    try {
      final docDir = await getApplicationDocumentsDirectory();
      final offlineDir = Directory('${docDir.path}/liveeuy_offline');
      if (!await offlineDir.exists()) {
        await offlineDir.create(recursive: true);
      }
      return offlineDir.path;
    } catch (_) {
      // Fallback untuk test environment
      final tempDir = Directory.systemTemp.createTempSync('liveeuy_offline_');
      return tempDir.path;
    }
  }

  /// Mulai mengunduh film atau episode serial
  Future<void> startDownload({
    required Movie movie,
    Episode? episode,
    String quality = '1080p',
    String? sourceUrl,
  }) async {
    final isSeries = episode != null;
    final downloadKey = isSeries ? '${movie.id}_${episode.id}' : movie.id;
    final title = isSeries ? '${movie.title} - S${episode.seasonNumber}E${episode.episodeNumber}' : movie.title;
    final episodeTitle = episode?.title;
    final thumbnailUrl = episode?.thumbnailUrl ?? movie.backdropUrl;
    final fallbackUrl = sourceUrl ?? (episode?.videoUrl ?? movie.videoUrl);

    // Siapkan path file lokal
    final storageDir = await _getAppStorageDirectory();
    final localFilePath = '$storageDir/$downloadKey.mp4';

    // 1. Catat status awal di Hive
    final initialItem = DownloadItem(
      id: downloadKey,
      movieId: movie.id,
      episodeId: episode?.id,
      title: title,
      episodeTitle: episodeTitle,
      thumbnailUrl: thumbnailUrl,
      localFilePath: localFilePath,
      fileSizeBytes: 0,
      downloadedBytes: 0,
      quality: quality,
      status: DownloadStatus.downloading,
      progress: 0.0,
      downloadedAt: DateTime.now(),
      expiresAt: DateTime.now().add(const Duration(days: 30)),
    );

    await _storageService.saveDownload(initialItem);
    _refreshDownloads();

    // 2. Request izin unduh & Presigned URL Cloudflare R2 ke Backend API
    String downloadUrl = fallbackUrl;
    String? licenseToken;
    String? downloadId;
    int expectedFileSize = 0;

    try {
      final apiData = await _apiService.requestDownload(
        mediaId: movie.id,
        episodeId: episode?.id,
        quality: quality,
      );

      if (apiData != null) {
        if (apiData['presignedUrl'] != null) {
          downloadUrl = apiData['presignedUrl'] as String;
        }
        if (apiData['fileSizeBytes'] != null) {
          expectedFileSize = (apiData['fileSizeBytes'] as num).toInt();
        }
        if (apiData['downloadId'] != null) {
          downloadId = apiData['downloadId'] as String;
        }
        final licenseObj = apiData['license'];
        if (licenseObj is Map<String, dynamic>) {
          licenseToken = licenseObj['licenseToken'] as String?;
        }
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[DownloadManager] Backend request error, fallback ke direct URL: $e');
      }
    }

    // 3. Jalankan HTTP Chunk Streaming
    _executeDownloadStream(
      id: downloadKey,
      url: downloadUrl,
      localPath: localFilePath,
      expectedFileSize: expectedFileSize,
      licenseToken: licenseToken,
      downloadId: downloadId,
    );
  }

  Future<void> _executeDownloadStream({
    required String id,
    required String url,
    required String localPath,
    required int expectedFileSize,
    String? licenseToken,
    String? downloadId,
  }) async {
    final file = File(localPath);
    IOSink? sink;

    try {
      final uri = Uri.parse(url);
      final request = http.Request('GET', uri);
      final response = await _httpClient.send(request);

      if (response.statusCode >= 400) {
        throw HttpException('HTTP download status ${response.statusCode}');
      }

      final totalBytes = response.contentLength ?? expectedFileSize;
      sink = file.openWrite();
      _activeSinks[id] = sink;

      int downloaded = 0;
      DateTime lastUpdate = DateTime.now();

      final subscription = response.stream.listen(
        (chunk) {
          sink?.add(chunk);
          downloaded += chunk.length;

          // Throttle pembaruan Hive agar performa tetap maksimal
          final now = DateTime.now();
          if (now.difference(lastUpdate).inMilliseconds >= 400 || downloaded == totalBytes) {
            lastUpdate = now;
            final progress = totalBytes > 0 ? (downloaded / totalBytes).clamp(0.0, 1.0) : 0.0;
            _storageService.updateProgress(
              id: id,
              progress: progress,
              downloadedBytes: downloaded,
              status: DownloadStatus.downloading,
            );
            _refreshDownloads();
          }
        },
        onError: (err) async {
          await _cleanupActiveDownload(id);
          final current = _storageService.getDownload(id);
          if (current != null) {
            await _storageService.saveDownload(
              current.copyWith(
                status: DownloadStatus.failed,
                failureReason: err.toString(),
              ),
            );
          }
          _refreshDownloads();
        },
        onDone: () async {
          await sink?.flush();
          await sink?.close();
          _activeSinks.remove(id);
          _activeSubscriptions.remove(id);

          final current = _storageService.getDownload(id);
          if (current != null) {
            final completedItem = current.copyWith(
              status: DownloadStatus.completed,
              progress: 1.0,
              fileSizeBytes: downloaded > 0 ? downloaded : current.fileSizeBytes,
              downloadedBytes: downloaded > 0 ? downloaded : current.fileSizeBytes,
              downloadedAt: DateTime.now(),
              expiresAt: DateTime.now().add(const Duration(days: 30)),
              licenseToken: licenseToken ?? current.licenseToken,
              downloadId: downloadId ?? current.downloadId,
            );
            await _storageService.saveDownload(completedItem);
          }
          _refreshDownloads();
        },
        cancelOnError: true,
      );

      _activeSubscriptions[id] = subscription;
    } catch (e) {
      await sink?.close();
      _activeSinks.remove(id);
      _activeSubscriptions.remove(id);

      final current = _storageService.getDownload(id);
      if (current != null) {
        await _storageService.saveDownload(
          current.copyWith(
            status: DownloadStatus.failed,
            failureReason: e.toString(),
          ),
        );
      }
      _refreshDownloads();
    }
  }

  /// Batalkan proses unduhan dan hapus file sementara
  Future<void> cancelDownload(String id) async {
    await _cleanupActiveDownload(id);
    await _storageService.deleteDownload(id);
    _refreshDownloads();
  }

  /// Hapus video yang sudah terunduh
  Future<void> deleteDownload(String id) async {
    await _cleanupActiveDownload(id);
    final item = _storageService.getDownload(id);
    if (item?.downloadId != null) {
      // Beritahu backend untuk membebaskan kuota perangkat
      _apiService.notifyDownloadDeleted(item!.downloadId!);
    }
    await _storageService.deleteDownload(id);
    _refreshDownloads();
  }

  /// Perpanjang lisensi offline video (YouTube-style 30 days renewal)
  Future<bool> renewLicense(String id) async {
    final item = _storageService.getDownload(id);
    if (item == null) return false;

    try {
      final res = await _apiService.renewDownloadLicense(
        downloadId: item.downloadId ?? 'dl_$id',
        mediaId: item.movieId,
        episodeId: item.episodeId,
        currentLicenseToken: item.licenseToken ?? 'mock_token',
      );

      DateTime newExpires = DateTime.now().add(const Duration(days: 30));
      String newToken = item.licenseToken ?? 'renewed_license_${DateTime.now().millisecondsSinceEpoch}';

      if (res != null) {
        if (res['licenseToken'] != null) {
          newToken = res['licenseToken'] as String;
        }
        if (res['expiresAt'] != null) {
          final parsed = DateTime.tryParse(res['expiresAt'] as String);
          if (parsed != null) newExpires = parsed;
        }
      }

      await _storageService.updateLicense(
        id: id,
        licenseToken: newToken,
        expiresAt: newExpires,
      );
      _refreshDownloads();
      return true;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[DownloadManager] Gagal perpanjang lisensi: $e');
      }
      return false;
    }
  }

  Future<void> _cleanupActiveDownload(String id) async {
    final sub = _activeSubscriptions.remove(id);
    await sub?.cancel();

    final sink = _activeSinks.remove(id);
    try {
      await sink?.close();
    } catch (_) {}
  }

  @override
  void dispose() {
    for (final sub in _activeSubscriptions.values) {
      sub.cancel();
    }
    for (final sink in _activeSinks.values) {
      sink.close();
    }
    super.dispose();
  }
}

/// Provider utama pengelola unduhan offline
final offlineDownloadManagerProvider =
    StateNotifierProvider<OfflineDownloadManager, OfflineDownloadState>((ref) {
  final storageService = ref.watch(offlineStorageServiceProvider);
  final apiService = ref.watch(apiServiceProvider);
  return OfflineDownloadManager(
    storageService: storageService,
    apiService: apiService,
  );
});

/// Provider daftar unduhan reaktif
final offlineDownloadsListProvider = Provider<List<DownloadItem>>((ref) {
  return ref.watch(offlineDownloadManagerProvider).downloads;
});
