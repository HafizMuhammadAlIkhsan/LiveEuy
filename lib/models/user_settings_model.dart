/// Model data untuk preferensi dan pengaturan streaming pengguna
enum StreamingQuality {
  auto(
    id: 'AUTO',
    label: 'Otomatis (Adaptif)',
    description: 'Menyesuaikan kecepatan internet secara dinamis hingga 1080p',
    badge: 'REKOMENDASI',
    resolutionLabel: 'Hingga 1080p',
    estimatedUsage: 'Adaptif (~0.5 - 2.0 GB / jam)',
    requiresVip: false,
  ),
  dataSaver(
    id: 'DATA_SAVER',
    label: 'Hemat Data (480p)',
    description: 'Menghemat kuota seluler dengan kompresi optimal',
    badge: 'HEMAT KUOTA',
    resolutionLabel: 'SD 480p',
    estimatedUsage: '~0.3 GB / jam',
    requiresVip: false,
  ),
  hd720(
    id: 'HD_720P',
    label: 'Standar HD (720p)',
    description: 'Keseimbangan terbaik antara pemakaian kuota dan ketajaman gambar',
    badge: null,
    resolutionLabel: 'HD 720p',
    estimatedUsage: '~0.7 GB / jam',
    requiresVip: false,
  ),
  fhd1080(
    id: 'FHD_1080P',
    label: 'Tinggi Full HD (1080p)',
    description: 'Ketajaman kristal untuk layar smartphone dan tablet',
    badge: null,
    resolutionLabel: 'Full HD 1080p',
    estimatedUsage: '~1.5 GB / jam',
    requiresVip: false,
  ),
  uhd4k(
    id: 'UHD_4K',
    label: 'Maksimal Ultra HD (4K & Dolby)',
    description: 'Kualitas bioskop terbaik dengan Dolby Vision & Dolby Atmos',
    badge: 'LIVEEUY VIP 4K',
    resolutionLabel: '4K UHD HDR',
    estimatedUsage: '~7.0 GB / jam',
    requiresVip: true,
  );

  final String id;
  final String label;
  final String description;
  final String? badge;
  final String resolutionLabel;
  final String estimatedUsage;
  final bool requiresVip;

  const StreamingQuality({
    required this.id,
    required this.label,
    required this.description,
    this.badge,
    required this.resolutionLabel,
    required this.estimatedUsage,
    required this.requiresVip,
  });

  static StreamingQuality fromString(String? value) {
    if (value == null) return StreamingQuality.auto;
    return StreamingQuality.values.firstWhere(
      (e) => e.id.toUpperCase() == value.toUpperCase(),
      orElse: () => StreamingQuality.auto,
    );
  }
}

class UserSettings {
  final String userId;
  final StreamingQuality streamingQuality;
  final bool spatialAudio;
  final bool autoSkipIntro;
  final bool wifiOnlyDownload;
  final String downloadQuality;
  final bool notifications;
  final int cacheSizeBytes;

  const UserSettings({
    this.userId = 'u1',
    this.streamingQuality = StreamingQuality.auto,
    this.spatialAudio = true,
    this.autoSkipIntro = true,
    this.wifiOnlyDownload = true,
    this.downloadQuality = 'HIGH',
    this.notifications = true,
    this.cacheSizeBytes = 356515840, // 340 MB default cache
  });

  String get cacheFormatted {
    if (cacheSizeBytes <= 0) return '0 MB';
    final mb = cacheSizeBytes / (1024 * 1024);
    if (mb >= 1024) {
      return '${(mb / 1024).toStringAsFixed(1)} GB';
    }
    return '${mb.toStringAsFixed(0)} MB';
  }

  String get streamingQualitySubtitle {
    switch (streamingQuality) {
      case StreamingQuality.auto:
        return 'Otomatis (Adaptif hingga 1080p)';
      case StreamingQuality.dataSaver:
        return 'Hemat Data (SD 480p • ~0.3 GB/jam)';
      case StreamingQuality.hd720:
        return 'Standar HD (720p • ~0.7 GB/jam)';
      case StreamingQuality.fhd1080:
        return 'Tinggi Full HD (1080p • ~1.5 GB/jam)';
      case StreamingQuality.uhd4k:
        return 'Maksimal (4K UHD & Dolby Atmos)';
    }
  }

  UserSettings copyWith({
    String? userId,
    StreamingQuality? streamingQuality,
    bool? spatialAudio,
    bool? autoSkipIntro,
    bool? wifiOnlyDownload,
    String? downloadQuality,
    bool? notifications,
    int? cacheSizeBytes,
  }) {
    return UserSettings(
      userId: userId ?? this.userId,
      streamingQuality: streamingQuality ?? this.streamingQuality,
      spatialAudio: spatialAudio ?? this.spatialAudio,
      autoSkipIntro: autoSkipIntro ?? this.autoSkipIntro,
      wifiOnlyDownload: wifiOnlyDownload ?? this.wifiOnlyDownload,
      downloadQuality: downloadQuality ?? this.downloadQuality,
      notifications: notifications ?? this.notifications,
      cacheSizeBytes: cacheSizeBytes ?? this.cacheSizeBytes,
    );
  }

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      userId: json['userId'] as String? ?? 'u1',
      streamingQuality: StreamingQuality.fromString(json['streamingQuality'] as String?),
      spatialAudio: json['spatialAudio'] as bool? ?? true,
      autoSkipIntro: json['autoSkipIntro'] as bool? ?? true,
      wifiOnlyDownload: json['wifiOnlyDownload'] as bool? ?? true,
      downloadQuality: json['downloadQuality'] as String? ?? 'HIGH',
      notifications: json['notifications'] as bool? ?? true,
      cacheSizeBytes: json['cacheSizeBytes'] as int? ?? 356515840,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'streamingQuality': streamingQuality.id,
      'spatialAudio': spatialAudio,
      'autoSkipIntro': autoSkipIntro,
      'wifiOnlyDownload': wifiOnlyDownload,
      'downloadQuality': downloadQuality,
      'notifications': notifications,
      'cacheSizeBytes': cacheSizeBytes,
    };
  }
}
