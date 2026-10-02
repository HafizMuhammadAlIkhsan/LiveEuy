import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../models/download_item.dart';

/// Service penyimpanan database lokal Hive untuk fitur unduhan offline.
/// Mengelola metadata video, path file fisik di app sandbox, status download,
/// serta tanggal kedaluwarsa lisensi offline (offline expiry 30 hari).
class OfflineStorageService {
  static const String boxName = 'liveeuy_offline_downloads';
  Box<Map>? _box;

  OfflineStorageService({Box<Map>? box}) : _box = box;

  /// Inisialisasi Box Hive
  Future<void> init() async {
    if (_box != null && _box!.isOpen) return;
    try {
      try {
        final tempDir = Directory.systemTemp.createTempSync('liveeuy_offline_hive');
        Hive.init(tempDir.path);
      } catch (_) {}
      _box = await Hive.openBox<Map>(boxName);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[OfflineStorageService] Error opening Hive box: $e');
      }
    }
  }

  Box<Map> get _safeBox {
    final b = _box;
    if (b == null || !b.isOpen) {
      throw StateError(
        'Hive box "$boxName" belum diinisialisasi. Panggil init() terlebih dahulu.',
      );
    }
    return b;
  }

  /// Simpan atau perbarui item unduhan di Hive
  Future<void> saveDownload(DownloadItem item) async {
    await _safeBox.put(item.id, item.toJson());
  }

  /// Ambil data unduhan berdasarkan ID (movieId atau movieId_episodeId)
  DownloadItem? getDownload(String id) {
    if (_box == null || !_box!.isOpen) return null;
    final raw = _box!.get(id);
    if (raw == null) return null;
    try {
      return DownloadItem.fromJson(Map<dynamic, dynamic>.from(raw));
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[OfflineStorageService] Error parsing item $id: $e');
      }
      return null;
    }
  }

  /// Ambil seluruh daftar unduhan offline
  List<DownloadItem> getAllDownloads() {
    if (_box == null || !_box!.isOpen) return [];
    final items = <DownloadItem>[];
    for (final raw in _box!.values) {
      try {
        final map = Map<dynamic, dynamic>.from(raw);
        items.add(DownloadItem.fromJson(map));
      } catch (_) {}
    }
    // Urutkan berdasarkan waktu unduh terbaru
    items.sort((a, b) => b.downloadedAt.compareTo(a.downloadedAt));
    return items;
  }

  /// Cek apakah konten sudah selesai diunduh dan file lokal masih ada
  bool isDownloaded(String id) {
    final item = getDownload(id);
    if (item == null || item.status != DownloadStatus.completed) return false;
    final file = File(item.localFilePath);
    return file.existsSync();
  }

  /// Perbarui progres unduhan realtime
  Future<void> updateProgress({
    required String id,
    required double progress,
    required int downloadedBytes,
    DownloadStatus status = DownloadStatus.downloading,
  }) async {
    final existing = getDownload(id);
    if (existing == null) return;
    final updated = existing.copyWith(
      progress: progress,
      downloadedBytes: downloadedBytes,
      status: status,
    );
    await saveDownload(updated);
  }

  /// Perbarui lisensi offline (setelah berhasil request renew ke backend)
  Future<void> updateLicense({
    required String id,
    required String licenseToken,
    required DateTime expiresAt,
  }) async {
    final existing = getDownload(id);
    if (existing == null) return;
    final updated = existing.copyWith(
      licenseToken: licenseToken,
      expiresAt: expiresAt,
      status: DownloadStatus.completed,
    );
    await saveDownload(updated);
  }

  /// Hapus unduhan dari database dan hapus file fisik di disk
  Future<void> deleteDownload(String id) async {
    final existing = getDownload(id);
    if (existing != null) {
      try {
        final file = File(existing.localFilePath);
        if (file.existsSync()) {
          await file.delete();
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('[OfflineStorageService] Error deleting file: $e');
        }
      }
    }
    await _safeBox.delete(id);
  }

  /// Bersihkan seluruh data unduhan
  Future<void> clearAll() async {
    for (final item in getAllDownloads()) {
      try {
        final file = File(item.localFilePath);
        if (file.existsSync()) {
          await file.delete();
        }
      } catch (_) {}
    }
    await _safeBox.clear();
  }

  /// Stream perubahan data untuk reaktivitas Riverpod
  Stream<BoxEvent> watchBox() {
    return _safeBox.watch();
  }
}

