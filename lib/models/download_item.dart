enum DownloadStatus {
  idle,
  pending,
  downloading,
  paused,
  completed,
  failed,
  expired,
}

class DownloadItem {
  final String id; // Unique ID (e.g. movieId or movieId_episodeId)
  final String movieId;
  final String? episodeId;
  final String title;
  final String? episodeTitle;
  final String thumbnailUrl;
  final String localFilePath;
  final int fileSizeBytes;
  final int downloadedBytes;
  final String quality; // "480p", "720p", "1080p", "4K"
  final DownloadStatus status;
  final double progress; // 0.0 to 1.0
  final DateTime downloadedAt;
  final DateTime expiresAt;
  final String? licenseToken;
  final String? downloadId; // Backend session ID
  final String? failureReason;

  const DownloadItem({
    required this.id,
    required this.movieId,
    this.episodeId,
    required this.title,
    this.episodeTitle,
    required this.thumbnailUrl,
    required this.localFilePath,
    required this.fileSizeBytes,
    this.downloadedBytes = 0,
    this.quality = '1080p',
    this.status = DownloadStatus.completed,
    this.progress = 1.0,
    required this.downloadedAt,
    required this.expiresAt,
    this.licenseToken,
    this.downloadId,
    this.failureReason,
  });

  bool get isSeries => episodeId != null && episodeId!.isNotEmpty;

  /// Cek apakah lisensi menonton offline telah kedaluwarsa (> 30 hari tanpa koneksi)
  bool get isExpired {
    if (status == DownloadStatus.expired) return true;
    return DateTime.now().isAfter(expiresAt);
  }

  /// Sisa hari lisensi offline aktif
  int get remainingDays {
    final diff = expiresAt.difference(DateTime.now()).inDays;
    return diff < 0 ? 0 : diff;
  }

  bool get isCompleted => status == DownloadStatus.completed && !isExpired;
  bool get isDownloading => status == DownloadStatus.downloading;
  bool get isPaused => status == DownloadStatus.paused;

  /// Format ukuran file yang mudah dibaca (MB / GB)
  String get formattedSize {
    if (fileSizeBytes <= 0) return '0 MB';
    if (fileSizeBytes >= 1024 * 1024 * 1024) {
      final gb = fileSizeBytes / (1024 * 1024 * 1024);
      return '${gb.toStringAsFixed(1)} GB';
    }
    final mb = fileSizeBytes / (1024 * 1024);
    return '${mb.toStringAsFixed(0)} MB';
  }

  DownloadItem copyWith({
    String? id,
    String? movieId,
    String? episodeId,
    String? title,
    String? episodeTitle,
    String? thumbnailUrl,
    String? localFilePath,
    int? fileSizeBytes,
    int? downloadedBytes,
    String? quality,
    DownloadStatus? status,
    double? progress,
    DateTime? downloadedAt,
    DateTime? expiresAt,
    String? licenseToken,
    String? downloadId,
    String? failureReason,
  }) {
    return DownloadItem(
      id: id ?? this.id,
      movieId: movieId ?? this.movieId,
      episodeId: episodeId ?? this.episodeId,
      title: title ?? this.title,
      episodeTitle: episodeTitle ?? this.episodeTitle,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      localFilePath: localFilePath ?? this.localFilePath,
      fileSizeBytes: fileSizeBytes ?? this.fileSizeBytes,
      downloadedBytes: downloadedBytes ?? this.downloadedBytes,
      quality: quality ?? this.quality,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      downloadedAt: downloadedAt ?? this.downloadedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      licenseToken: licenseToken ?? this.licenseToken,
      downloadId: downloadId ?? this.downloadId,
      failureReason: failureReason ?? this.failureReason,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'movieId': movieId,
      'episodeId': episodeId,
      'title': title,
      'episodeTitle': episodeTitle,
      'thumbnailUrl': thumbnailUrl,
      'localFilePath': localFilePath,
      'fileSizeBytes': fileSizeBytes,
      'downloadedBytes': downloadedBytes,
      'quality': quality,
      'status': status.name,
      'progress': progress,
      'downloadedAt': downloadedAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
      'licenseToken': licenseToken,
      'downloadId': downloadId,
      'failureReason': failureReason,
    };
  }

  factory DownloadItem.fromJson(Map<dynamic, dynamic> map) {
    DownloadStatus parseStatus(String? name) {
      if (name == null) return DownloadStatus.completed;
      for (final s in DownloadStatus.values) {
        if (s.name == name) return s;
      }
      return DownloadStatus.completed;
    }

    return DownloadItem(
      id: map['id'] as String? ?? '',
      movieId: map['movieId'] as String? ?? '',
      episodeId: map['episodeId'] as String?,
      title: map['title'] as String? ?? '',
      episodeTitle: map['episodeTitle'] as String?,
      thumbnailUrl: map['thumbnailUrl'] as String? ?? '',
      localFilePath: map['localFilePath'] as String? ?? '',
      fileSizeBytes: (map['fileSizeBytes'] as num?)?.toInt() ?? 0,
      downloadedBytes: (map['downloadedBytes'] as num?)?.toInt() ?? 0,
      quality: map['quality'] as String? ?? '1080p',
      status: parseStatus(map['status'] as String?),
      progress: (map['progress'] as num?)?.toDouble() ?? 1.0,
      downloadedAt: map['downloadedAt'] != null
          ? DateTime.tryParse(map['downloadedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      expiresAt: map['expiresAt'] != null
          ? DateTime.tryParse(map['expiresAt'] as String) ??
              DateTime.now().add(const Duration(days: 30))
          : DateTime.now().add(const Duration(days: 30)),
      licenseToken: map['licenseToken'] as String?,
      downloadId: map['downloadId'] as String?,
      failureReason: map['failureReason'] as String?,
    );
  }
}
