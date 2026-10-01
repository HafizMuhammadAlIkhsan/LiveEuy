import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive/hive.dart';
import 'package:liveeuy_mob/core/download/offline_download_manager.dart';
import 'package:liveeuy_mob/core/network/api_service.dart';
import 'package:liveeuy_mob/core/storage/offline_storage_service.dart';
import 'package:liveeuy_mob/models/download_item.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late Directory tempDir;

  setUpAll(() async {
    tempDir = Directory.systemTemp.createTempSync('liveeuy_test_hive_');
    Hive.init(tempDir.path);
  });

  tearDownAll(() async {
    await Hive.close();
    if (tempDir.existsSync()) {
      tempDir.deleteSync(recursive: true);
    }
  });

  group('DownloadItem Model & Expiry Logic', () {
    test('Correctly calculates remainingDays and isExpired for active license', () {
      final now = DateTime.now();
      final item = DownloadItem(
        id: 'movie_1',
        movieId: 'm1',
        title: 'Gadis Kretek',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        localFilePath: '/data/user/0/com.liveeuy.app/files/m1.mp4',
        fileSizeBytes: 450 * 1024 * 1024, // 450 MB
        quality: '1080p',
        status: DownloadStatus.completed,
        downloadedAt: now,
        expiresAt: now.add(const Duration(days: 30)),
      );

      expect(item.isExpired, isFalse);
      expect(item.remainingDays, inInclusiveRange(29, 30));
      expect(item.formattedSize, '450 MB');
      expect(item.isCompleted, isTrue);
    });

    test('Correctly detects expired license (> 30 days without internet)', () {
      final past = DateTime.now().subtract(const Duration(days: 31));
      final expiredItem = DownloadItem(
        id: 'movie_expired',
        movieId: 'm2',
        title: 'The Shadow Strays',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        localFilePath: '/data/user/0/com.liveeuy.app/files/m2.mp4',
        fileSizeBytes: 1200 * 1024 * 1024, // 1.2 GB
        quality: '4K',
        status: DownloadStatus.completed,
        downloadedAt: past.subtract(const Duration(days: 1)),
        expiresAt: past,
      );

      expect(expiredItem.isExpired, isTrue);
      expect(expiredItem.remainingDays, 0);
      expect(expiredItem.formattedSize, '1.2 GB');
      expect(expiredItem.isCompleted, isFalse); // Completed but expired -> should require license renewal
    });

    test('JSON serialization roundtrip maintains data integrity', () {
      final item = DownloadItem(
        id: 'm1_ep1',
        movieId: 'm1',
        episodeId: 'ep1',
        title: 'Gadis Kretek - S1E1',
        episodeTitle: 'Jeng Yah',
        thumbnailUrl: 'https://example.com/ep1.jpg',
        localFilePath: '/storage/offline/m1_ep1.mp4',
        fileSizeBytes: 300 * 1024 * 1024,
        downloadedBytes: 300 * 1024 * 1024,
        quality: '1080p',
        status: DownloadStatus.completed,
        progress: 1.0,
        downloadedAt: DateTime(2026, 10, 1),
        expiresAt: DateTime(2026, 10, 31),
        licenseToken: 'sample_jwt_license_token',
        downloadId: 'dl_99812',
      );

      final json = item.toJson();
      final restored = DownloadItem.fromJson(json);

      expect(restored.id, item.id);
      expect(restored.movieId, item.movieId);
      expect(restored.episodeId, item.episodeId);
      expect(restored.title, item.title);
      expect(restored.episodeTitle, item.episodeTitle);
      expect(restored.licenseToken, 'sample_jwt_license_token');
      expect(restored.downloadId, 'dl_99812');
      expect(restored.quality, '1080p');
    });
  });

  group('OfflineStorageService (Hive)', () {
    late Box<Map> box;
    late OfflineStorageService storageService;

    setUp(() async {
      box = await Hive.openBox<Map>('test_offline_downloads_${DateTime.now().microsecondsSinceEpoch}');
      storageService = OfflineStorageService(box: box);
      await storageService.init();
    });

    tearDown(() async {
      if (box.isOpen) {
        await box.deleteFromDisk();
      }
    });

    test('Can save, retrieve, update progress and delete download items', () async {
      final item = DownloadItem(
        id: 'test_media_1',
        movieId: 'm1',
        title: 'Pengabdi Setan 2',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        localFilePath: '/tmp/test.mp4',
        fileSizeBytes: 500000000,
        quality: '1080p',
        status: DownloadStatus.downloading,
        progress: 0.25,
        downloadedAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(days: 30)),
      );

      await storageService.saveDownload(item);

      final fetched = storageService.getDownload('test_media_1');
      expect(fetched, isNotNull);
      expect(fetched!.title, 'Pengabdi Setan 2');
      expect(fetched.progress, 0.25);

      // Update progress
      await storageService.updateProgress(
        id: 'test_media_1',
        progress: 0.75,
        downloadedBytes: 375000000,
        status: DownloadStatus.downloading,
      );

      final updated = storageService.getDownload('test_media_1');
      expect(updated!.progress, 0.75);
      expect(updated.downloadedBytes, 375000000);

      // Renew license
      final newExpiry = DateTime.now().add(const Duration(days: 60));
      await storageService.updateLicense(
        id: 'test_media_1',
        licenseToken: 'new_token_abc',
        expiresAt: newExpiry,
      );

      final renewed = storageService.getDownload('test_media_1');
      expect(renewed!.licenseToken, 'new_token_abc');
      expect(renewed.status, DownloadStatus.completed);

      // Delete
      await storageService.deleteDownload('test_media_1');
      expect(storageService.getDownload('test_media_1'), isNull);
    });
  });

  group('OfflineDownloadManager', () {
    late Box<Map> box;
    late OfflineStorageService storageService;
    late OfflineDownloadManager downloadManager;

    setUp(() async {
      box = await Hive.openBox<Map>('test_manager_${DateTime.now().microsecondsSinceEpoch}');
      storageService = OfflineStorageService(box: box);
      await storageService.init();

      downloadManager = OfflineDownloadManager(
        storageService: storageService,
        apiService: ApiService(),
      );
    });

    tearDown(() async {
      downloadManager.dispose();
      try {
        if (box.isOpen) {
          await box.close();
        }
      } catch (_) {}
    });

    test('Initializes with empty list and can renew license', () async {
      expect(downloadManager.state.downloads, isEmpty);

      // Seed a downloaded item
      final expiredItem = DownloadItem(
        id: 'dl_seed_1',
        movieId: 'm1',
        title: 'Seeded Movie',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        localFilePath: '/tmp/seeded.mp4',
        fileSizeBytes: 100,
        status: DownloadStatus.completed,
        downloadedAt: DateTime.now().subtract(const Duration(days: 35)),
        expiresAt: DateTime.now().subtract(const Duration(days: 5)),
      );
      await storageService.saveDownload(expiredItem);

      // Renew license
      final renewed = await downloadManager.renewLicense('dl_seed_1');
      expect(renewed, isTrue);

      final itemAfter = storageService.getDownload('dl_seed_1');
      expect(itemAfter!.isExpired, isFalse);
      expect(itemAfter.remainingDays, inInclusiveRange(28, 30));
    });

    test('Can cancel and delete downloads', () async {
      final item = DownloadItem(
        id: 'dl_to_delete',
        movieId: 'm99',
        title: 'To Delete',
        thumbnailUrl: '',
        localFilePath: '/tmp/del.mp4',
        fileSizeBytes: 100,
        status: DownloadStatus.downloading,
        downloadedAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(days: 30)),
      );
      await storageService.saveDownload(item);

      await downloadManager.deleteDownload('dl_to_delete');
      expect(storageService.getDownload('dl_to_delete'), isNull);
    });
  });
}
