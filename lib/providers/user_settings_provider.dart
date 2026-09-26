import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_provider.dart';
import '../core/network/api_service.dart';
import '../core/storage/local_storage_service.dart';
import '../models/user_settings_model.dart';

class UserSettingsNotifier extends StateNotifier<UserSettings> {
  final ApiService? _apiService;
  final LocalStorageService? _storageService;

  UserSettingsNotifier([this._apiService, this._storageService])
      : super(const UserSettings()) {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    // 1. Load dari Local Storage terlebih dahulu (Instant Offline-First)
    if (_storageService != null) {
      try {
        final cached = _storageService.getUserSettings();
        if (cached != null) {
          state = cached;
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('[UserSettingsNotifier] Gagal membaca storage lokal: $e');
        }
      }
    }

    // 2. Sinkronisasi dengan backend jika API tersedia
    if (_apiService == null) return;
    try {
      final remoteSettings = await _apiService.getUserSettings();
      state = remoteSettings;
      _storageService?.saveUserSettings(remoteSettings);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[UserSettingsNotifier] Menggunakan pengaturan lokal default: $e');
      }
    }
  }

  Future<void> _saveAndSync(UserSettings newSettings) async {
    state = newSettings;
    // Persist lokal langsung
    await _storageService?.saveUserSettings(newSettings);

    // Sinkronisasi ke backend jika online
    if (_apiService == null) return;
    try {
      await _apiService.updateUserSettings(newSettings);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[UserSettingsNotifier] Gagal sinkronisasi pengaturan ke backend: $e');
      }
    }
  }

  void setStreamingQuality(StreamingQuality quality) {
    _saveAndSync(state.copyWith(streamingQuality: quality));
  }

  void setSpatialAudio(bool enabled) {
    _saveAndSync(state.copyWith(spatialAudio: enabled));
  }

  void setAutoSkipIntro(bool enabled) {
    _saveAndSync(state.copyWith(autoSkipIntro: enabled));
  }

  void setWifiOnlyDownload(bool enabled) {
    _saveAndSync(state.copyWith(wifiOnlyDownload: enabled));
  }

  void setNotifications(bool enabled) {
    _saveAndSync(state.copyWith(notifications: enabled));
  }

  void clearCache() {
    _saveAndSync(state.copyWith(cacheSizeBytes: 0));
  }
}

final userSettingsProvider =
    StateNotifierProvider<UserSettingsNotifier, UserSettings>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  LocalStorageService? storage;
  try {
    storage = ref.watch(localStorageServiceProvider);
  } catch (_) {}
  return UserSettingsNotifier(apiService, storage);
});
