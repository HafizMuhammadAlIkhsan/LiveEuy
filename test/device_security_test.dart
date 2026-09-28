import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:liveeuy_mob/core/network/api_config.dart';
import 'package:liveeuy_mob/models/device_session_model.dart';
import 'package:liveeuy_mob/providers/auth_provider.dart';
import 'package:liveeuy_mob/shared/widgets/device_security_sheet.dart';

void main() {
  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('ApiConfig Device Identification & Headers Tests', () {
    test('Default headers include User-Agent, X-Device-Type, and X-Client-Platform', () {
      final headers = ApiConfig.defaultHeaders;

      expect(headers.containsKey('Content-Type'), isTrue);
      expect(headers.containsKey('User-Agent'), isTrue);
      expect(headers.containsKey('X-Device-Type'), isTrue);
      expect(headers.containsKey('X-Client-Platform'), isTrue);

      expect(headers['X-Device-Type'], equals('Mobile'));
      expect(headers['User-Agent'], contains('LiveEuy-Mobile'));
      expect(headers['X-Client-Platform'], isNotEmpty);
    });

    test('Endpoint paths for device logout and revoke are formatted correctly', () {
      expect(ApiConfig.logoutAllPath, equals('/auth/logout-all'));
      expect(ApiConfig.revokeDevicePath('sess-web-123'), equals('/auth/devices/sess-web-123'));
    });
  });

  group('DeviceSession Model & DeviceType Tests', () {
    test('DeviceTypeExtension correctly classifies mobile, web/desktop, and tablet', () {
      expect(DeviceTypeExtension.fromString('mobile'), equals(DeviceType.mobile));
      expect(DeviceTypeExtension.fromString('android'), equals(DeviceType.mobile));
      expect(DeviceTypeExtension.fromString('desktop'), equals(DeviceType.desktop));
      expect(DeviceTypeExtension.fromString('web'), equals(DeviceType.desktop));
      expect(DeviceTypeExtension.fromString('tablet'), equals(DeviceType.tablet));
      expect(DeviceTypeExtension.fromString('ipad'), equals(DeviceType.tablet));
    });

    test('DeviceSession serializes to JSON and deserializes correctly', () {
      const session = DeviceSession(
        sessionId: 'sess-web-01',
        deviceName: 'Google Chrome (Windows 11)',
        deviceType: DeviceType.desktop,
        os: 'Windows 11 Pro',
        browserOrApp: 'Google Chrome v128',
        ipAddress: '180.252.164.218',
        location: 'Jakarta, Indonesia',
        lastActive: '10 menit yang lalu',
        isCurrentDevice: false,
      );

      expect(session.isMobile, isFalse);
      expect(session.isWebOrDesktop, isTrue);

      final json = session.toJson();
      expect(json['sessionId'], equals('sess-web-01'));
      expect(json['deviceType'], equals('Desktop'));
      expect(json['isCurrentDevice'], isFalse);

      final parsed = DeviceSession.fromJson(json);
      expect(parsed.sessionId, equals('sess-web-01'));
      expect(parsed.deviceType, equals(DeviceType.desktop));
      expect(parsed.deviceName, equals('Google Chrome (Windows 11)'));
    });
  });

  group('AuthNotifier Device Differentiation & Session Management Tests', () {
    test('Login creates activeSessions distinguishing Mobile from Web', () async {
      final notifier = AuthNotifier();
      expect(notifier.state.isLoggedIn, isFalse);
      expect(notifier.state.deviceType, equals('Mobile'));

      await notifier.login('hafiz@streamflix.id', 'password123', true);
      expect(notifier.state.isLoggedIn, isTrue);

      final sessions = notifier.state.activeSessions;
      expect(sessions.isNotEmpty, isTrue);

      // Sesi mobile saat ini
      final current = sessions.firstWhere((s) => s.isCurrentDevice);
      expect(current.isMobile, isTrue);
      expect(current.deviceType, equals(DeviceType.mobile));
      expect(current.sessionId, equals('sess-mob-current'));

      // Sesi web dari platform lain
      final webSessions = sessions.where((s) => !s.isCurrentDevice).toList();
      expect(webSessions.isNotEmpty, isTrue);
      expect(webSessions.first.isWebOrDesktop, isTrue);
      expect(webSessions.first.deviceType, equals(DeviceType.desktop));
    });

    test('Revoke single web device removes only that session', () async {
      final notifier = AuthNotifier();
      await notifier.login('hafiz@streamflix.id', 'password123', true);

      final initialCount = notifier.state.activeSessions.length;
      expect(initialCount, greaterThanOrEqualTo(2));

      // Revoke the first other device
      final targetSession = notifier.state.activeSessions.firstWhere((s) => !s.isCurrentDevice);
      final success = await notifier.revokeDeviceSession(targetSession.sessionId);
      expect(success, isTrue);

      // Session list count decreased by 1
      expect(notifier.state.activeSessions.length, equals(initialCount - 1));
      expect(notifier.state.activeSessions.any((s) => s.sessionId == targetSession.sessionId), isFalse);

      // Mobile session remains active
      expect(notifier.state.isLoggedIn, isTrue);
      expect(notifier.state.activeSessions.any((s) => s.isCurrentDevice), isTrue);
    });

    test('Logout all other devices keeps mobile session active', () async {
      final notifier = AuthNotifier();
      await notifier.login('hafiz@streamflix.id', 'password123', true);

      expect(notifier.state.activeSessions.length, greaterThanOrEqualTo(2));

      // Logout other devices only
      final success = await notifier.logoutAllDevices(includeCurrent: false);
      expect(success, isTrue);

      // Only 1 session left: current mobile session
      expect(notifier.state.activeSessions.length, equals(1));
      expect(notifier.state.activeSessions.first.isCurrentDevice, isTrue);
      expect(notifier.state.activeSessions.first.isMobile, isTrue);
      expect(notifier.state.isLoggedIn, isTrue);
    });

    test('Logout all devices including current logs out mobile completely', () async {
      final notifier = AuthNotifier();
      await notifier.login('hafiz@streamflix.id', 'password123', true);

      final success = await notifier.logoutAllDevices(includeCurrent: true);
      expect(success, isTrue);
      expect(notifier.state.isLoggedIn, isFalse);
      expect(notifier.state.activeSessions.isEmpty, isTrue);
    });
  });

  group('DeviceSecuritySheet Widget Tests', () {
    testWidgets('Renders Mobile and Web badges in DeviceSecuritySheet', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final notifier = AuthNotifier();
      notifier.state = notifier.state.copyWith(
        name: 'HAFIZ',
        email: 'hafiz@streamflix.id',
        isLoggedIn: true,
        activeSessions: AuthNotifier.generateDefaultSessions(
          currentDeviceName: 'Smartphone (Android)',
        ),
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith((ref) => notifier),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: DeviceSecuritySheet(),
            ),
          ),
        ),
      );

      await tester.pump();

      // Header title
      expect(find.text('Keamanan & Sesi Perangkat'), findsOneWidget);
      expect(find.text('Pembedaan Sesi Mobile dan Web Client'), findsOneWidget);

      // Section 1: Mobile Badge
      expect(find.text('PERANGKAT ANDA SAAT INI'), findsOneWidget);
      expect(find.text('MOBILE • INI'), findsOneWidget);

      // Section 2: Web Sessions
      expect(find.textContaining('PERANGKAT LAIN TERHUBUNG'), findsOneWidget);
      expect(find.text('WEB'), findsWidgets);
      expect(find.text('Google Chrome (Windows 11)'), findsOneWidget);

      // Action button
      expect(find.text('KELUARKAN SEMUA PERANGKAT WEB LAIN'), findsOneWidget);
    });
  });
}
