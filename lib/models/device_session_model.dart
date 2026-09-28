/// Enum klasifikasi tipe perangkat selaras dengan dev-frontend VisitorSession.deviceType
enum DeviceType {
  mobile,
  desktop,
  tablet,
}

extension DeviceTypeExtension on DeviceType {
  String get label {
    switch (this) {
      case DeviceType.mobile:
        return 'Mobile';
      case DeviceType.desktop:
        return 'Desktop';
      case DeviceType.tablet:
        return 'Tablet';
    }
  }

  static DeviceType fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'desktop':
      case 'web':
        return DeviceType.desktop;
      case 'tablet':
      case 'ipad':
        return DeviceType.tablet;
      case 'mobile':
      case 'android':
      case 'ios':
      default:
        return DeviceType.mobile;
    }
  }
}

/// Model sesi perangkat login yang membedakan sesi Mobile dengan sesi Web/Desktop
class DeviceSession {
  final String sessionId;
  final String deviceName;
  final DeviceType deviceType;
  final String os;
  final String browserOrApp;
  final String ipAddress;
  final String location;
  final String lastActive;
  final bool isCurrentDevice;

  const DeviceSession({
    required this.sessionId,
    required this.deviceName,
    required this.deviceType,
    required this.os,
    required this.browserOrApp,
    required this.ipAddress,
    required this.location,
    required this.lastActive,
    this.isCurrentDevice = false,
  });

  bool get isMobile => deviceType == DeviceType.mobile;
  bool get isWebOrDesktop => deviceType == DeviceType.desktop;

  factory DeviceSession.fromJson(Map<String, dynamic> json) {
    return DeviceSession(
      sessionId: json['sessionId'] as String? ?? 'sess-unknown',
      deviceName: json['deviceName'] as String? ?? 'Perangkat Tidak Dikenal',
      deviceType: DeviceTypeExtension.fromString(json['deviceType'] as String?),
      os: json['os'] as String? ?? 'OS Tidak Diketahui',
      browserOrApp: json['browserOrApp'] as String? ?? 'LiveEuy Client',
      ipAddress: json['ipAddress'] as String? ?? '127.0.0.1',
      location: json['location'] as String? ?? 'Indonesia',
      lastActive: json['lastActive'] as String? ?? 'Baru saja',
      isCurrentDevice: json['isCurrentDevice'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'deviceName': deviceName,
      'deviceType': deviceType.label,
      'os': os,
      'browserOrApp': browserOrApp,
      'ipAddress': ipAddress,
      'location': location,
      'lastActive': lastActive,
      'isCurrentDevice': isCurrentDevice,
    };
  }

  DeviceSession copyWith({
    String? sessionId,
    String? deviceName,
    DeviceType? deviceType,
    String? os,
    String? browserOrApp,
    String? ipAddress,
    String? location,
    String? lastActive,
    bool? isCurrentDevice,
  }) {
    return DeviceSession(
      sessionId: sessionId ?? this.sessionId,
      deviceName: deviceName ?? this.deviceName,
      deviceType: deviceType ?? this.deviceType,
      os: os ?? this.os,
      browserOrApp: browserOrApp ?? this.browserOrApp,
      ipAddress: ipAddress ?? this.ipAddress,
      location: location ?? this.location,
      lastActive: lastActive ?? this.lastActive,
      isCurrentDevice: isCurrentDevice ?? this.isCurrentDevice,
    );
  }
}
