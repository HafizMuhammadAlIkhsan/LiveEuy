import 'episode_model.dart';

class Season {
  final String id;
  final int seasonNumber;
  final String title;
  final List<Episode> episodes;

  const Season({
    required this.id,
    required this.seasonNumber,
    required this.title,
    this.episodes = const [],
  });

  factory Season.fromJson(Map<String, dynamic> json) {
    return Season(
      id: json['id'] as String? ?? '',
      seasonNumber: (json['seasonNumber'] as num?)?.toInt() ?? 1,
      title: json['title'] as String? ?? '',
      episodes: (json['episodes'] as List<dynamic>?)
              ?.map((e) => Episode.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'seasonNumber': seasonNumber,
      'title': title,
      'episodes': episodes.map((e) => e.toJson()).toList(),
    };
  }
}
