import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import '../../core/theme/app_theme.dart';
import '../../models/movie_model.dart';
import '../../providers/player_provider.dart';

class VideoPlayerScreen extends ConsumerStatefulWidget {
  final Movie movie;

  const VideoPlayerScreen({
    super.key,
    required this.movie,
  });

  @override
  ConsumerState<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends ConsumerState<VideoPlayerScreen> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;
  bool _showControls = true;
  Timer? _hideControlsTimer;
  bool _isFullscreen = false;
  bool _showSkipIntro = true;
  String _selectedAudio = 'Indonesia [Asli]';

  @override
  void initState() {
    super.initState();
    _initController();
  }

  void _initController() async {
    _controller = VideoPlayerController.networkUrl(
      Uri.parse(widget.movie.videoUrl),
    );

    try {
      await _controller.initialize();
      setState(() {
        _isInitialized = true;
      });
      _controller.play();
      _startHideTimer();
    } catch (e) {
      debugPrint('Video init error: $e');
    }

    _controller.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _hideControlsTimer?.cancel();
    _controller.dispose();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
    super.dispose();
  }

  void _startHideTimer() {
    _hideControlsTimer?.cancel();
    _hideControlsTimer = Timer(const Duration(seconds: 4), () {
      if (mounted && _controller.value.isPlaying) {
        setState(() {
          _showControls = false;
        });
      }
    });
  }

  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });
    if (_showControls) {
      _startHideTimer();
    }
  }

  void _skipSeconds(int seconds) {
    final current = _controller.value.position;
    final target = current + Duration(seconds: seconds);
    _controller.seekTo(target);
    _startHideTimer();
  }

  void _toggleFullscreen() {
    setState(() {
      _isFullscreen = !_isFullscreen;
    });
    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
    } else {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
      ]);
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);

    if (hours > 0) {
      return '$hours:${twoDigits(minutes)}:${twoDigits(seconds)}';
    } else {
      return '$minutes:${twoDigits(seconds)}';
    }
  }

  void _showAudioSubtitlesSheet(BuildContext context, PlayerSettings settings, PlayerNotifier notifier) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border.all(color: AppColors.glassBorder),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Audio & Subtitel',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      color: AppColors.surfaceVariant,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close_rounded, size: 18, color: Colors.white),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Audio Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AUDIO',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.tertiary,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildAudioSubOption(
                        title: 'Indonesia [Asli]',
                        isSelected: _selectedAudio == 'Indonesia [Asli]',
                        onTap: () {
                          setState(() => _selectedAudio = 'Indonesia [Asli]');
                          Navigator.pop(context);
                        },
                      ),
                      const SizedBox(height: 6),
                      _buildAudioSubOption(
                        title: 'English (Dolby 5.1)',
                        isSelected: _selectedAudio == 'English (Dolby 5.1)',
                        onTap: () {
                          setState(() => _selectedAudio = 'English (Dolby 5.1)');
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),

                // Subtitles Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SUBTITEL',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.tertiary,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _buildAudioSubOption(
                        title: 'Bahasa Indonesia (CC)',
                        isSelected: settings.subtitle == 'Bahasa Indonesia',
                        onTap: () {
                          notifier.setSubtitle('Bahasa Indonesia');
                          Navigator.pop(context);
                        },
                      ),
                      const SizedBox(height: 6),
                      _buildAudioSubOption(
                        title: 'English (CC)',
                        isSelected: settings.subtitle == 'English',
                        onTap: () {
                          notifier.setSubtitle('English');
                          Navigator.pop(context);
                        },
                      ),
                      const SizedBox(height: 6),
                      _buildAudioSubOption(
                        title: 'Mati',
                        isSelected: settings.subtitle == 'Nonaktif',
                        onTap: () {
                          notifier.setSubtitle('Nonaktif');
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAudioSubOption({
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.surfaceContainer : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? Colors.white : AppColors.onSurfaceVariant,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_rounded,
                color: AppColors.primary,
                size: 16,
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final playerSettings = ref.watch(playerProvider);
    final playerNotifier = ref.read(playerProvider.notifier);

    final position = _controller.value.position;
    final duration = _controller.value.duration;
    final isPlaying = _controller.value.isPlaying;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Cinematic Ambient Diffuse Glow Backdrop
          Positioned(
            top: -30,
            left: MediaQuery.of(context).size.width * 0.25,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primaryContainer.withValues(alpha: 0.25),
              ),
            ),
          ),
          Positioned(
            top: 140,
            left: -40,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.secondaryContainer.withValues(alpha: 0.3),
              ),
            ),
          ),
          Positioned(
            top: 100,
            right: -40,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.tertiaryContainer.withValues(alpha: 0.2),
              ),
            ),
          ),

          // 2. Video Player Stage
          Center(
            child: _isInitialized
                ? AspectRatio(
                    aspectRatio: _controller.value.aspectRatio,
                    child: VideoPlayer(_controller),
                  )
                : const CircularProgressIndicator(color: AppColors.primaryContainer),
          ),

          // 3. Active Ambient Glow Border Accent (Simulating dynamic perimeter diffusion)
          IgnorePointer(
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: AppColors.primaryContainer.withValues(alpha: 0.25),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryContainer.withValues(alpha: 0.18),
                    blurRadius: 36,
                    spreadRadius: 4,
                  ),
                ],
              ),
            ),
          ),

          // 4. Gesture Layer to toggle controls
          GestureDetector(
            onTap: _toggleControls,
            behavior: HitTestBehavior.translucent,
            child: const SizedBox.expand(),
          ),

          // 5. Top Watermark / Stream Quality Pill
          Positioned(
            top: 52,
            left: 16,
            child: IgnorePointer(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHighest.withValues(alpha: 0.65),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: [
                    Text(
                      '${widget.movie.title} (${playerSettings.resolution})',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.tertiaryFixed,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.primaryContainer,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 6. Interactive Player Controls (Animated Visibility)
          if (_showControls) ...[
            // Top Bar
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(8, 44, 8, 20),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Color(0xE60D0D17),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 22),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.movie.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.outfit(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          Row(
                            children: [
                              const Icon(Icons.schedule_rounded, color: AppColors.primary, size: 12),
                              const SizedBox(width: 4),
                              Text(
                                'Menit ${_formatDuration(position)}',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  color: AppColors.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.cast_rounded, color: Colors.white, size: 20),
                      onPressed: () {},
                    ),
                    GestureDetector(
                      onTap: () => _showAudioSubtitlesSheet(context, playerSettings, playerNotifier),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.subtitles_rounded, color: AppColors.tertiary, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              'ID (CC)',
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.troubleshoot_rounded,
                        color: playerSettings.isStatsForNerdsVisible
                            ? AppColors.tertiary
                            : Colors.white70,
                        size: 20,
                      ),
                      onPressed: playerNotifier.toggleStatsForNerds,
                    ),
                  ],
                ),
              ),
            ),

            // Center Gestural Controls (-10s, Big Play/Pause, +10s)
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Skip -10s
                  GestureDetector(
                    onTap: () => _skipSeconds(-10),
                    child: Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerHigh.withValues(alpha: 0.45),
                        shape: BoxShape.circle,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.replay_10_rounded, color: Colors.white, size: 26),
                          Text(
                            '-10s',
                            style: GoogleFonts.outfit(fontSize: 9, color: Colors.white70, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 24),

                  // Primary Play/Pause Button with Halo Glow
                  GestureDetector(
                    onTap: () {
                      if (isPlaying) {
                        _controller.pause();
                      } else {
                        _controller.play();
                      }
                      _startHideTimer();
                    },
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primaryContainer.withValues(alpha: 0.35),
                          ),
                        ),
                        Container(
                          width: 74,
                          height: 74,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primaryContainer,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryContainer.withValues(alpha: 0.6),
                                blurRadius: 24,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Icon(
                            isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                            color: Colors.white,
                            size: 42,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 24),

                  // Skip +10s
                  GestureDetector(
                    onTap: () => _skipSeconds(10),
                    child: Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerHigh.withValues(alpha: 0.45),
                        shape: BoxShape.circle,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.forward_10_rounded, color: Colors.white, size: 26),
                          Text(
                            '+10s',
                            style: GoogleFonts.outfit(fontSize: 9, color: Colors.white70, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Controls Layer
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(14, 20, 14, 28),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Color(0xFA0D0D17),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Skip Intro Pill Button
                    if (_showSkipIntro && position.inSeconds <= 45)
                      Align(
                        alignment: Alignment.centerRight,
                        child: GestureDetector(
                          onTap: () {
                            _skipSeconds(80);
                            setState(() => _showSkipIntro = false);
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceContainerHigh.withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.5),
                                  blurRadius: 10,
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Lewati Intro',
                                  style: GoogleFonts.outfit(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const Icon(Icons.fast_forward_rounded, color: Colors.white, size: 16),
                              ],
                            ),
                          ),
                        ),
                      ),

                    // Scrubber Slider Track
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        trackHeight: 4,
                        activeTrackColor: AppColors.primaryContainer,
                        inactiveTrackColor: AppColors.surfaceBright.withValues(alpha: 0.4),
                        thumbColor: AppColors.primaryContainer,
                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 7),
                        overlayColor: AppColors.primaryContainer.withValues(alpha: 0.3),
                      ),
                      child: Slider(
                        value: duration.inSeconds > 0
                            ? position.inSeconds.toDouble().clamp(0.0, duration.inSeconds.toDouble())
                            : 0.0,
                        min: 0.0,
                        max: duration.inSeconds > 0 ? duration.inSeconds.toDouble() : 1.0,
                        onChanged: (val) {
                          _controller.seekTo(Duration(seconds: val.toInt()));
                          _startHideTimer();
                        },
                      ),
                    ),

                    // Time labels
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _formatDuration(position),
                            style: GoogleFonts.outfit(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                          Text(
                            _formatDuration(duration),
                            style: GoogleFonts.outfit(fontSize: 12, color: AppColors.onSurfaceVariant),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 6),

                    // Action Row: Speed, Resolution, Next Episode, Fullscreen
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            // Playback speed menu
                            PopupMenuButton<double>(
                              initialValue: playerSettings.playbackSpeed,
                              onSelected: (speed) {
                                playerNotifier.setPlaybackSpeed(speed);
                                _controller.setPlaybackSpeed(speed);
                              },
                              color: AppColors.surfaceContainerHighest,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              itemBuilder: (context) => [
                                0.75,
                                1.0,
                                1.25,
                                1.5,
                                2.0,
                              ].map((s) => PopupMenuItem(
                                    value: s,
                                    child: Text('${s}x', style: GoogleFonts.outfit(color: Colors.white)),
                                  )).toList(),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceContainerHigh.withValues(alpha: 0.65),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  children: [
                                    Text(
                                      '${playerSettings.playbackSpeed}x',
                                      style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
                                    ),
                                    const SizedBox(width: 2),
                                    const Icon(Icons.expand_less_rounded, size: 14, color: Colors.white70),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Resolution selector menu
                            PopupMenuButton<String>(
                              initialValue: playerSettings.resolution,
                              onSelected: playerNotifier.setResolution,
                              color: AppColors.surfaceContainerHighest,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              itemBuilder: (context) => [
                                '4K UHD',
                                '1080p',
                                '720p',
                                'Auto',
                              ].map((r) => PopupMenuItem(
                                    value: r,
                                    child: Text(r, style: GoogleFonts.outfit(color: Colors.white)),
                                  )).toList(),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.tertiaryContainer.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  children: [
                                    Text(
                                      playerSettings.resolution,
                                      style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.tertiaryFixed),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.tune_rounded, size: 12, color: AppColors.tertiaryFixed),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),

                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.skip_next_rounded, color: Colors.white, size: 24),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Memuat episode berikutnya...'),
                                    backgroundColor: AppColors.primaryContainer,
                                  ),
                                );
                              },
                            ),
                            IconButton(
                              icon: Icon(
                                _isFullscreen ? Icons.fullscreen_exit_rounded : Icons.fullscreen_rounded,
                                color: Colors.white,
                                size: 24,
                              ),
                              onPressed: _toggleFullscreen,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],

          // 7. Toggleable 'Stats for Nerds' Glassmorphism Overlay Panel
          if (playerSettings.isStatsForNerdsVisible)
            Positioned(
              top: 70,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLowest.withValues(alpha: 0.88),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.glassBorder),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.7),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.analytics_rounded, color: AppColors.tertiary, size: 18),
                            const SizedBox(width: 6),
                            Text(
                              'Diagnostic Stream Stats',
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.tertiaryFixed,
                              ),
                            ),
                          ],
                        ),
                        GestureDetector(
                          onTap: playerNotifier.toggleStatsForNerds,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.surfaceVariant,
                            ),
                            child: const Icon(Icons.close_rounded, size: 16, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _buildStatCard('Bitrate Video', '18.4 Mbps'),
                        const SizedBox(width: 8),
                        _buildStatCard('Frame Rate', '60.000 fps'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _buildStatCard('Buffer Health', '48.2s (Optimal)'),
                        const SizedBox(width: 8),
                        _buildStatCard('Dropped Frames', '0 / 152,094'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerHigh.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Active Codecs', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary)),
                          Text('HEVC (Main 10) / Dolby Atmos', style: GoogleFonts.inter(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerHigh.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.inter(fontSize: 10, color: AppColors.textSecondary)),
            const SizedBox(height: 2),
            Text(value, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
          ],
        ),
      ),
    );
  }
}
