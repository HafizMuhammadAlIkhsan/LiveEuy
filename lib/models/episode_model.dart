import 'movie_model.dart';

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
  final ProcessingStatus processingStatus;
  final String? transcodeJobId;

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
    this.processingStatus = ProcessingStatus.ready,
    this.transcodeJobId,
  });

  Episode copyWith({
    String? id,
    int? episodeNumber,
    int? seasonNumber,
    String? title,
    String? duration,
    String? synopsis,
    String? thumbnailUrl,
    String? videoUrl,
    double? progress,
    ProcessingStatus? processingStatus,
    String? transcodeJobId,
  }) {
    return Episode(
      id: id ?? this.id,
      episodeNumber: episodeNumber ?? this.episodeNumber,
      seasonNumber: seasonNumber ?? this.seasonNumber,
      title: title ?? this.title,
      duration: duration ?? this.duration,
      synopsis: synopsis ?? this.synopsis,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      progress: progress ?? this.progress,
      processingStatus: processingStatus ?? this.processingStatus,
      transcodeJobId: transcodeJobId ?? this.transcodeJobId,
    );
  }

  factory Episode.fromJson(Map<String, dynamic> json) {
    String formattedDuration = json['duration'] as String? ?? '';
    if (formattedDuration.isEmpty && json['durationSeconds'] is num) {
      final sec = (json['durationSeconds'] as num).toInt();
      final hours = sec ~/ 3600;
      final minutes = (sec % 3600) ~/ 60;
      if (hours > 0) {
        formattedDuration = '$hours Jam ${minutes > 0 ? '$minutes Min' : ''}'.trim();
      } else {
        formattedDuration = '$minutes Menit';
      }
    }

    return Episode(
      id: json['id'] as String? ?? '',
      episodeNumber: (json['episodeNumber'] as num?)?.toInt() ?? 1,
      seasonNumber: (json['seasonNumber'] as num?)?.toInt() ?? 1,
      title: json['title'] as String? ?? '',
      duration: formattedDuration,
      synopsis:
          json['synopsis'] as String? ?? json['overview'] as String? ?? '',
      thumbnailUrl: json['thumbnailUrl'] as String? ??
          json['thumbnail'] as String? ??
          '',
      videoUrl: json['videoUrl'] as String? ?? '',
      progress: (json['progress'] as num?)?.toDouble() ?? 0.0,
      processingStatus: ProcessingStatus.fromString(
          json['processingStatus'] as String? ?? json['status'] as String?),
      transcodeJobId: json['transcodeJobId'] as String?,
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
      'processingStatus': processingStatus.name,
      if (transcodeJobId != null) 'transcodeJobId': transcodeJobId,
    };
  }
}
