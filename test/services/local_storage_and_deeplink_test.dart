import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:liveeuy_mob/core/deeplink/deep_link_service.dart';
import 'package:liveeuy_mob/core/notification/notification_service.dart';
import 'package:liveeuy_mob/core/storage/local_storage_service.dart';
import 'package:liveeuy_mob/models/notification_model.dart';
import 'package:liveeuy_mob/models/user_settings_model.dart';
import 'package:liveeuy_mob/models/watch_progress_model.dart';
import 'package:liveeuy_mob/providers/auth_provider.dart';
import 'package:liveeuy_mob/providers/notification_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LocalStorageService Tests', () {
    late LocalStorageService storageService;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      storageService = LocalStorageService(prefs: prefs);
    });

    test('Saves and retrieves auth tokens and user session in secure storage', () async {
      await storageService.saveAuthTokens(
        accessToken: 'access_123',
        refreshToken: 'refresh_456',
      );

      final access = await storageService.getAccessToken();
      final refresh = await storageService.getRefreshToken();
      expect(access, equals('access_123'));
      expect(refresh, equals('refresh_456'));

      final session = {
        'name': 'Test User',
        'email': 'test@liveeuy.id',
        'isLoggedIn': true,
        'isVip': true,
      };
      await storageService.saveUserSession(session);

      final retrievedSession = await storageService.getUserSession();
      expect(retrievedSession?['name'], equals('Test User'));
      expect(retrievedSession?['isVip'], isTrue);

      await storageService.clearAuth();
      expect(await storageService.getAccessToken(), isNull);
      expect(await storageService.getUserSession(), isNull);
    });

    test('Saves and retrieves UserSettings correctly (offline-first)', () async {
      const customSettings = UserSettings(
        userId: 'u_test',
        streamingQuality: StreamingQuality.fhd1080,
        spatialAudio: false,
        autoSkipIntro: false,
        wifiOnlyDownload: false,
        notifications: true,
      );

      await storageService.saveUserSettings(customSettings);
      final loaded = storageService.getUserSettings();

      expect(loaded, isNotNull);
      expect(loaded?.streamingQuality, equals(StreamingQuality.fhd1080));
      expect(loaded?.spatialAudio, isFalse);
      expect(loaded?.autoSkipIntro, isFalse);
      expect(loaded?.wifiOnlyDownload, isFalse);
    });

    test('Saves and retrieves Watchlist and WatchProgress offline', () async {
      final ids = {'m1', 'm3', 'm_hero'};
      await storageService.saveWatchlistIds(ids);

      final loadedIds = storageService.getWatchlistIds();
      expect(loadedIds, equals(ids));

      final progressList = [
        const WatchProgress(
          userId: 'u1',
          mediaId: 'm1',
          progress: 0.75,
        ),
        const WatchProgress(
          userId: 'u1',
          mediaId: 'm_hero',
          progress: 0.30,
        ),
      ];
      await storageService.saveWatchProgressList(progressList);

      final loadedProgress = storageService.getWatchProgressList();
      expect(loadedProgress.length, equals(2));
      expect(loadedProgress[0].mediaId, equals('m1'));
      expect(loadedProgress[0].progress, equals(0.75));
    });

    test('Saves and restores notifications history and read status', () async {
      final notifs = [
        const NotificationItem(
          id: 'n1',
          title: 'Notif 1',
          message: 'Pesan 1',
          time: '5m',
          iconType: 'sparkles',
          isRead: true,
        ),
        const NotificationItem(
          id: 'n2',
          title: 'Notif 2',
          message: 'Pesan 2',
          time: '1h',
          iconType: 'flame',
          isRead: false,
        ),
      ];

      await storageService.saveNotifications(notifs);
      final loaded = storageService.getNotifications();

      expect(loaded.length, equals(2));
      expect(loaded[0].isRead, isTrue);
      expect(loaded[1].isRead, isFalse);
    });
  });

  group('DeepLinkService Tests', () {
    late DeepLinkService deepLinkService;

    setUp(() {
      deepLinkService = DeepLinkService();
    });

    test('Parses custom scheme liveeuy://media/:id', () {
      final parsed = deepLinkService.parse('liveeuy://media/m1');
      expect(parsed.target, equals(DeepLinkTarget.mediaDetail));
      expect(parsed.mediaId, equals('m1'));
    });

    test('Parses custom scheme liveeuy://watch/:id and liveeuy://player/:id', () {
      final parsed1 = deepLinkService.parse('liveeuy://watch/m_hero');
      expect(parsed1.target, equals(DeepLinkTarget.videoPlayer));
      expect(parsed1.mediaId, equals('m_hero'));

      final parsed2 = deepLinkService.parse('liveeuy://player/m2');
      expect(parsed2.target, equals(DeepLinkTarget.videoPlayer));
      expect(parsed2.mediaId, equals('m2'));
    });

    test('Parses search deep link with query parameters liveeuy://search?q=cyberpunk', () {
      final parsed = deepLinkService.parse('liveeuy://search?q=cyberpunk');
      expect(parsed.target, equals(DeepLinkTarget.search));
      expect(parsed.searchQuery, equals('cyberpunk'));
    });

    test('Parses universal App Links https://liveeuy.id/media/m3', () {
      final parsed = deepLinkService.parse('https://liveeuy.id/media/m3');
      expect(parsed.target, equals(DeepLinkTarget.mediaDetail));
      expect(parsed.mediaId, equals('m3'));
    });

    test('Parses collection and account deep links', () {
      final parsedCollection = deepLinkService.parse('liveeuy://collection');
      expect(parsedCollection.target, equals(DeepLinkTarget.collection));

      final parsedAccount = deepLinkService.parse('liveeuy://account');
      expect(parsedAccount.target, equals(DeepLinkTarget.account));

      final parsedLogin = deepLinkService.parse('liveeuy://login');
      expect(parsedLogin.target, equals(DeepLinkTarget.login));
    });

    test('Executes tab change callbacks when navigating deep links', () {
      int? navigatedTab;
      String? searchQuery;

      deepLinkService.onNavigateTab = (tab) => navigatedTab = tab;
      deepLinkService.onSearchQuery = (q) => searchQuery = q;

      final handledSearch = deepLinkService.handleDeepLink('liveeuy://search?q=gundala');
      expect(handledSearch, isTrue);
      expect(navigatedTab, equals(1)); // Tab 1 = Cari
      expect(searchQuery, equals('gundala'));

      final handledCollection = deepLinkService.handleDeepLink('liveeuy://collection');
      expect(handledCollection, isTrue);
      expect(navigatedTab, equals(2)); // Tab 2 = Koleksi

      final handledAccount = deepLinkService.handleDeepLink('liveeuy://account');
      expect(handledAccount, isTrue);
      expect(navigatedTab, equals(3)); // Tab 3 = Akun
    });
  });

  group('NotificationService & Provider Tests', () {
    late LocalStorageService storageService;
    late DeepLinkService deepLinkService;
    late NotificationService notificationService;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      storageService = LocalStorageService(prefs: prefs);
      deepLinkService = DeepLinkService();
      notificationService = NotificationService(
        storageService: storageService,
        deepLinkService: deepLinkService,
      );
    });

    test('Creates streaming notification cases with valid deep links', () {
      final episodeNotif = notificationService.createNewEpisodeNotification(
        seriesTitle: 'Cyberpunk Neo Nusantara',
        episodeTitle: 'Musim 2 Episode 1',
        mediaId: 'm_hero',
      );
      expect(episodeNotif.targetMediaId, equals('m_hero'));
      expect(episodeNotif.effectiveDeepLink, equals('liveeuy://media/m_hero'));

      final watchReminder = notificationService.createContinueWatchingReminder(
        movieTitle: 'Gundala',
        mediaId: 'm1',
        progressPercent: 0.65,
      );
      expect(watchReminder.effectiveDeepLink, equals('liveeuy://watch/m1'));

      final promoNotif = notificationService.createRecommendationNotification(
        title: 'Bayang di Balik Kabut',
        genre: 'Horor',
        mediaId: 'm3',
      );
      expect(promoNotif.effectiveDeepLink, equals('liveeuy://media/m3'));
    });

    test('NotificationNotifier persists read status and triggers deep link dispatch', () {
      int? navigatedTab;
      deepLinkService.onNavigateTab = (tab) => navigatedTab = tab;

      final notifier = NotificationNotifier(
        storageService: storageService,
        deepLinkService: deepLinkService,
      );

      expect(notifier.state.hasUnread, isTrue);
      notifier.markAllAsRead();
      expect(notifier.state.hasUnread, isFalse);

      final custom = const NotificationItem(
        id: 'test_n',
        title: 'Buka Koleksi',
        message: 'Tonton koleksi Anda',
        time: 'Baru',
        iconType: 'sparkles',
        deepLinkUrl: 'liveeuy://collection',
        isRead: false,
      );
      notifier.addNotification(custom);
      expect(notifier.state.hasUnread, isTrue);

      final opened = notifier.openNotification(custom);
      expect(opened, isTrue);
      expect(navigatedTab, equals(2)); // Navigates to collection tab
    });
  });

  group('AuthNotifier with LocalStorageService Tests', () {
    test('Logs in, saves session, and restores on next initialization', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final storage = LocalStorageService(prefs: prefs);

      final authNotifier = AuthNotifier(storage);
      expect(authNotifier.state.isLoggedIn, isFalse);

      await authNotifier.login('vip_aria@liveeuy.id', 'password123', true);
      expect(authNotifier.state.isLoggedIn, isTrue);
      expect(authNotifier.state.isVip, isTrue);

      // Verify token in secure storage
      final token = await storage.getAccessToken();
      expect(token, isNotNull);

      // Verify auto-restore
      final restoredNotifier = AuthNotifier(storage);
      await Future.delayed(const Duration(milliseconds: 50));
      expect(restoredNotifier.state.isLoggedIn, isTrue);
      expect(restoredNotifier.state.email, equals('vip_aria@liveeuy.id'));

      // Logout clears session
      authNotifier.logout();
      expect(authNotifier.state.isLoggedIn, isFalse);
      expect(await storage.getAccessToken(), isNull);
    });
  });
}
