import 'package:flutter_riverpod/flutter_riverpod.dart';

class PlayerSettings {
  final String resolution; // 'Otomatis', '1080p FHD', '720p HD', '480p SD'
  final double playbackSpeed; // 0.75, 1.0, 1.25, 1.5, 2.0
  final String subtitle; // 'Bahasa Indonesia', 'English', 'Japanese', 'Nonaktif'
  final bool isStatsForNerdsVisible;
  final bool isAmbientGlowEnabled;

  const PlayerSettings({
    this.resolution = 'Otomatis',
    this.playbackSpeed = 1.0,
    this.subtitle = 'Bahasa Indonesia',
    this.isStatsForNerdsVisible = false,
    this.isAmbientGlowEnabled = false,
  });

  PlayerSettings copyWith({
    String? resolution,
    double? playbackSpeed,
    String? subtitle,
    bool? isStatsForNerdsVisible,
    bool? isAmbientGlowEnabled,
  }) {
    return PlayerSettings(
      resolution: resolution ?? this.resolution,
      playbackSpeed: playbackSpeed ?? this.playbackSpeed,
      subtitle: subtitle ?? this.subtitle,
      isStatsForNerdsVisible: isStatsForNerdsVisible ?? this.isStatsForNerdsVisible,
      isAmbientGlowEnabled: isAmbientGlowEnabled ?? this.isAmbientGlowEnabled,
    );
  }
}

class PlayerNotifier extends StateNotifier<PlayerSettings> {
  PlayerNotifier() : super(const PlayerSettings());

  void setResolution(String res) {
    state = state.copyWith(resolution: res);
  }

  void setPlaybackSpeed(double speed) {
    state = state.copyWith(playbackSpeed: speed);
  }

  void setSubtitle(String sub) {
    state = state.copyWith(subtitle: sub);
  }

  void toggleStatsForNerds() {
    state = state.copyWith(isStatsForNerdsVisible: !state.isStatsForNerdsVisible);
  }

  void toggleAmbientGlow() {
    state = state.copyWith(isAmbientGlowEnabled: !state.isAmbientGlowEnabled);
  }
}

final playerProvider = StateNotifierProvider<PlayerNotifier, PlayerSettings>((ref) {
  return PlayerNotifier();
});

const List<String> availableResolutions = [
  'Otomatis',
  '1080p FHD',
  '720p HD',
  '480p SD',
];
