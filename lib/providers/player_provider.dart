import 'package:get/get.dart';

const List<String> availableResolutions = [
  'Otomatis',
  '1080p FHD',
  '720p HD',
  '480p SD',
];

class PlayerSettingsController extends GetxController {
  final subtitle = 'Bahasa Indonesia'.obs;
  final resolution = 'Otomatis'.obs;
  final playbackSpeed = 1.0.obs;
  final isStatsForNerdsVisible = false.obs;
  final isAmbientGlowEnabled = false.obs;

  void setResolution(String res) => resolution.value = res;
  void setPlaybackSpeed(double speed) => playbackSpeed.value = speed;
  void setSubtitle(String sub) => subtitle.value = sub;
  void toggleStatsForNerds() => isStatsForNerdsVisible.value = !isStatsForNerdsVisible.value;
  void toggleAmbientGlow() => isAmbientGlowEnabled.value = !isAmbientGlowEnabled.value;
}

typedef PlayerNotifier = PlayerSettingsController;
