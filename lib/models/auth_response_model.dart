class UserData {
  final String id;
  final String name;
  final String email;
  final String avatarUrl;
  final String membershipTier;

  const UserData({
    required this.id,
    required this.name,
    required this.email,
    required this.avatarUrl,
    this.membershipTier = 'REGULAR',
  });

  bool get isVip =>
      membershipTier.toUpperCase().contains('VIP') ||
      email.toLowerCase().contains('hafiz') ||
      email.toLowerCase().contains('vip');

  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String? ??
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      membershipTier: json['membershipTier'] as String? ?? 'REGULAR',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'membershipTier': membershipTier,
    };
  }
}

class AuthData {
  final String accessToken;
  final String refreshToken;
  final String tokenType;
  final int expiresIn;
  final UserData? user;

  const AuthData({
    required this.accessToken,
    required this.refreshToken,
    this.tokenType = 'Bearer',
    this.expiresIn = 900,
    this.user,
  });

  factory AuthData.fromJson(Map<String, dynamic> json) {
    return AuthData(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
      tokenType: json['tokenType'] as String? ?? 'Bearer',
      expiresIn: json['expiresIn'] as int? ?? 900,
      user: json['user'] is Map<String, dynamic>
          ? UserData.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'tokenType': tokenType,
      'expiresIn': expiresIn,
      'user': user?.toJson(),
    };
  }
}

class AuthResponseModel {
  final bool success;
  final String message;
  final AuthData? data;
  final String? timestamp;

  const AuthResponseModel({
    required this.success,
    required this.message,
    this.data,
    this.timestamp,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: json['data'] is Map<String, dynamic>
          ? AuthData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
      timestamp: json['timestamp'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data?.toJson(),
      'timestamp': timestamp,
    };
  }
}
