class Review {
  final String id;
  final String? mediaId;
  final String userName;
  final String userAvatarUrl;
  final double rating; // 1.0 to 10.0
  final String comment;
  final DateTime createdAt;
  final int likesCount;

  const Review({
    required this.id,
    this.mediaId,
    required this.userName,
    required this.userAvatarUrl,
    required this.rating,
    required this.comment,
    required this.createdAt,
    this.likesCount = 0,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    if (json['createdAt'] != null) {
      parsedDate = DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return Review(
      id: json['id'] as String? ?? '',
      mediaId: json['mediaId'] as String?,
      userName: json['userName'] as String? ??
          json['author'] as String? ??
          'Pengguna',
      userAvatarUrl: json['userAvatarUrl'] as String? ??
          json['avatar'] as String? ??
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      comment: json['comment'] as String? ?? '',
      createdAt: parsedDate,
      likesCount: (json['likesCount'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      if (mediaId != null) 'mediaId': mediaId,
      'userName': userName,
      'userAvatarUrl': userAvatarUrl,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
      'likesCount': likesCount,
    };
  }
}
