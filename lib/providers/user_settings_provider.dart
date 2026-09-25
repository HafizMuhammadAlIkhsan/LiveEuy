import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/api_provider.dart';
import '../core/network/api_service.dart';
import '../models/user_settings_model.dart';

class UserSettingsNotifier extends StateNotifier<UserSettings> {
  final ApiService? _apiService;

  UserSettingsNotifier([this._apiService]) : super(const UserSettings()) {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    if (_apiService == null) return;
    try {
      final remoteSettings = await _apiService.getUserSettings();
      state = remoteSettings;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[UserSettingsNotifier] Menggunakan pengaturan lokal default: $e');
      }
    }
  }

  Future<void> _syncToBackend(UserSettings newSettings) async {
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
    state = state.copyWith(streamingQuality: quality);
    _syncToBackend(state);
  }

  void setSpatialAudio(bool enabled) {
    state = state.copyWith(spatialAudio: enabled);
    _syncToBackend(state);
  }

  void setAutoSkipIntro(bool enabled) {
    state = state.copyWith(autoSkipIntro: enabled);
    _syncToBackend(state);
  }

  void setWifiOnlyDownload(bool enabled) {
    state = state.copyWith(wifiOnlyDownload: enabled);
    _syncToBackend(state);
  }

  void setNotifications(bool enabled) {
    state = state.copyWith(notifications: enabled);
    _syncToBackend(state);
  }

  void clearCache() {
    state = state.copyWith(cacheSizeBytes: 0);
    _syncToBackend(state);
  }
}

final userSettingsProvider =
    StateNotifierProvider<UserSettingsNotifier, UserSettings>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return UserSettingsNotifier(apiService);
});
