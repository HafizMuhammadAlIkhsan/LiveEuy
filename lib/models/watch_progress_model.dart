class WatchProgress {
  final String? id;
  final String userId;
  final String mediaId;
  final double progress; // 0.0 to 1.0
  final String? lastEpisodeId;
  final DateTime? updatedAt;

  const WatchProgress({
    this.id,
    required this.userId,
    required this.mediaId,
    required this.progress,
    this.lastEpisodeId,
    this.updatedAt,
  });

  factory WatchProgress.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['updatedAt'] != null) {
      parsedDate = DateTime.tryParse(json['updatedAt'].toString());
    }

    return WatchProgress(
      id: json['id'] as String?,
      userId: json['userId'] as String? ?? '',
      mediaId: json['mediaId'] as String? ?? '',
      progress: (json['progress'] as num?)?.toDouble() ?? 0.0,
      lastEpisodeId: json['lastEpisodeId'] as String?,
      updatedAt: parsedDate,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'userId': userId,
      'mediaId': mediaId,
      'progress': progress,
      if (lastEpisodeId != null) 'lastEpisodeId': lastEpisodeId,
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }
}
