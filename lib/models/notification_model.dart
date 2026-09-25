class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final String iconType; // 'sparkles' | 'flame'
  final String? targetMediaId;
  final bool isRead;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.iconType,
    this.targetMediaId,
    this.isRead = false,
  });

  NotificationItem copyWith({
    String? id,
    String? title,
    String? message,
    String? time,
    String? iconType,
    String? targetMediaId,
    bool? isRead,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      time: time ?? this.time,
      iconType: iconType ?? this.iconType,
      targetMediaId: targetMediaId ?? this.targetMediaId,
      isRead: isRead ?? this.isRead,
    );
  }
}
