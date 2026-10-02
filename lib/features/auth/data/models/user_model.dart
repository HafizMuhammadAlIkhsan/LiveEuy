import '../../domain/entities/user_entity.dart';
import '../../../../models/device_session_model.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.name,
    required super.email,
    required super.avatarUrl,
    required super.isLoggedIn,
    super.isVip,
    super.membershipTier,
    super.rememberMe,
    super.deviceType,
    super.currentDeviceName,
    super.securityPin,
    super.activeSessions = const [],
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    var rawSessions = json['activeSessions'];
    List<DeviceSession> parsedSessions = [];
    if (rawSessions is List) {
      parsedSessions = rawSessions
          .map((m) {
            if (m is DeviceSession) return m;
            if (m is Map) return DeviceSession.fromJson(Map<String, dynamic>.from(m));
            return null;
          })
          .whereType<DeviceSession>()
          .toList();
    }

    final membershipTier = json['membershipTier'] as String? ??
        json['tier'] as String? ?? 'REGULAR';
    final isVipVal = json['isVip'] as bool? ??
        membershipTier.toUpperCase().contains('VIP') ||
        membershipTier.toUpperCase().contains('ULTRA');
    return UserModel(
      name: json['name'] as String? ?? 'User',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String? ??
          json['avatar'] as String? ??
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isLoggedIn: json['isLoggedIn'] as bool? ?? false,
      isVip: isVipVal,
      membershipTier: membershipTier,
      rememberMe: json['rememberMe'] as bool? ?? true,
      deviceType: json['deviceType'] as String? ?? 'Mobile',
      currentDeviceName: json['currentDeviceName'] as String? ?? 'Smartphone (Android)',
      activeSessions: parsedSessions,
      securityPin: json['securityPin'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'isLoggedIn': isLoggedIn,
      'isVip': isVip,
      'membershipTier': membershipTier,
      'rememberMe': rememberMe,
      'deviceType': deviceType,
      'currentDeviceName': currentDeviceName,
      'activeSessions': activeSessions.map((s) => s.toJson()).toList(),
      'securityPin': securityPin,
    };
  }

  UserEntity toEntity() => this;

  factory UserModel.fromEntity(UserEntity entity, {List<DeviceSession>? sessions}) {
    return UserModel(
      name: entity.name,
      email: entity.email,
      avatarUrl: entity.avatarUrl,
      isLoggedIn: entity.isLoggedIn,
      isVip: entity.isVip,
      membershipTier: entity.membershipTier,
      rememberMe: entity.rememberMe,
      deviceType: entity.deviceType,
      currentDeviceName: entity.currentDeviceName,
      securityPin: entity.securityPin,
      activeSessions: sessions ?? const [],
    );
  }
}
