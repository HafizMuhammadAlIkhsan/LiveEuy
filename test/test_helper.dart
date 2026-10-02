import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:liveeuy_mob/core/network/api_client.dart';
import 'package:liveeuy_mob/core/network/api_service.dart';
import 'package:liveeuy_mob/core/storage/local_storage_service.dart';
import 'package:liveeuy_mob/core/storage/offline_storage_service.dart';
import 'package:liveeuy_mob/core/download/offline_download_manager.dart';
import 'package:liveeuy_mob/features/auth/data/datasources/auth_local_datasource.dart';
import 'package:liveeuy_mob/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:liveeuy_mob/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:liveeuy_mob/features/auth/data/models/user_model.dart';
import 'package:liveeuy_mob/models/device_session_model.dart';
import 'package:liveeuy_mob/features/auth/domain/repositories/auth_repository.dart';
import 'package:liveeuy_mob/features/auth/domain/usecases/demo_login_usecase.dart';
import 'package:liveeuy_mob/features/auth/domain/usecases/login_usecase.dart';
import 'package:liveeuy_mob/features/auth/domain/usecases/logout_usecase.dart';
import 'package:liveeuy_mob/features/auth/domain/usecases/register_usecase.dart';
import 'package:liveeuy_mob/features/auth/presentation/controllers/auth_controller.dart';
import 'package:liveeuy_mob/features/main_navigation/controllers/main_navigation_controller.dart';
import 'package:liveeuy_mob/features/media/data/datasources/media_local_datasource.dart';
import 'package:liveeuy_mob/features/media/data/datasources/media_remote_datasource.dart';
import 'package:liveeuy_mob/features/media/data/repositories/media_repository_impl.dart';
import 'package:liveeuy_mob/features/media/domain/repositories/media_repository.dart';
import 'package:liveeuy_mob/features/media/domain/usecases/add_review_usecase.dart';
import 'package:liveeuy_mob/features/media/domain/usecases/get_all_media_usecase.dart';
import 'package:liveeuy_mob/features/media/domain/usecases/toggle_watchlist_usecase.dart';
import 'package:liveeuy_mob/features/media/presentation/controllers/home_controller.dart';
import 'package:liveeuy_mob/providers/ad_provider.dart';
import 'package:liveeuy_mob/providers/auth_provider.dart';
import 'package:liveeuy_mob/providers/media_provider.dart';
import 'package:liveeuy_mob/providers/notification_provider.dart';
import 'package:liveeuy_mob/providers/player_provider.dart';
import 'package:liveeuy_mob/providers/search_provider.dart';
import 'package:liveeuy_mob/providers/user_settings_provider.dart';

MockClient createTestMockHttpClient() {
  return MockClient((request) async {
    final path = request.url.path;
    if (path.contains('/user/settings')) {
      return http.Response(
        jsonEncode({
          'success': true,
          'data': {
            'streamingQuality': 'FHD_1080P',
            'cacheSizeBytes': 0,
            'autoSkipIntro': true,
            'wifiOnlyDownload': true,
          },
        }),
        200,
        headers: {'content-type': 'application/json'},
      );
    }
    if (path.contains('/user/watchlist')) {
      return http.Response(
        jsonEncode({'success': true, 'data': []}),
        200,
        headers: {'content-type': 'application/json'},
      );
    }
    if (path.contains('/user/progress')) {
      return http.Response(
        jsonEncode({'success': true, 'data': []}),
        200,
        headers: {'content-type': 'application/json'},
      );
    }
    if (path.contains('/media')) {
      return http.Response(
        jsonEncode({
          'success': true,
          'data': {
            'content': [],
            'totalElements': 0,
            'totalPages': 0,
          },
        }),
        200,
        headers: {'content-type': 'application/json'},
      );
    }
    return http.Response(
      jsonEncode({'success': true, 'data': {}}),
      200,
      headers: {'content-type': 'application/json'},
    );
  });
}

Future<void> initTestDependencies({
  bool isVip = false,
  String tier = 'REGULAR',
  String name = 'Test User',
  String email = 'test@liveeuy.id',
  bool isLoggedIn = true,
  Map<String, Object> initialPrefs = const {},
  http.Client? customHttpClient,
}) async {
  Get.reset();
  GoogleFonts.config.allowRuntimeFetching = false;
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(
    const MethodChannel('plugins.it_nomads.com/flutter_secure_storage'),
    (MethodCall methodCall) async {
      return null;
    },
  );
  SharedPreferences.setMockInitialValues(Map<String, Object>.from(initialPrefs));
  final prefs = await SharedPreferences.getInstance();
  final storageService = LocalStorageService(prefs: prefs);
  Get.put<LocalStorageService>(storageService, permanent: true);

  final httpClient = customHttpClient ?? createTestMockHttpClient();
  final authClient = ApiClient(baseUrl: ApiConfig.authBaseUrl, httpClient: httpClient);
  final catalogClient = ApiClient(baseUrl: ApiConfig.catalogBaseUrl, httpClient: httpClient);
  Get.put<ApiClient>(authClient, permanent: true);

  final apiService = ApiService(authClient: authClient, catalogClient: catalogClient);
  Get.put<ApiService>(apiService, permanent: true);

  final offlineStorage = OfflineStorageService();
  Get.put<OfflineStorageService>(offlineStorage, permanent: true);
  Get.put<OfflineDownloadManager>(
    OfflineDownloadManager(storageService: offlineStorage, apiService: apiService),
    permanent: true,
  );

  final authRemoteDS = AuthRemoteDataSourceImpl(client: authClient);
  final authLocalDS = AuthLocalDataSourceImpl(storageService: storageService);
  final authRepo = AuthRepositoryImpl(
    remoteDataSource: authRemoteDS,
    localDataSource: authLocalDS,
  );
  Get.put<AuthRepository>(authRepo, permanent: true);

  final authController = AuthController(
    loginUseCase: LoginUseCase(authRepo),
    registerUseCase: RegisterUseCase(authRepo),
    demoLoginUseCase: DemoLoginUseCase(authRepo),
    logoutUseCase: LogoutUseCase(authRepo),
    repository: authRepo,
  );

  if (isLoggedIn) {
    final userModel = UserModel(
      name: name,
      email: email,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      isLoggedIn: true,
      isVip: isVip,
      membershipTier: tier,
      rememberMe: true,
      activeSessions: [
        const DeviceSession(
          sessionId: 'sess-mob-current',
          deviceName: 'Smartphone (Android)',
          deviceType: DeviceType.mobile,
          os: 'Android 14',
          browserOrApp: 'LiveEuy Mobile App v2.4',
          ipAddress: '182.253.14.82',
          location: 'Jakarta Selatan, Indonesia',
          lastActive: 'Aktif Sekarang',
          isCurrentDevice: true,
        ),
        const DeviceSession(
          sessionId: 'sess-web-01',
          deviceName: 'Google Chrome (Windows 11)',
          deviceType: DeviceType.desktop,
          os: 'Windows 11 Pro',
          browserOrApp: 'Google Chrome v128',
          ipAddress: '180.252.164.218',
          location: 'Jakarta, Indonesia',
          lastActive: '10 menit yang lalu',
          isCurrentDevice: false,
        ),
      ],
    );
    await authLocalDS.cacheUser(userModel);
    authController.user.value = userModel;
    authController.isLoggedIn.value = true;
    authController.isVip.value = isVip;
  } else {
    authController.user.value = null;
    authController.isLoggedIn.value = false;
    authController.isVip.value = false;
  }
  Get.put<AuthController>(authController, permanent: true);

  final authNotifier = AuthNotifier(storageService, authClient);
  authNotifier.state = UserProfile(
    name: name,
    email: email,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    isLoggedIn: isLoggedIn,
    isVip: isVip,
    membershipTier: tier,
  );
  Get.put<AuthNotifier>(authNotifier, permanent: true);

  final mediaRemoteDS = MediaRemoteDataSourceImpl(apiService: apiService);
  final mediaLocalDS = MediaLocalDataSourceImpl(storageService: storageService);
  final mediaRepo = MediaRepositoryImpl(
    remoteDataSource: mediaRemoteDS,
    localDataSource: mediaLocalDS,
  );
  Get.put<MediaRepository>(mediaRepo, permanent: true);

  final homeController = HomeController(
    getAllMediaUseCase: GetAllMediaUseCase(mediaRepo),
    toggleWatchlistUseCase: ToggleWatchlistUseCase(mediaRepo),
    addReviewUseCase: AddReviewUseCase(mediaRepo),
    repository: mediaRepo,
    localDataSource: mediaLocalDS,
  );
  Get.put<HomeController>(homeController, permanent: true);

  Get.put<MainNavigationController>(MainNavigationController(), permanent: true);
  Get.put<UserSettingsController>(UserSettingsController(apiService, storageService), permanent: true);
  Get.put<NotificationController>(NotificationController(storageService: storageService), permanent: true);
  Get.put<NotificationNotifier>(NotificationNotifier(storageService: storageService), permanent: true);
  Get.put<AdController>(AdController(), permanent: true);
  Get.put<PlayerSettingsController>(PlayerSettingsController(), permanent: true);
  Get.put<AppSearchController>(AppSearchController(), permanent: true);
  Get.put<SearchNotifier>(SearchNotifier(), permanent: true);
  Get.put<MediaNotifier>(MediaNotifier(storageService: storageService, apiService: apiService), permanent: true);
}
