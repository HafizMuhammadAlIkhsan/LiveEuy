import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:liveeuy_mob/core/deeplink/deep_link_service.dart';
import 'package:liveeuy_mob/core/network/api_client.dart';
import 'package:liveeuy_mob/core/network/api_service.dart';
import 'package:liveeuy_mob/features/auth/login_screen.dart';
import 'package:liveeuy_mob/main.dart';
import 'package:liveeuy_mob/providers/auth_provider.dart';

void main() {
  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  group('Milestone 1: Endpoint Paths & Quota Tests (Ref: dev-backend-auth)', () {
    test('ApiConfig has forgotPasswordPath and resetPasswordPath', () {
      expect(ApiConfig.forgotPasswordPath, equals('/auth/forgot-password'));
      expect(ApiConfig.resetPasswordPath, equals('/auth/reset-password'));
      expect(ApiConfig.changePasswordPath, equals('/auth/change-password'));
    });

    test('UserProfile maxAllowedDevices correctly maps DDD tier quotas', () {
      // 1. Free Guest -> 1 Perangkat
      const guestUser = UserProfile(
        name: 'Guest',
        email: 'guest@example.com',
        avatarUrl: '',
        isLoggedIn: true,
        membershipTier: 'Free Guest',
      );
      expect(guestUser.maxAllowedDevices, equals(1));

      // 2. VIP Standard -> 2 Perangkat
      const standardUser = UserProfile(
        name: 'Standard User',
        email: 'user@example.com',
        avatarUrl: '',
        isLoggedIn: true,
        membershipTier: 'VIP Standard',
      );
      expect(standardUser.maxAllowedDevices, equals(2));

      // 3. VIP Cinema Ultra -> 4 Perangkat
      const ultraUser = UserProfile(
        name: 'Ultra User',
        email: 'ultra@example.com',
        avatarUrl: '',
        isLoggedIn: true,
        membershipTier: 'VIP Cinema Ultra',
      );
      expect(ultraUser.maxAllowedDevices, equals(4));

      // 4. Regular default -> 1 Perangkat
      const regularUser = UserProfile(
        name: 'Regular',
        email: 'reg@example.com',
        avatarUrl: '',
        isLoggedIn: true,
        membershipTier: 'REGULAR',
      );
      expect(regularUser.maxAllowedDevices, equals(1));
    });

    test('ApiService supports forgotPassword, resetPassword, and changePassword matching contract', () async {
      final mockClient = MockClient((request) async {
        if (request.url.path.endsWith('/auth/forgot-password')) {
          expect(request.method, equals('POST'));
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['email'], equals('test@liveeuy.id'));
          return http.Response(
            jsonEncode({'success': true, 'message': 'Tautan pemulihan terkirim'}),
            200,
          );
        }

        if (request.url.path.endsWith('/auth/reset-password')) {
          expect(request.method, equals('POST'));
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['token'], equals('rst-tok-12345'));
          expect(body['newPassword'], equals('NewPassword#2026'));
          return http.Response(
            jsonEncode({'success': true, 'message': 'Kata sandi berhasil direset'}),
            200,
          );
        }

        if (request.url.path.endsWith('/auth/change-password')) {
          expect(request.method, equals('PUT'));
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['currentPassword'], equals('OldPassword#2026'));
          expect(body['newPassword'], equals('NewPassword#2026'));
          return http.Response(
            jsonEncode({'success': true, 'message': 'Kata sandi berhasil diubah'}),
            200,
          );
        }

        return http.Response('{"error": "not found"}', 404);
      });

      final apiClient = ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1');
      final apiService = ApiService(client: apiClient, authClient: apiClient);

      final forgotRes = await apiService.forgotPassword('test@liveeuy.id');
      expect(forgotRes.success, isTrue);

      final resetRes = await apiService.resetPassword(
        token: 'rst-tok-12345',
        newPassword: 'NewPassword#2026',
      );
      expect(resetRes.success, isTrue);

      final changeRes = await apiService.changePassword(
        oldPassword: 'OldPassword#2026',
        newPassword: 'NewPassword#2026',
      );
      expect(changeRes, isTrue);
    });

    test('AuthNotifier executes forgotPassword, resetPassword, and changePassword methods', () async {
      final container = ProviderContainer();
      final notifier = container.read(authProvider.notifier);

      final forgotSuccess = await notifier.forgotPassword('user@liveeuy.id');
      expect(forgotSuccess, isTrue);

      final resetSuccess = await notifier.resetPassword(
        token: 'rst-tok-9988',
        newPassword: 'SecurePassword#2026',
      );
      expect(resetSuccess, isTrue);

      final changeSuccess = await notifier.changePassword(
        currentPassword: 'CurrentPass#2026',
        newPassword: 'NewPassword#2027',
      );
      expect(changeSuccess, isTrue);
    });
  });

  group('Milestone 1: UI Interactive Forgot Password & Reset Tests', () {
    testWidgets('Tapping Lupa Password opens modal, navigates step 1 to step 2, and resets password', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // 1. Verify "Lupa Password?" is displayed and tap it
      final forgotPasswordBtn = find.text('Lupa Password?');
      expect(forgotPasswordBtn, findsOneWidget);
      await tester.tap(forgotPasswordBtn);
      await tester.pumpAndSettle();

      // 2. Verify modal sheet is opened with title "Lupa Kata Sandi"
      expect(find.text('Lupa Kata Sandi'), findsOneWidget);
      expect(find.byKey(const Key('forgot_password_email_field')), findsOneWidget);
      expect(find.byKey(const Key('forgot_password_send_link_button')), findsOneWidget);

      // 3. Enter email and tap "Kirim Tautan / Token"
      await tester.enterText(
        find.byKey(const Key('forgot_password_email_field')),
        'hafiz@liveeuy.id',
      );
      await tester.tap(find.byKey(const Key('forgot_password_send_link_button')));
      await tester.pumpAndSettle();

      // 4. Verify step 2 is displayed
      expect(find.text('Setel Ulang Sandi'), findsOneWidget);
      expect(find.byKey(const Key('forgot_password_token_field')), findsOneWidget);
      expect(find.byKey(const Key('forgot_password_new_pass_field')), findsOneWidget);
      expect(find.byKey(const Key('forgot_password_confirm_pass_field')), findsOneWidget);

      // 5. Enter token & new passwords and submit
      await tester.enterText(
        find.byKey(const Key('forgot_password_token_field')),
        'rst-tok-8472910485',
      );
      await tester.enterText(
        find.byKey(const Key('forgot_password_new_pass_field')),
        'PasswordBaru#2026',
      );
      await tester.enterText(
        find.byKey(const Key('forgot_password_confirm_pass_field')),
        'PasswordBaru#2026',
      );
      await tester.tap(find.byKey(const Key('forgot_password_submit_button')));
      await tester.pumpAndSettle();

      // 6. Verify modal is closed and toast is shown
      expect(find.text('Setel Ulang Sandi'), findsNothing);
      expect(find.text('Kata Sandi Berhasil Direset'), findsOneWidget);
    });

    testWidgets('Ganti Kata Sandi tile in Akun tab opens dialog and submits password change', (tester) async {
      tester.view.physicalSize = const Size(1080, 2800);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final container = ProviderContainer();
      // Set user as logged in
      container.read(authProvider.notifier).demoLogin('hafiz');

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const LiveEuyApp(),
        ),
      );
      await tester.pump(const Duration(milliseconds: 200));

      // 1. Navigate to AKUN tab
      await tester.tap(find.text('AKUN'));
      await tester.pump(const Duration(milliseconds: 300));

      // 2. Find Ganti Kata Sandi tile and tap it
      final changePasswordTile = find.text('Ganti Kata Sandi');
      expect(changePasswordTile, findsOneWidget);
      await tester.ensureVisible(changePasswordTile);
      await tester.pump(const Duration(milliseconds: 200));
      await tester.tap(changePasswordTile);
      await tester.pump(const Duration(milliseconds: 300));

      // 3. Verify dialog is open
      expect(find.byKey(const Key('change_password_current_field')), findsOneWidget);
      expect(find.byKey(const Key('change_password_new_field')), findsOneWidget);
      expect(find.byKey(const Key('change_password_confirm_field')), findsOneWidget);

      // 4. Fill in passwords
      await tester.enterText(
        find.byKey(const Key('change_password_current_field')),
        'OldSecretPassword#2026',
      );
      await tester.enterText(
        find.byKey(const Key('change_password_new_field')),
        'NewUltraSecret#2026',
      );
      await tester.enterText(
        find.byKey(const Key('change_password_confirm_field')),
        'NewUltraSecret#2026',
      );

      // 5. Submit
      await tester.tap(find.byKey(const Key('change_password_submit_button')));
      await tester.pump(const Duration(milliseconds: 400));

      // Verify dialog is closed and success snackbar is shown
      expect(find.text('Kata sandi berhasil diperbarui.'), findsOneWidget);
    });
  });

  group('Milestone 1: Registration Flow & PIN Verification Tests (Ref: dev-frontend)', () {
    test('AuthNotifier verifyRegistrationPin and register with securityPin stores PIN', () async {
      final container = ProviderContainer();
      final notifier = container.read(authProvider.notifier);

      // Invalid PINs
      expect(await notifier.verifyRegistrationPin('user@test.id', '12'), isFalse);
      expect(await notifier.verifyRegistrationPin('user@test.id', 'abcd'), isFalse);
      expect(await notifier.verifyRegistrationPin('user@test.id', '12345'), isFalse);

      // Valid 4-digit PIN (matching frontend FamilyProfilesModal demo standard)
      expect(await notifier.verifyRegistrationPin('user@test.id', '1234'), isTrue);

      // Register with security PIN
      final registered = await notifier.register(
        'Budi Pratama',
        'budi@streamflix.id',
        'Password#2026',
        'VIP Standard',
        '1234',
      );
      expect(registered, isTrue);

      final user = container.read(authProvider);
      expect(user.isLoggedIn, isTrue);
      expect(user.name, equals('Budi Pratama'));
      expect(user.email, equals('budi@streamflix.id'));
      expect(user.securityPin, equals('1234'));

      // setSecurityPin updates PIN
      notifier.setSecurityPin('5678');
      expect(container.read(authProvider).securityPin, equals('5678'));
    });

    testWidgets('Registration triggers PIN verification sheet, validates PIN, and completes registration', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final container = ProviderContainer();

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const MaterialApp(
            home: LoginScreen(initialTabIndex: 1),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify form fields
      expect(find.byKey(const Key('daftar_name_field')), findsOneWidget);
      expect(find.byKey(const Key('daftar_email_field')), findsOneWidget);
      expect(find.byKey(const Key('daftar_pass_field')), findsOneWidget);
      expect(find.byKey(const Key('daftar_submit_button')), findsOneWidget);

      // Enter details
      await tester.enterText(find.byKey(const Key('daftar_name_field')), 'Ahmad Faisal');
      await tester.enterText(find.byKey(const Key('daftar_email_field')), 'ahmad@streamflix.id');
      await tester.enterText(find.byKey(const Key('daftar_pass_field')), 'SecretPass#2026');
      await tester.pumpAndSettle();

      // Tap submit button to trigger PIN verification sheet
      await tester.tap(find.byKey(const Key('daftar_submit_button')));
      await tester.pumpAndSettle();

      // Verify PIN verification sheet is shown
      expect(find.text('Verifikasi PIN Akun'), findsOneWidget);
      expect(find.byKey(const Key('register_pin_input_field')), findsOneWidget);
      expect(find.byKey(const Key('register_pin_demo_button')), findsOneWidget);
      expect(find.byKey(const Key('register_pin_submit_button')), findsOneWidget);

      // Tap demo button to auto-fill 1234
      await tester.tap(find.byKey(const Key('register_pin_demo_button')));
      await tester.pumpAndSettle();

      // Verify PIN input has '1234'
      final pinField = tester.widget<TextField>(find.byKey(const Key('register_pin_input_field')));
      expect(pinField.controller?.text, equals('1234'));

      // Tap submit on PIN sheet
      await tester.tap(find.byKey(const Key('register_pin_submit_button')));
      await tester.pumpAndSettle();

      // Verify sheet is dismissed
      expect(find.text('Verifikasi PIN Akun'), findsNothing);

      // Verify user state
      final user = container.read(authProvider);
      expect(user.isLoggedIn, isTrue);
      expect(user.securityPin, equals('1234'));
      expect(user.name, equals('Ahmad Faisal'));
    });

    testWidgets('Forgot password sheet Step 2 quick demo token fills and resets password', (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Lupa Password
      await tester.tap(find.text('Lupa Password?'));
      await tester.pumpAndSettle();

      // Switch directly to Step 2 using switch button
      await tester.tap(find.byKey(const Key('forgot_password_switch_step_button')));
      await tester.pumpAndSettle();

      // Tap demo token button
      expect(find.byKey(const Key('forgot_password_demo_token_button')), findsOneWidget);
      await tester.tap(find.byKey(const Key('forgot_password_demo_token_button')));
      await tester.pumpAndSettle();

      // Verify pre-filled values
      final tokenField = tester.widget<TextField>(find.byKey(const Key('forgot_password_token_field')));
      expect(tokenField.controller?.text, equals('123456'));

      // Submit reset
      await tester.tap(find.byKey(const Key('forgot_password_submit_button')));
      await tester.pumpAndSettle();

      // Verify modal is closed and toast is shown
      expect(find.text('Setel Ulang Sandi'), findsNothing);
      expect(find.text('Kata Sandi Berhasil Direset'), findsOneWidget);
    });
  });

  group('Frontend Parity: Verify Email Pin, Resend Verification, and Auth Deep Links (Ref: dev-frontend)', () {
    test('ApiConfig contains verifyEmailPath and resendVerificationPath', () {
      expect(ApiConfig.verifyEmailPath, equals('/auth/verify-email'));
      expect(ApiConfig.resendVerificationPath, equals('/auth/resend-verification'));
    });

    test('ApiService supports verifyEmailPin and resendVerificationPin matching frontend api.ts', () async {
      final mockClient = MockClient((request) async {
        if (request.url.path.endsWith('/auth/verify-email')) {
          expect(request.method, equals('POST'));
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['email'], equals('test@liveeuy.id'));
          expect(body['pin'], equals('123456'));
          return http.Response(
            jsonEncode({'success': true, 'message': 'Email verified'}),
            200,
          );
        }
        if (request.url.path.endsWith('/auth/resend-verification')) {
          expect(request.method, equals('POST'));
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['email'], equals('test@liveeuy.id'));
          return http.Response(
            jsonEncode({'success': true, 'message': 'Pin resent'}),
            200,
          );
        }
        return http.Response('{"error": "not found"}', 404);
      });

      final apiClient = ApiClient(httpClient: mockClient, baseUrl: 'http://localhost:8080/api/v1');
      final apiService = ApiService(client: apiClient, authClient: apiClient);

      final verifyRes = await apiService.verifyEmailPin(
        email: 'test@liveeuy.id',
        pin: '123456',
      );
      expect(verifyRes.success, isTrue);

      final resendRes = await apiService.resendVerificationPin('test@liveeuy.id');
      expect(resendRes.success, isTrue);
    });

    test('AuthNotifier executes verifyEmailPin and resendVerificationPin with 4-6 digits', () async {
      final container = ProviderContainer();
      final notifier = container.read(authProvider.notifier);

      expect(await notifier.verifyEmailPin('user@liveeuy.id', '1234'), isTrue);
      expect(await notifier.verifyEmailPin('user@liveeuy.id', '123456'), isTrue);
      expect(await notifier.verifyEmailPin('user@liveeuy.id', '12'), isFalse);
      expect(await notifier.verifyEmailPin('user@liveeuy.id', '12345'), isFalse);
      expect(await notifier.verifyEmailPin('user@liveeuy.id', 'abcdef'), isFalse);

      expect(await notifier.resendVerificationPin('user@liveeuy.id'), isTrue);
    });

    test('DeepLinkService parses forgot-password, reset-password, and verify-email targets', () {
      final service = DeepLinkService();

      // Custom scheme
      final parsedForgot = service.parse('liveeuy://forgot-password');
      expect(parsedForgot.target, equals(DeepLinkTarget.forgotPassword));

      final parsedReset = service.parse('liveeuy://reset-password?token=tok-abc-999');
      expect(parsedReset.target, equals(DeepLinkTarget.resetPassword));
      expect(parsedReset.queryParameters['token'], equals('tok-abc-999'));

      final parsedVerify = service.parse('liveeuy://verify-email?email=user@liveeuy.id&pin=654321');
      expect(parsedVerify.target, equals(DeepLinkTarget.verifyEmail));
      expect(parsedVerify.queryParameters['email'], equals('user@liveeuy.id'));
      expect(parsedVerify.queryParameters['pin'], equals('654321'));

      // Universal / App links
      final parsedWebReset = service.parse('https://liveeuy.id/reset-password?token=tok-web-777');
      expect(parsedWebReset.target, equals(DeepLinkTarget.resetPassword));
      expect(parsedWebReset.queryParameters['token'], equals('tok-web-777'));

      final parsedWebVerify = service.parse('https://liveeuy.id/verify-email?email=web@liveeuy.id&pin=112233');
      expect(parsedWebVerify.target, equals(DeepLinkTarget.verifyEmail));
      expect(parsedWebVerify.queryParameters['email'], equals('web@liveeuy.id'));
      expect(parsedWebVerify.queryParameters['pin'], equals('112233'));
    });
  });
}
