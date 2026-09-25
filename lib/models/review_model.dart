class Review {
  final String id;
  final String userName;
  final String userAvatarUrl;
  final double rating; // 1.0 to 10.0
  final String comment;
  final DateTime createdAt;
  final int likesCount;

  const Review({
    required this.id,
    required this.userName,
    required this.userAvatarUrl,
    required this.rating,
    required this.comment,
    required this.createdAt,
    this.likesCount = 0,
  });
}
