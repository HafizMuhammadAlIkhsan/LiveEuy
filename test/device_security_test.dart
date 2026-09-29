import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:liveeuy_mob/core/network/api_config.dart';
import 'package:liveeuy_mob/models/device_session_model.dart';
import 'package:liveeuy_mob/providers/auth_provider.dart';
import 'package:liveeuy_mob/shared/widgets/device_conflict_dialog.dart';
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

  group('DeviceCheckResult Model Tests', () {
    test('DeviceCheckResult.noConflict instantiates properly', () {
      final res = DeviceCheckResult.noConflict();
      expect(res.hasWebConflict, isFalse);
      expect(res.activeWebCount, equals(0));
      expect(res.conflictingSession, isNull);
      expect(res.message, contains('diizinkan login'));
    });

    test('DeviceCheckResult.conflict serializes and deserializes correctly', () {
      const session = DeviceSession(
        sessionId: 'sess-web-test',
        deviceName: 'Apple Safari (macOS)',
        deviceType: DeviceType.desktop,
        os: 'macOS Sequoia',
        browserOrApp: 'Safari 18',
        ipAddress: '10.0.0.1',
        location: 'Bandung, Indonesia',
        lastActive: '5 menit lalu',
        isCurrentDevice: false,
      );

      final conflict = DeviceCheckResult.conflict(session: session, activeWebCount: 2);
      expect(conflict.hasWebConflict, isTrue);
      expect(conflict.activeWebCount, equals(2));
      expect(conflict.conflictingSession?.deviceName, equals('Apple Safari (macOS)'));

      final json = conflict.toJson();
      expect(json['hasWebConflict'], isTrue);
      expect(json['activeWebCount'], equals(2));

      final parsed = DeviceCheckResult.fromJson(json);
      expect(parsed.hasWebConflict, isTrue);
      expect(parsed.conflictingSession?.sessionId, equals('sess-web-test'));
    });
  });

  group('Device Conflict Checker & Takeover Logic Tests', () {
    test('checkDeviceConflict detects conflict when account has active web session', () async {
      final notifier = AuthNotifier();

      // Alex has active web session registered by default
      final conflict = await notifier.checkDeviceConflict('alex@streamflix.id');
      expect(conflict.hasWebConflict, isTrue);
      expect(conflict.conflictingSession, isNotNull);
      expect(conflict.conflictingSession?.deviceName, contains('Google Chrome'));

      // Clean account without web session has no conflict
      final clean = await notifier.checkDeviceConflict('clean_user@streamflix.id');
      expect(clean.hasWebConflict, isFalse);
    });

    test('login is blocked when web session is active and forceTakeover is false', () async {
      final notifier = AuthNotifier();

      // Login attempt without takeover
      final success = await notifier.login('alex@streamflix.id', 'Password123!', true, forceTakeover: false);
      expect(success, isFalse);
      expect(notifier.state.isLoggedIn, isFalse);
    });

    test('login with forceTakeover=true revokes web session and sets mobile as sole session', () async {
      final notifier = AuthNotifier();

      // Force takeover
      final success = await notifier.login('alex@streamflix.id', 'Password123!', true, forceTakeover: true);
      expect(success, isTrue);
      expect(notifier.state.isLoggedIn, isTrue);

      // Web sessions revoked, only 1 current mobile session left
      expect(notifier.state.activeSessions.length, equals(1));
      expect(notifier.state.activeSessions.first.isCurrentDevice, isTrue);
      expect(notifier.state.activeSessions.first.isMobile, isTrue);

      // Subsequent conflict check returns no conflict
      final postCheck = await notifier.checkDeviceConflict('alex@streamflix.id');
      expect(postCheck.hasWebConflict, isFalse);
    });

    test('registerWebSession and clearWebSessions dynamically control conflict state', () async {
      final notifier = AuthNotifier();
      const testEmail = 'custom_device@test.id';

      expect((await notifier.checkDeviceConflict(testEmail)).hasWebConflict, isFalse);

      notifier.registerWebSession(testEmail);
      expect((await notifier.checkDeviceConflict(testEmail)).hasWebConflict, isTrue);

      notifier.clearWebSessions(testEmail);
      expect((await notifier.checkDeviceConflict(testEmail)).hasWebConflict, isFalse);
    });
  });

  group('DeviceConflictDialog Widget Tests', () {
    testWidgets('Renders conflict banner, web details, and triggers takeover callback', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      bool cancelled = false;
      bool takeoverTriggered = false;

      const session = DeviceSession(
        sessionId: 'sess-web-dialog',
        deviceName: 'Google Chrome (Windows 11)',
        deviceType: DeviceType.desktop,
        os: 'Windows 11 Pro',
        browserOrApp: 'Chrome 128',
        ipAddress: '180.252.164.218',
        location: 'Jakarta, Indonesia',
        lastActive: '10 menit yang lalu',
      );

      final conflictResult = DeviceCheckResult.conflict(session: session);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DeviceConflictDialog(
              conflictResult: conflictResult,
              onCancel: () => cancelled = true,
              onConfirmTakeover: () => takeoverTriggered = true,
            ),
          ),
        ),
      );

      await tester.pump();

      // Header and badge
      expect(find.text('KONFLIK SESI PERANGKAT'), findsOneWidget);
      expect(find.text('Akun Sedang Aktif di Web'), findsOneWidget);

      // Active web card details
      expect(find.text('Google Chrome (Windows 11)'), findsOneWidget);
      expect(find.text('WEB CLIENT'), findsOneWidget);
      expect(find.textContaining('180.252.164.218'), findsOneWidget);

      // Buttons
      expect(find.text('Batal'), findsOneWidget);
      expect(find.text('Keluarkan Web & Masuk'), findsOneWidget);

      // Tap takeover button
      await tester.tap(find.text('Keluarkan Web & Masuk'));
      await tester.pump();
      expect(takeoverTriggered, isTrue);

      // Tap cancel button
      await tester.tap(find.text('Batal'));
      await tester.pump();
      expect(cancelled, isTrue);
    });
  });
}

