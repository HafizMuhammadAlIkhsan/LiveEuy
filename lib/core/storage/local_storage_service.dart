import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/notification_model.dart';
import '../../models/user_settings_model.dart';
import '../../models/watch_progress_model.dart';

/// Service penyimpanan lokal terpadu (Offline-First Architecture).
/// Memisahkan antara data kredensial/token (Secure Storage)
/// dan data preferensi/state offline aplikasi (SharedPreferences).
class LocalStorageService {
  final SharedPreferences _prefs;
  final FlutterSecureStorage _secureStorage;

  // Fallback in-memory map for headless tests where Keystore/Keychain is unavailable
  final Map<String, String> _inMemorySecureFallback = {};

  LocalStorageService({
    required SharedPreferences prefs,
    FlutterSecureStorage? secureStorage,
  })  : _prefs = prefs,
        _secureStorage = secureStorage ?? const FlutterSecureStorage();

  // Storage Keys
  static const String _keyAccessToken = 'auth_access_token';
  static const String _keyRefreshToken = 'auth_refresh_token';
  static const String _keyUserSession = 'auth_user_session';
  static const String _keyRememberMe = 'auth_remember_me';

  static const String _keyUserSettings = 'liveeuy_user_settings';
  static const String _keyWatchlistIds = 'liveeuy_watchlist_ids';
  static const String _keyWatchProgress = 'liveeuy_watch_progress';
  static const String _keyNotifications = 'liveeuy_notifications';

  // ===========================================================================
  // 1. SECURE STORAGE (Token & Kredensial Pengguna)
  // ===========================================================================

  Future<void> _writeSecure(String key, String? value) async {
    if (value == null) {
      _inMemorySecureFallback.remove(key);
      try {
        await _secureStorage.delete(key: key);
      } catch (e) {
        if (kDebugMode) debugPrint('[LocalStorage] Secure delete fallback: $e');
      }
      return;
    }

    _inMemorySecureFallback[key] = value;
    try {
      await _secureStorage.write(key: key, value: value);
    } catch (e) {
      if (kDebugMode) debugPrint('[LocalStorage] Secure write fallback: $e');
    }
  }

  Future<String?> _readSecure(String key) async {
    try {
      final value = await _secureStorage.read(key: key);
      if (value != null) return value;
    } catch (e) {
      if (kDebugMode) debugPrint('[LocalStorage] Secure read fallback: $e');
    }
    return _inMemorySecureFallback[key];
  }

  Future<void> saveAuthTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    await _writeSecure(_keyAccessToken, accessToken);
    if (refreshToken != null) {
      await _writeSecure(_keyRefreshToken, refreshToken);
    }
  }

  Future<String?> getAccessToken() => _readSecure(_keyAccessToken);
  Future<String?> getRefreshToken() => _readSecure(_keyRefreshToken);

  Future<void> saveUserSession(Map<String, dynamic> userSession) async {
    await _writeSecure(_keyUserSession, jsonEncode(userSession));
  }

  Future<Map<String, dynamic>?> getUserSession() async {
    final raw = await _readSecure(_keyUserSession);
    if (raw == null || raw.isEmpty) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> setRememberMe(bool remember) async {
    await _prefs.setBool(_keyRememberMe, remember);
  }

  bool getRememberMe() {
    return _prefs.getBool(_keyRememberMe) ?? true;
  }

  Future<void> clearAuth() async {
    await _writeSecure(_keyAccessToken, null);
    await _writeSecure(_keyRefreshToken, null);
    await _writeSecure(_keyUserSession, null);
  }

  // ===========================================================================
  // 2. USER SETTINGS (Preferensi Streaming & Perangkat)
  // ===========================================================================

  Future<void> saveUserSettings(UserSettings settings) async {
    await _prefs.setString(_keyUserSettings, jsonEncode(settings.toJson()));
  }

  UserSettings? getUserSettings() {
    final raw = _prefs.getString(_keyUserSettings);
    if (raw == null || raw.isEmpty) return null;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      return UserSettings.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  // ===========================================================================
  // 3. WATCHLIST (Koleksi Tontonan Offline-First)
  // ===========================================================================

  Future<void> saveWatchlistIds(Set<String> ids) async {
    await _prefs.setStringList(_keyWatchlistIds, ids.toList());
  }

  Set<String> getWatchlistIds() {
    final list = _prefs.getStringList(_keyWatchlistIds);
    if (list == null) return {};
    return list.toSet();
  }

  // ===========================================================================
  // 4. WATCH PROGRESS (Riwayat Continue Watching Offline-First)
  // ===========================================================================

  Future<void> saveWatchProgressList(List<WatchProgress> progressList) async {
    final rawList = progressList.map((p) => jsonEncode(p.toJson())).toList();
    await _prefs.setStringList(_keyWatchProgress, rawList);
  }

  List<WatchProgress> getWatchProgressList() {
    final rawList = _prefs.getStringList(_keyWatchProgress);
    if (rawList == null) return [];
    final results = <WatchProgress>[];
    for (final item in rawList) {
      try {
        final map = jsonDecode(item) as Map<String, dynamic>;
        results.add(WatchProgress.fromJson(map));
      } catch (_) {}
    }
    return results;
  }

  // ===========================================================================
  // 5. NOTIFICATIONS (Daftar & Status Notifikasi Offline-First)
  // ===========================================================================

  Future<void> saveNotifications(List<NotificationItem> items) async {
    final rawList = items.map((item) => jsonEncode(item.toJson())).toList();
    await _prefs.setStringList(_keyNotifications, rawList);
  }

  List<NotificationItem> getNotifications() {
    final rawList = _prefs.getStringList(_keyNotifications);
    if (rawList == null) return [];
    final results = <NotificationItem>[];
    for (final raw in rawList) {
      try {
        final map = jsonDecode(raw) as Map<String, dynamic>;
        results.add(NotificationItem.fromJson(map));
      } catch (_) {}
    }
    return results;
  }

  // ===========================================================================
  // 6. CLEAR ALL CACHE
  // ===========================================================================

  Future<void> clearAllAppData() async {
    await clearAuth();
    await _prefs.remove(_keyUserSettings);
    await _prefs.remove(_keyWatchlistIds);
    await _prefs.remove(_keyWatchProgress);
    await _prefs.remove(_keyNotifications);
  }
}

/// Global provider untuk LocalStorageService (nullable untuk mendukung unit/widget test)
final localStorageServiceProvider = Provider<LocalStorageService?>((ref) => null);

