import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../core/network/api_service.dart';
import '../core/storage/local_storage_service.dart';
import '../models/user_settings_model.dart';

class UserSettingsController extends GetxController {
  final ApiService? _apiService;
  final LocalStorageService? _storageService;

  final Rx<UserSettings> _settings = const UserSettings().obs;

  UserSettings get state => _settings.value;
  set state(UserSettings val) => _settings.value = val;

  UserSettingsController([this._apiService, this._storageService]);

  @override
  void onInit() {
    super.onInit();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final storage = _storageService ?? (Get.isRegistered<LocalStorageService>() ? Get.find<LocalStorageService>() : null);
    if (storage != null) {
      try {
        final cached = storage.getUserSettings();
        if (cached != null) {
          _settings.value = cached;
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('[UserSettingsController] Gagal membaca storage lokal: $e');
        }
      }
    }

    final api = _apiService ?? (Get.isRegistered<ApiService>() ? Get.find<ApiService>() : null);
    if (api == null) return;
    try {
      final remoteSettings = await api.getUserSettings();
      _settings.value = remoteSettings;
      storage?.saveUserSettings(remoteSettings);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[UserSettingsController] Menggunakan pengaturan lokal default: $e');
      }
    }
  }

  Future<void> _saveAndSync(UserSettings newSettings) async {
    _settings.value = newSettings;
    final storage = _storageService ?? (Get.isRegistered<LocalStorageService>() ? Get.find<LocalStorageService>() : null);
    await storage?.saveUserSettings(newSettings);

    final api = _apiService ?? (Get.isRegistered<ApiService>() ? Get.find<ApiService>() : null);
    if (api == null) return;
    try {
      await api.updateUserSettings(newSettings);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[UserSettingsController] Gagal sinkronisasi pengaturan ke backend: $e');
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

typedef UserSettingsNotifier = UserSettingsController;
