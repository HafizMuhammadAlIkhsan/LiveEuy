class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final DateTime? timestamp;

  const ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.timestamp,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json, [
    T Function(dynamic rawData)? fromJsonT,
  ]) {
    final rawData = json['data'];
    T? parsedData;

    if (rawData != null && fromJsonT != null) {
      parsedData = fromJsonT(rawData);
    } else if (rawData is T) {
      parsedData = rawData;
    }

    DateTime? parsedTimestamp;
    if (json['timestamp'] != null) {
      parsedTimestamp = DateTime.tryParse(json['timestamp'].toString());
    }

    return ApiResponse<T>(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: parsedData,
      timestamp: parsedTimestamp,
    );
  }

  factory ApiResponse.success(
    T data, {
    String message = 'Success',
  }) {
    return ApiResponse<T>(
      success: true,
      message: message,
      data: data,
      timestamp: DateTime.now(),
    );
  }

  factory ApiResponse.error(
    String message, {
    T? data,
  }) {
    return ApiResponse<T>(
      success: false,
      message: message,
      data: data,
      timestamp: DateTime.now(),
    );
  }

  bool get isSuccess => success;
  bool get hasData => data != null;

  @override
  String toString() {
    return 'ApiResponse(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}
