import 'dart:async';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../auth/presentation/controllers/auth_controller.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import '../../core/download/offline_download_manager.dart';
import '../../core/theme/app_theme.dart';
import '../../models/ad_model.dart';
import '../../models/download_item.dart';
import '../../models/episode_model.dart';
import '../../models/movie_model.dart';
import '../media/domain/repositories/media_repository.dart';
import '../../providers/ad_provider.dart';
import '../../providers/player_provider.dart';

class VideoPlayerScreen extends StatefulWidget {
  final Movie movie;
  final double? startProgress;
  final Duration? startPosition;
  final String? localFilePath;
  final DownloadItem? offlineItem;

  const VideoPlayerScreen({
    super.key,
    required this.movie,
    this.startProgress,
    this.startPosition,
    this.localFilePath,
    this.offlineItem,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;
  bool _showControls = true;
  Timer? _hideControlsTimer;
  bool _isFullscreen = false;
  bool _showSkipIntro = true;
  String _selectedAudio = 'Indonesia [Asli]';
  String? _resumeBannerText;
  Timer? _resumeBannerTimer;

  // Pre-roll Sponsor Ad State (Layer: video_preroll)
  bool _prerollActive = false;
  int _prerollCountdown = 5;
  Timer? _prerollTimer;
  AdCampaign? _activePrerollAd;
  bool _hasRecordedAdImpression = false;

  // Auto-Play Next Episode State (5s Countdown)
  bool _showAutoPlayNextOverlay = false;
  int _autoPlayCountdown = 5;
  Timer? _autoPlayTimer;
  Episode? _nextEpisode;

  // Offline Playback State (YouTube-Style Offline)
  bool _isOfflinePlayback = false;
  DownloadItem? _resolvedOfflineItem;

  @override
  void initState() {
    super.initState();
    if (widget.movie.seasons.isNotEmpty &&
        widget.movie.seasons.first.episodes.length > 1) {
      _nextEpisode = widget.movie.seasons.first.episodes[1];
    }
    _checkOfflineAndInit();
  }

  void _checkOfflineAndInit() {
    final downloadMgr = Get.find<OfflineDownloadManager>();
    final item = widget.offlineItem ?? downloadMgr.getDownload(widget.movie.id);

    if (item != null && (widget.localFilePath != null || File(item.localFilePath).existsSync())) {
      _resolvedOfflineItem = item;
      _isOfflinePlayback = true;

      if (item.isExpired) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showLicenseExpiredDialog(item);
        });
        return;
      }
    }

    _initController();
  }

  void _showLicenseExpiredDialog(DownloadItem item) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceContainerHigh,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.timer_off_rounded, color: AppColors.error, size: 24),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Lisensi Offline Kedaluwarsa',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.w700,
                  fontSize: 17,
                  color: AppColors.onSurface,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          'Tayangan offline ini telah melewati batas waktu 30 hari tanpa koneksi. Sambungkan perangkat ke internet untuk memperbarui lisensi hak tonton tanpa perlu mengunduh ulang file.',
          style: GoogleFonts.inter(
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: Text('Kembali', style: GoogleFonts.outfit(color: AppColors.outline)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Memperbarui lisensi offline ke server...'),
                  backgroundColor: AppColors.surfaceContainerHighest,
                ),
              );
              final success = await Get.find<OfflineDownloadManager>().renewLicense(item.id);
              if (success && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Lisensi berhasil diperpanjang 30 hari! Memulai video...'),
                    backgroundColor: AppColors.surfaceContainerHighest,
                  ),
                );
                _initController();
              } else if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Gagal memperbarui lisensi. Periksa koneksi internet Anda.'),
                    backgroundColor: AppColors.errorContainer,
                  ),
                );
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryContainer,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Perbarui Lisensi', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _showResumeBanner(String timeText) {
    if (!mounted) return;
    setState(() {
      _resumeBannerText = 'Melanjutkan dari menit $timeText';
    });
    _resumeBannerTimer?.cancel();
    _resumeBannerTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() {
          _resumeBannerText = null;
        });
      }
    });
  }

  void _initController() async {
    if (_isOfflinePlayback && _resolvedOfflineItem != null) {
      final filePath = widget.localFilePath ?? _resolvedOfflineItem!.localFilePath;
      _controller = VideoPlayerController.file(File(filePath));
    } else {
      final videoUri = Uri.parse(widget.movie.videoUrl);
      final isHls = widget.movie.videoUrl.contains('.m3u8') || widget.movie.videoUrl.contains('/transcoder/');
      _controller = VideoPlayerController.networkUrl(
        videoUri,
        formatHint: isHls ? VideoFormat.hls : null,
      );
    }

    final authCtrl = Get.find<AuthController>();
    final isVip = authCtrl.currentUser?.isVip ?? false;
    final adCtrl = Get.isRegistered<AdController>() ? Get.find<AdController>() : Get.put(AdController());
    // Unduhan offline bebas iklan (ad-free) seperti YouTube Premium
    final prerollAd = _isOfflinePlayback ? null : adCtrl.getPrerollAd(isVip);

    if (prerollAd != null) {
      _activePrerollAd = prerollAd;
      _prerollActive = true;
      _prerollCountdown = prerollAd.skipAfterSeconds;
      _startPrerollCountdown();
    }

    try {
      await _controller.initialize();
      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
      }

      if (widget.startPosition != null && widget.startPosition! > Duration.zero) {
        await _controller.seekTo(widget.startPosition!);
        _showResumeBanner(_formatDuration(widget.startPosition!));
      } else if (widget.startProgress != null && widget.startProgress! > 0.0) {
        final totalMs = _controller.value.duration.inMilliseconds;
        final targetMs = (totalMs * widget.startProgress!).clamp(0, totalMs).toInt();
        if (targetMs > 0) {
          final resumeDuration = Duration(milliseconds: targetMs);
          await _controller.seekTo(resumeDuration);
          _showResumeBanner(_formatDuration(resumeDuration));
        }
      }

      if (!_prerollActive) {
        _controller.play();
        _startHideTimer();
        _recordPlayInteraction();
      }
    } catch (e) {
      debugPrint('Video init error: $e');
    }

    _controller.addListener(() {
      if (mounted) {
        final pos = _controller.value.position;
        final dur = _controller.value.duration;
        if (dur > Duration.zero &&
            pos >= dur &&
            !_showAutoPlayNextOverlay &&
            _nextEpisode != null) {
          _triggerAutoPlayNext();
        }
        setState(() {});
      }
    });
  }

  void _startPrerollCountdown() {
    if (!_hasRecordedAdImpression && _activePrerollAd != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && !_hasRecordedAdImpression && _activePrerollAd != null) {
          Get.put(AdController()).recordImpression(_activePrerollAd!.id);
          _hasRecordedAdImpression = true;
        }
      });
    }
    _prerollTimer?.cancel();
    _prerollTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_prerollCountdown <= 1) {
        timer.cancel();
        setState(() {
          _prerollCountdown = 0;
        });
      } else {
        setState(() {
          _prerollCountdown -= 1;
        });
      }
    });
  }

  void _skipPreroll() {
    _prerollTimer?.cancel();
    setState(() {
      _prerollActive = false;
    });
    if (_isInitialized) {
      _controller.play();
      _startHideTimer();
      _recordPlayInteraction();
    }
  }

  void _recordPlayInteraction() {
    if (Get.isRegistered<MediaRepository>()) {
      Get.find<MediaRepository>().recordInteraction(mediaId: widget.movie.id, interactionType: 'play');
    }
  }

  void _onPrerollCtaClicked(AdCampaign ad) {
    Get.put(AdController()).recordClick(ad.id);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Membuka sponsor: ${ad.partnerName}',
          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
        ),
        backgroundColor: AppColors.surfaceContainerHigh,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  void dispose() {
    _autoPlayTimer?.cancel();
    _prerollTimer?.cancel();
    _resumeBannerTimer?.cancel();
    _hideControlsTimer?.cancel();
    _controller.dispose();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
    super.dispose();
  }

  void _triggerAutoPlayNext() {
    _autoPlayTimer?.cancel();
    setState(() {
      _showAutoPlayNextOverlay = true;
      _autoPlayCountdown = 5;
    });
    _autoPlayTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_autoPlayCountdown <= 1) {
        timer.cancel();
        _playNextEpisode();
      } else {
        setState(() {
          _autoPlayCountdown--;
        });
      }
    });
  }

  void _cancelAutoPlayNext() {
    _autoPlayTimer?.cancel();
    setState(() {
      _showAutoPlayNextOverlay = false;
      _autoPlayCountdown = 5;
    });
  }

  void _playNextEpisode() async {
    _autoPlayTimer?.cancel();
    setState(() {
      _showAutoPlayNextOverlay = false;
    });
    if (_nextEpisode != null) {
      final nextVideoUrl = _nextEpisode!.videoUrl.isNotEmpty
          ? _nextEpisode!.videoUrl
          : widget.movie.videoUrl;
      try {
        _controller.pause();
        await _controller.dispose();
        _controller = VideoPlayerController.networkUrl(Uri.parse(nextVideoUrl));
        await _controller.initialize();
        _controller.play();
        if (mounted) {
          setState(() {
            _isInitialized = true;
          });
          _showResumeBanner('Episode ${_nextEpisode!.episodeNumber}');
        }
      } catch (e) {
        debugPrint('Error loading next episode: $e');
      }
    }
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

  void _showAudioSubtitlesSheet(BuildContext context, PlayerSettingsController player) {
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
                        isSelected: player.subtitle.value == 'Bahasa Indonesia',
                        onTap: () {
                          player.setSubtitle('Bahasa Indonesia');
                          Navigator.pop(context);
                        },
                      ),
                      const SizedBox(height: 6),
                      _buildAudioSubOption(
                        title: 'English (CC)',
                        isSelected: player.subtitle.value == 'English',
                        onTap: () {
                          player.setSubtitle('English');
                          Navigator.pop(context);
                        },
                      ),
                      const SizedBox(height: 6),
                      _buildAudioSubOption(
                        title: 'Mati',
                        isSelected: player.subtitle.value == 'Nonaktif',
                        onTap: () {
                          player.setSubtitle('Nonaktif');
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
    final player = Get.put(PlayerSettingsController());

    final position = _controller.value.position;
    final duration = _controller.value.duration;
    final isPlaying = _controller.value.isPlaying;

    return Obx(() {
      return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Video Player Stage
          Center(
            child: _isInitialized
                ? AspectRatio(
                    aspectRatio: _controller.value.aspectRatio,
                    child: VideoPlayer(_controller),
                  )
                : const CircularProgressIndicator(color: AppColors.primaryContainer),
          ),

          // 2. Gesture Layer to toggle controls
          if (!_prerollActive)
            GestureDetector(
              onTap: _toggleControls,
              behavior: HitTestBehavior.translucent,
              child: const SizedBox.expand(),
            ),

          // 3. Resume Floating Banner
          if (!_prerollActive && _resumeBannerText != null)
            Positioned(
              top: 52,
              left: 20,
              right: 20,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHigh.withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.primaryContainer.withValues(alpha: 0.6),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.5),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.history_rounded, color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        _resumeBannerText!,
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // 4. Interactive Player Controls (Animated Visibility)
          if (!_prerollActive && _showControls) ...[
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
                      onTap: () => _showAudioSubtitlesSheet(context, player),
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
                        color: player.isStatsForNerdsVisible.value
                            ? AppColors.tertiary
                            : Colors.white70,
                        size: 20,
                      ),
                      onPressed: player.toggleStatsForNerds,
                    ),
                  ],
                ),
              ),
            ),

            // Center Gestural Controls (-10s, Play/Pause, +10s)
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Skip -10s
                  GestureDetector(
                    onTap: () => _skipSeconds(-10),
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.45),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.12),
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.replay_10_rounded, color: Colors.white, size: 22),
                          Text(
                            '-10s',
                            style: GoogleFonts.outfit(fontSize: 8, color: Colors.white70, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 28),

                  // Primary Play/Pause Button
                  GestureDetector(
                    onTap: () {
                      if (isPlaying) {
                        _controller.pause();
                      } else {
                        _controller.play();
                      }
                      _startHideTimer();
                    },
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.black.withValues(alpha: 0.55),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Icon(
                        isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                        color: Colors.white,
                        size: 36,
                      ),
                    ),
                  ),
                  const SizedBox(width: 28),

                  // Skip +10s
                  GestureDetector(
                    onTap: () => _skipSeconds(10),
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.45),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.12),
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.forward_10_rounded, color: Colors.white, size: 22),
                          Text(
                            '+10s',
                            style: GoogleFonts.outfit(fontSize: 8, color: Colors.white70, fontWeight: FontWeight.w700),
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
                              initialValue: player.playbackSpeed.value,
                              onSelected: (speed) {
                                player.setPlaybackSpeed(speed);
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
                                      '${player.playbackSpeed.value}x',
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
                              initialValue: player.resolution.value,
                              onSelected: player.setResolution,
                              color: AppColors.surfaceContainerHighest,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              itemBuilder: (context) => availableResolutions
                                  .map((r) => PopupMenuItem(
                                        value: r,
                                        child: Text(r, style: GoogleFonts.outfit(color: Colors.white)),
                                      ))
                                  .toList(),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.tertiaryContainer.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  children: [
                                    Text(
                                      player.resolution.value,
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
                              tooltip: 'Episode Berikutnya',
                              onPressed: () {
                                if (_nextEpisode != null) {
                                  _triggerAutoPlayNext();
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Ini adalah episode terakhir.'),
                                      backgroundColor: AppColors.surfaceContainerHigh,
                                    ),
                                  );
                                }
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
          if (player.isStatsForNerdsVisible.value)
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
                          onTap: player.toggleStatsForNerds,
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

          // 8. Auto-Play Next Episode Overlay (Countdown 5s)
          if (_showAutoPlayNextOverlay)
            Positioned(
              bottom: 40,
              right: 24,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerHigh.withValues(alpha: 0.96),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: AppColors.primaryContainer.withValues(alpha: 0.6),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.6),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.auto_awesome_motion_rounded, color: AppColors.primary, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'Episode Selanjutnya',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _nextEpisode != null
                          ? 'Episode ${_nextEpisode!.episodeNumber}: ${_nextEpisode!.title}'
                          : 'Memuat episode berikutnya...',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryContainer,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: _playNextEpisode,
                          icon: const Icon(Icons.play_arrow_rounded, size: 16, color: Colors.white),
                          label: Text(
                            'Putar Sekarang ($_autoPlayCountdown)',
                            style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                        const SizedBox(width: 8),
                        TextButton(
                          onPressed: _cancelAutoPlayNext,
                          child: Text(
                            'Batal',
                            style: GoogleFonts.outfit(fontSize: 12, color: Colors.white60),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

          // 9. Pre-Roll Ad Layer (when active)
          if (_prerollActive && _activePrerollAd != null)
            Positioned.fill(
              child: _buildPrerollOverlay(_activePrerollAd!),
            ),
        ],
      ),
    );
    });
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

  Widget _buildPrerollOverlay(AdCampaign ad) {
    final progress = ad.skipAfterSeconds > 0
        ? ((ad.skipAfterSeconds - _prerollCountdown) / ad.skipAfterSeconds).clamp(0.0, 1.0)
        : 1.0;
    final canSkip = _prerollCountdown == 0;

    return Container(
      color: Colors.black.withValues(alpha: 0.96),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 22),
                        onPressed: () => Navigator.pop(context),
                        tooltip: 'Kembali',
                      ),
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceContainerHigh,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppColors.glassBorder),
                        ),
                        child: Text(
                          'IKLAN SPONSOR',
                          style: GoogleFonts.outfit(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.tertiaryContainer.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.tertiary.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.workspace_premium_rounded, size: 14, color: AppColors.tertiaryFixed),
                        const SizedBox(width: 5),
                        Text(
                          'Bebas Iklan VIP',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.tertiaryFixed,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (ad.bannerUrl.isNotEmpty) ...[
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxHeight: 200),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: AspectRatio(
                            aspectRatio: 16 / 9,
                            child: CachedNetworkImage(
                              imageUrl: ad.bannerUrl,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                color: AppColors.surfaceContainer,
                                child: const Center(
                                  child: SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryContainer),
                                  ),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: AppColors.surfaceContainer,
                                child: const Icon(Icons.broken_image_rounded, color: AppColors.onSurfaceVariant),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            ad.badge.isNotEmpty ? ad.badge : 'SPONSORED',
                            style: GoogleFonts.outfit(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white70,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          ad.partnerName,
                          style: GoogleFonts.outfit(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      ad.headline,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ad.description,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.onSurfaceVariant,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 14),
                    OutlinedButton.icon(
                      onPressed: () => _onPrerollCtaClicked(ad),
                      icon: const Icon(Icons.open_in_new_rounded, size: 14, color: Colors.white),
                      label: Text(
                        ad.ctaText,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppColors.primaryContainer.withValues(alpha: 0.8)),
                        backgroundColor: AppColors.surfaceContainerHigh.withValues(alpha: 0.6),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [Color(0xF0000000), Colors.transparent],
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 3,
                      backgroundColor: AppColors.surfaceBright.withValues(alpha: 0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryContainer),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Video segera diputar...',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                      GestureDetector(
                        onTap: canSkip ? _skipPreroll : null,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: canSkip ? Colors.white : AppColors.surfaceContainerHighest.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: canSkip ? Colors.white : AppColors.glassBorder,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                canSkip ? 'Lewati Iklan' : 'Dapat dilewati dalam ${_prerollCountdown}d',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: canSkip ? Colors.black : Colors.white60,
                                ),
                              ),
                              if (canSkip) ...[
                                const SizedBox(width: 4),
                                const Icon(Icons.skip_next_rounded, size: 16, color: Colors.black),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

