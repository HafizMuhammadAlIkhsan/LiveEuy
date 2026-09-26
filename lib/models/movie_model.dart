import 'season_model.dart';

class Movie {
  final String id;
  final String title;
  final String synopsis;
  final String posterUrl;
  final String backdropUrl;
  final String videoUrl;
  final double matchScore; // e.g. 98%
  final String ageRating; // e.g. 18+, 13+, SU
  final List<String> resolutionBadges; // e.g. ["4K UHD", "Dolby Vision", "HDR10"]
  final String genre;
  final String durationOrSeasons; // e.g. "1 Jam 48 Min" or "2 Musim"
  final int releaseYear;
  final String director;
  final List<String> cast;
  final bool isTop10;
  final int? top10Rank;
  final double userRating;
  final double continueWatchingProgress; // 0.0 to 1.0
  final List<Season> seasons;

  const Movie({
    required this.id,
    required this.title,
    required this.synopsis,
    required this.posterUrl,
    required this.backdropUrl,
    required this.videoUrl,
    required this.matchScore,
    required this.ageRating,
    required this.resolutionBadges,
    required this.genre,
    required this.durationOrSeasons,
    required this.releaseYear,
    required this.director,
    required this.cast,
    this.isTop10 = false,
    this.top10Rank,
    this.userRating = 4.8,
    this.continueWatchingProgress = 0.0,
    this.seasons = const [],
  });

  Movie copyWith({
    String? id,
    String? title,
    String? synopsis,
    String? posterUrl,
    String? backdropUrl,
    String? videoUrl,
    double? matchScore,
    String? ageRating,
    List<String>? resolutionBadges,
    String? genre,
    String? durationOrSeasons,
    int? releaseYear,
    String? director,
    List<String>? cast,
    bool? isTop10,
    int? top10Rank,
    double? userRating,
    double? continueWatchingProgress,
    List<Season>? seasons,
  }) {
    return Movie(
      id: id ?? this.id,
      title: title ?? this.title,
      synopsis: synopsis ?? this.synopsis,
      posterUrl: posterUrl ?? this.posterUrl,
      backdropUrl: backdropUrl ?? this.backdropUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      matchScore: matchScore ?? this.matchScore,
      ageRating: ageRating ?? this.ageRating,
      resolutionBadges: resolutionBadges ?? this.resolutionBadges,
      genre: genre ?? this.genre,
      durationOrSeasons: durationOrSeasons ?? this.durationOrSeasons,
      releaseYear: releaseYear ?? this.releaseYear,
      director: director ?? this.director,
      cast: cast ?? this.cast,
      isTop10: isTop10 ?? this.isTop10,
      top10Rank: top10Rank ?? this.top10Rank,
      userRating: userRating ?? this.userRating,
      continueWatchingProgress:
          continueWatchingProgress ?? this.continueWatchingProgress,
      seasons: seasons ?? this.seasons,
    );
  }

  factory Movie.fromJson(Map<String, dynamic> json) {
    // Dual compatibility with Web (overview vs synopsis, rating vs userRating, topRank vs top10Rank, genres vs genre)
    final synopsis =
        json['synopsis'] as String? ?? json['overview'] as String? ?? '';
    final genre = json['genre'] as String? ??
        (json['genres'] is List && (json['genres'] as List).isNotEmpty
            ? (json['genres'] as List).first.toString()
            : '');
    final userRating = (json['userRating'] as num?)?.toDouble() ??
        (json['rating'] as num?)?.toDouble() ??
        4.8;
    final top10Rank = (json['top10Rank'] as num?)?.toInt() ??
        (json['topRank'] as num?)?.toInt();
    final isTop10 = json['isTop10'] as bool? ??
        (top10Rank != null && top10Rank > 0);

    List<String> badges = [];
    if (json['resolutionBadges'] is List) {
      badges = (json['resolutionBadges'] as List)
          .map((e) => e.toString())
          .toList();
    } else {
      if (json['quality'] != null) badges.add(json['quality'].toString());
      if (json['audio'] != null) badges.add(json['audio'].toString());
    }

    String formattedDuration = json['durationOrSeasons'] as String? ??
        json['duration'] as String? ??
        '';
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

    List<String> castList = [];
    if (json['cast'] is List) {
      castList = (json['cast'] as List).map((e) => e.toString()).toList();
    } else if (json['castAndCrew'] is List) {
      for (final person in (json['castAndCrew'] as List)) {
        if (person is Map && person['name'] != null) {
          castList.add(person['name'].toString());
        }
      }
    }

    String director = json['director'] as String? ?? '';
    if (director.isEmpty && json['castAndCrew'] is List) {
      for (final person in (json['castAndCrew'] as List)) {
        if (person is Map &&
            (person['role']?.toString().toUpperCase() == 'DIRECTOR')) {
          director = person['name']?.toString() ?? '';
          break;
        }
      }
    }

    return Movie(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      synopsis: synopsis,
      posterUrl: json['posterUrl'] as String? ?? '',
      backdropUrl: json['backdropUrl'] as String? ?? '',
      videoUrl: json['videoUrl'] as String? ?? '',
      matchScore: (json['matchScore'] as num?)?.toDouble() ?? 0.0,
      ageRating: json['ageRating'] as String? ?? '',
      resolutionBadges: badges,
      genre: genre,
      durationOrSeasons: formattedDuration,
      releaseYear: (json['releaseYear'] as num?)?.toInt() ?? 2024,
      director: director,
      cast: castList,
      isTop10: isTop10,
      top10Rank: top10Rank,
      userRating: userRating,
      continueWatchingProgress:
          (json['continueWatchingProgress'] as num?)?.toDouble() ?? 0.0,
      seasons: (json['seasons'] as List<dynamic>?)
              ?.map((e) => Season.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'synopsis': synopsis,
      'posterUrl': posterUrl,
      'backdropUrl': backdropUrl,
      'videoUrl': videoUrl,
      'matchScore': matchScore,
      'ageRating': ageRating,
      'resolutionBadges': resolutionBadges,
      'genre': genre,
      'durationOrSeasons': durationOrSeasons,
      'releaseYear': releaseYear,
      'director': director,
      'cast': cast,
      'isTop10': isTop10,
      if (top10Rank != null) 'top10Rank': top10Rank,
      'userRating': userRating,
      'continueWatchingProgress': continueWatchingProgress,
      'seasons': seasons.map((s) => s.toJson()).toList(),
    };
  }
}
