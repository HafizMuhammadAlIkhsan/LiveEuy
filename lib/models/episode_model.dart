class Episode {
  final String id;
  final int episodeNumber;
  final int seasonNumber;
  final String title;
  final String duration;
  final String synopsis;
  final String thumbnailUrl;
  final String videoUrl;
  final double progress; // 0.0 to 1.0

  const Episode({
    required this.id,
    required this.episodeNumber,
    this.seasonNumber = 1,
    required this.title,
    required this.duration,
    required this.synopsis,
    required this.thumbnailUrl,
    required this.videoUrl,
    this.progress = 0.0,
  });

  factory Episode.fromJson(Map<String, dynamic> json) {
    return Episode(
      id: json['id'] as String? ?? '',
      episodeNumber: (json['episodeNumber'] as num?)?.toInt() ?? 1,
      seasonNumber: (json['seasonNumber'] as num?)?.toInt() ?? 1,
      title: json['title'] as String? ?? '',
      duration: json['duration'] as String? ?? '',
      synopsis:
          json['synopsis'] as String? ?? json['overview'] as String? ?? '',
      thumbnailUrl: json['thumbnailUrl'] as String? ??
          json['thumbnail'] as String? ??
          '',
      videoUrl: json['videoUrl'] as String? ?? '',
      progress: (json['progress'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'episodeNumber': episodeNumber,
      'seasonNumber': seasonNumber,
      'title': title,
      'duration': duration,
      'synopsis': synopsis,
      'thumbnailUrl': thumbnailUrl,
      'videoUrl': videoUrl,
      'progress': progress,
    };
  }
}
