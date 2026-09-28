class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final String iconType; // 'sparkles' | 'flame' | 'bell'
  final String? targetMediaId;
  final String? deepLinkUrl;
  final bool isRead;
  final DateTime? createdAt;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.iconType,
    this.targetMediaId,
    this.deepLinkUrl,
    this.isRead = false,
    this.createdAt,
  });

  String get effectiveDeepLink {
    if (deepLinkUrl != null && deepLinkUrl!.isNotEmpty) {
      return deepLinkUrl!;
    }
    if (targetMediaId != null && targetMediaId!.isNotEmpty) {
      return 'liveeuy://media/$targetMediaId';
    }
    return 'liveeuy://home';
  }

  NotificationItem copyWith({
    String? id,
    String? title,
    String? message,
    String? time,
    String? iconType,
    String? targetMediaId,
    String? deepLinkUrl,
    bool? isRead,
    DateTime? createdAt,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      time: time ?? this.time,
      iconType: iconType ?? this.iconType,
      targetMediaId: targetMediaId ?? this.targetMediaId,
      deepLinkUrl: deepLinkUrl ?? this.deepLinkUrl,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      message: json['message'] as String? ?? '',
      time: json['time'] as String? ?? '',
      iconType: json['iconType'] as String? ?? 'sparkles',
      targetMediaId: json['targetMediaId'] as String?,
      deepLinkUrl: json['deepLinkUrl'] as String?,
      isRead: json['isRead'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'time': time,
      'iconType': iconType,
      if (targetMediaId != null) 'targetMediaId': targetMediaId,
      if (deepLinkUrl != null) 'deepLinkUrl': deepLinkUrl,
      'isRead': isRead,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}

