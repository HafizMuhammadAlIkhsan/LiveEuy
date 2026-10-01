import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
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
}
