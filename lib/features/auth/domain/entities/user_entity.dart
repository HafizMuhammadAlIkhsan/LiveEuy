import '../../../../models/device_session_model.dart';

class UserEntity {
  final String name;
  final String email;
  final String avatarUrl;
  final bool isLoggedIn;
  final bool isVip;
  final String membershipTier;
  final bool rememberMe;
  final String deviceType;
  final String currentDeviceName;
  final String? securityPin;
  final List<DeviceSession> activeSessions;

  const UserEntity({
    required this.name,
    required this.email,
    required this.avatarUrl,
    required this.isLoggedIn,
    this.isVip = false,
    this.membershipTier = 'REGULAR',
    this.rememberMe = true,
    this.deviceType = 'Mobile',
    this.currentDeviceName = 'Smartphone (Android)',
    this.securityPin,
    this.activeSessions = const [],
  });

  int get maxAllowedDevices {
    final tier = membershipTier.toUpperCase();
    if (tier.contains('ULTRA')) return 4;
    if (tier.contains('VIP') || tier.contains('STANDARD')) return 2;
    return 1;
  }

  UserEntity copyWith({
    String? name,
    String? email,
    String? avatarUrl,
    bool? isLoggedIn,
    bool? isVip,
    String? membershipTier,
    bool? rememberMe,
    String? deviceType,
    String? currentDeviceName,
    String? securityPin,
    List<DeviceSession>? activeSessions,
  }) {
    return UserEntity(
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      isVip: isVip ?? this.isVip,
      membershipTier: membershipTier ?? this.membershipTier,
      rememberMe: rememberMe ?? this.rememberMe,
      deviceType: deviceType ?? this.deviceType,
      currentDeviceName: currentDeviceName ?? this.currentDeviceName,
      securityPin: securityPin ?? this.securityPin,
      activeSessions: activeSessions ?? this.activeSessions,
    );
  }
}
