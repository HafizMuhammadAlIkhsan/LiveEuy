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
  final String durationOrSeasons; // e.g. "1 Jamp 48 Min" or "2 Musim"
  final int releaseYear;
  final String director;
  final List<String> cast;
  final bool isTop10;
  final int? top10Rank;
  final double userRating;
  final double continueWatchingProgress; // 0.0 to 1.0

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
  });

  Movie copyWith({
    double? continueWatchingProgress,
  }) {
    return Movie(
      id: id,
      title: title,
      synopsis: synopsis,
      posterUrl: posterUrl,
      backdropUrl: backdropUrl,
      videoUrl: videoUrl,
      matchScore: matchScore,
      ageRating: ageRating,
      resolutionBadges: resolutionBadges,
      genre: genre,
      durationOrSeasons: durationOrSeasons,
      releaseYear: releaseYear,
      director: director,
      cast: cast,
      isTop10: isTop10,
      top10Rank: top10Rank,
      userRating: userRating,
      continueWatchingProgress: continueWatchingProgress ?? this.continueWatchingProgress,
    );
  }
}
