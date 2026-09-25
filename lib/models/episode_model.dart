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
    required this.seasonNumber,
    required this.title,
    required this.duration,
    required this.synopsis,
    required this.thumbnailUrl,
    required this.videoUrl,
    this.progress = 0.0,
  });
}
