import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/movie_model.dart';

class HeroShowcaseBanner extends StatefulWidget {
  final List<Movie> heroMovies;
  final bool isActive;
  final ValueChanged<Movie> onPlay;
  final ValueChanged<Movie> onDetail;
  final ValueChanged<Movie> onToggleWatchlist;
  final bool Function(Movie movie) isBookmarked;

  const HeroShowcaseBanner({
    super.key,
    required this.heroMovies,
    this.isActive = true,
    required this.onPlay,
    required this.onDetail,
    required this.onToggleWatchlist,
    required this.isBookmarked,
  });

  @override
  State<HeroShowcaseBanner> createState() => _HeroShowcaseBannerState();
}

class _HeroShowcaseBannerState extends State<HeroShowcaseBanner> {
  static const Duration _maxSlideDuration = Duration(seconds: 15);
  static const int _virtualMultiplier = 1000;

  late PageController _pageController;
  int _activeMovieIndex = 0;
  int _currentPage = 0;
  bool _isMuted = true;

  VideoPlayerController? _videoController;
  bool _isVideoInitialized = false;
  bool _isVideoVisible = false;

  Timer? _playbackTicker;
  Duration _elapsedSlideDuration = Duration.zero;
  Duration _currentSlideTargetDuration = _maxSlideDuration;
  final ValueNotifier<double> _progressNotifier = ValueNotifier<double>(0.0);

  int _loadSessionId = 0;
  bool _isUserInteracting = false;

  @override
  void initState() {
    super.initState();
    _initControllerAndStart();
  }

  void _initControllerAndStart() {
    if (widget.heroMovies.isEmpty) return;

    if (widget.heroMovies.length == 1) {
      _currentPage = 0;
      _activeMovieIndex = 0;
      _pageController = PageController(initialPage: 0);
    } else {
      final startPage =
          (_virtualMultiplier ~/ 2) * widget.heroMovies.length;
      _currentPage = startPage;
      _activeMovieIndex = 0;
      _pageController = PageController(initialPage: startPage);
    }

    _startSlideForCurrentMovie();
  }

  @override
  void didUpdateWidget(covariant HeroShowcaseBanner oldWidget) {
    super.didUpdateWidget(oldWidget);

    final moviesChanged = widget.heroMovies.length != oldWidget.heroMovies.length ||
        (widget.heroMovies.isNotEmpty &&
            oldWidget.heroMovies.isNotEmpty &&
            widget.heroMovies.first.id != oldWidget.heroMovies.first.id);

    if (moviesChanged) {
      _cleanupCurrentSlide();
      _initControllerAndStart();
      return;
    }

    if (widget.isActive != oldWidget.isActive) {
      if (widget.isActive) {
        _resumeCurrentSlide();
      } else {
        _pauseCurrentSlide();
      }
    }
  }

  void _cleanupCurrentSlide() {
    _playbackTicker?.cancel();
    _playbackTicker = null;
    final oldController = _videoController;
    _videoController = null;
    oldController?.dispose();
    _isVideoInitialized = false;
    _isVideoVisible = false;
    _progressNotifier.value = 0.0;
  }

  void _pauseCurrentSlide() {
    _playbackTicker?.cancel();
    _playbackTicker = null;
    _videoController?.pause();
  }

  void _resumeCurrentSlide() {
    if (!mounted || widget.heroMovies.isEmpty) return;
    if (_videoController != null && _isVideoInitialized) {
      _videoController?.setVolume(_isMuted ? 0.0 : 1.0);
      _videoController?.play();
    }
    _startTicker();
  }

  void _startSlideForCurrentMovie() {
    if (!mounted || widget.heroMovies.isEmpty) return;

    _cleanupCurrentSlide();

    final sessionId = ++_loadSessionId;
    _elapsedSlideDuration = Duration.zero;
    _currentSlideTargetDuration = _maxSlideDuration;

    if (!widget.isActive) return;

    final movie = widget.heroMovies[_activeMovieIndex];
    if (movie.videoUrl.isNotEmpty) {
      final controller = VideoPlayerController.networkUrl(
        Uri.parse(movie.videoUrl),
      );
      _videoController = controller;

      controller.initialize().then((_) {
        if (!mounted || sessionId != _loadSessionId) {
          controller.dispose();
          return;
        }

        controller.setVolume(_isMuted ? 0.0 : 1.0);
        controller.play();

        // If the video's total duration is shorter than 15s, use video duration as target
        final dur = controller.value.duration;
        if (dur > Duration.zero && dur < _maxSlideDuration) {
          _currentSlideTargetDuration = dur;
        }

        setState(() {
          _isVideoInitialized = true;
        });

        // Smooth fade-in of video once playback begins
        Future.delayed(const Duration(milliseconds: 100), () {
          if (mounted && sessionId == _loadSessionId) {
            setState(() {
              _isVideoVisible = true;
            });
          }
        });
      }).catchError((err) {
        debugPrint('Hero trailer playback failed: $err');
      });
    }

    _startTicker();
  }

  void _startTicker() {
    _playbackTicker?.cancel();

    _playbackTicker = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (!mounted || !widget.isActive || _isUserInteracting) return;

      _elapsedSlideDuration += const Duration(milliseconds: 50);

      bool trailerCompleted = false;

      if (_videoController != null && _videoController!.value.isInitialized) {
        final pos = _videoController!.value.position;
        final dur = _videoController!.value.duration;

        if (dur > Duration.zero && dur < _maxSlideDuration) {
          _currentSlideTargetDuration = dur;
        }

        if (dur > Duration.zero && pos >= (dur - const Duration(milliseconds: 250))) {
          trailerCompleted = true;
        }
      }

      // Check auto-slide conditions:
      // 1. Trailer has ended
      // 2. OR max 15 seconds have elapsed
      if (trailerCompleted || _elapsedSlideDuration >= _currentSlideTargetDuration) {
        timer.cancel();
        _progressNotifier.value = 1.0;
        _advanceToNextSlide();
        return;
      }

      final progress = (_currentSlideTargetDuration.inMilliseconds > 0)
          ? (_elapsedSlideDuration.inMilliseconds / _currentSlideTargetDuration.inMilliseconds)
              .clamp(0.0, 1.0)
          : 0.0;
      _progressNotifier.value = progress;
    });
  }

  void _advanceToNextSlide() {
    if (!mounted || widget.heroMovies.length <= 1) return;

    if (_pageController.hasClients) {
      final nextPage = _currentPage + 1;
      _pageController.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 650),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  void _onPageChanged(int page) {
    _currentPage = page;
    final newIndex = page % widget.heroMovies.length;
    if (newIndex != _activeMovieIndex) {
      setState(() {
        _activeMovieIndex = newIndex;
      });
      _startSlideForCurrentMovie();
    }
  }

  void _goToMovieIndex(int index) {
    if (widget.heroMovies.length <= 1 || index == _activeMovieIndex) return;

    final diff = index - _activeMovieIndex;
    final targetPage = _currentPage + diff;

    if (_pageController.hasClients) {
      _pageController.animateToPage(
        targetPage,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutCubic,
      );
    }
  }

  void _toggleMute() {
    setState(() {
      _isMuted = !_isMuted;
    });
    _videoController?.setVolume(_isMuted ? 0.0 : 1.0);

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isMuted ? 'Suara latar dibisukan' : 'Suara latar diaktifkan',
        ),
        duration: const Duration(seconds: 1),
        backgroundColor: AppColors.surfaceContainerHigh,
      ),
    );
  }

  @override
  void dispose() {
    _playbackTicker?.cancel();
    _videoController?.dispose();
    _pageController.dispose();
    _progressNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.heroMovies.isEmpty) return const SizedBox.shrink();

    final isSingle = widget.heroMovies.length == 1;
    final itemCount = isSingle
        ? 1
        : widget.heroMovies.length * _virtualMultiplier;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.85),
              blurRadius: 40,
              offset: const Offset(0, 16),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: AspectRatio(
            aspectRatio: 4 / 5,
            child: NotificationListener<ScrollNotification>(
              onNotification: (notification) {
                if (notification is ScrollStartNotification &&
                    notification.dragDetails != null) {
                  _isUserInteracting = true;
                  _playbackTicker?.cancel();
                } else if (notification is ScrollEndNotification) {
                  _isUserInteracting = false;
                  _startTicker();
                }
                return false;
              },
              child: PageView.builder(
                controller: _pageController,
                physics: isSingle
                    ? const NeverScrollableScrollPhysics()
                    : const BouncingScrollPhysics(),
                itemCount: itemCount,
                onPageChanged: _onPageChanged,
                itemBuilder: (context, index) {
                  final movieIndex = index % widget.heroMovies.length;
                  final movie = widget.heroMovies[movieIndex];
                  final isCurrent = movieIndex == _activeMovieIndex;
                  return _buildHeroSlide(movie, isCurrent);
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroSlide(Movie movie, bool isCurrent) {
    final isBookmarked = widget.isBookmarked(movie);

    return Stack(
      fit: StackFit.expand,
      children: [
        // 1. Poster Backdrop Image (Always present as primary/fallback visual)
        CachedNetworkImage(
          imageUrl: movie.backdropUrl,
          fit: BoxFit.cover,
          alignment: Alignment.topCenter,
          placeholder: (context, url) =>
              Container(color: AppColors.surfaceContainerLow),
          errorWidget: (context, url, err) =>
              Container(color: AppColors.surfaceContainerLow),
        ),

        // 2. Live Trailer Video Player Layer (Fades in over poster when ready)
        if (isCurrent && _isVideoInitialized && _videoController != null)
          AnimatedOpacity(
            opacity: _isVideoVisible ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 350),
            child: SizedBox.expand(
              child: FittedBox(
                fit: BoxFit.cover,
                clipBehavior: Clip.hardEdge,
                child: SizedBox(
                  width: _videoController!.value.size.width > 0
                      ? _videoController!.value.size.width
                      : 16,
                  height: _videoController!.value.size.height > 0
                      ? _videoController!.value.size.height
                      : 9,
                  child: VideoPlayer(_videoController!),
                ),
              ),
            ),
          ),

        // 3. Cinematic Vignette & Gradient Overlays
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  AppColors.surfaceContainerLowest,
                  Color(0x990D0D17),
                  Colors.transparent,
                ],
                stops: [0.0, 0.45, 0.85],
              ),
            ),
          ),
        ),
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  Color(0xCC0D0D17),
                  Colors.transparent,
                ],
                stops: [0.0, 0.6],
              ),
            ),
          ),
        ),
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0x800D0D17),
                  Colors.transparent,
                ],
                stops: [0.0, 0.25],
              ),
            ),
          ),
        ),

        // 4. Top Header Row: Top 1 Hari Ini Badge & Trailer Indicator + Sound Toggle
        Positioned(
          top: 14,
          left: 14,
          right: 14,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Badge: Top Hari Ini + Live Trailer Indicator
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryContainer
                              .withValues(alpha: 0.5),
                          blurRadius: 12,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.local_fire_department_rounded,
                          color: Colors.white,
                          size: 14,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          movie.top10Rank != null
                              ? 'TOP ${movie.top10Rank} HARI INI'
                              : 'TOP 1 HARI INI',
                          style: GoogleFonts.outfit(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isCurrent && _isVideoInitialized && _isVideoVisible) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFFFF3B30),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'TRAILER',
                            style: GoogleFonts.outfit(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),

              // Sound Toggle Button
              GestureDetector(
                onTap: _toggleMute,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHighest
                        .withValues(alpha: 0.65),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.15),
                      width: 0.8,
                    ),
                  ),
                  child: Icon(
                    _isMuted
                        ? Icons.volume_off_rounded
                        : Icons.volume_up_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ),
            ],
          ),
        ),

        // 5. Bottom Overlay: Story-style Progress Indicator, Meta, Title, Synopsis, Buttons
        Positioned(
          bottom: 16,
          left: 16,
          right: 16,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Segmented Carousel Progress Bar (Instagram / Netflix Stories style)
              if (widget.heroMovies.length > 1) ...[
                _buildSegmentedProgressBar(),
                const SizedBox(height: 12),
              ],

              // Meta Row (Cocok, Year, Rating, Badges, Duration)
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const NeverScrollableScrollPhysics(),
                child: Row(
                  children: [
                    Text(
                      '${movie.matchScore.toInt()}% Cocok',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF46D369),
                      ),
                    ),
                    _buildDotSeparator(),
                    Text(
                      '${movie.releaseYear}',
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white70,
                      ),
                    ),
                    _buildDotSeparator(),
                    _buildHeroMetaPill(movie.ageRating),
                    if (movie.resolutionBadges.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      _buildHeroMetaPill(
                        movie.resolutionBadges.firstWhere(
                          (b) => !b.toLowerCase().contains('atmos'),
                          orElse: () => '4K UHD',
                        ),
                      ),
                    ],
                    _buildDotSeparator(),
                    Text(
                      movie.durationOrSeasons,
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Title
              Text(
                movie.title,
                style: GoogleFonts.outfit(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.5,
                  height: 1.15,
                ),
              ),
              const SizedBox(height: 6),

              // Synopsis
              Text(
                movie.synopsis,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: Colors.white.withValues(alpha: 0.8),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 14),

              // Action Buttons Row: Putar, Koleksi Saya, Info
              Row(
                children: [
                  // Putar
                  Expanded(
                    flex: 4,
                    child: ElevatedButton(
                      onPressed: () => widget.onPlay(movie),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryContainer,
                        elevation: 3,
                        shadowColor: AppColors.primaryContainer
                            .withValues(alpha: 0.35),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.play_arrow_rounded,
                              color: Colors.white,
                              size: 20,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Putar',
                              style: GoogleFonts.outfit(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Koleksi Saya
                  Expanded(
                    flex: 5,
                    child: OutlinedButton(
                      onPressed: () => widget.onToggleWatchlist(movie),
                      style: OutlinedButton.styleFrom(
                        backgroundColor: AppColors.surfaceContainerHigh
                            .withValues(alpha: 0.9),
                        side: BorderSide(
                          color: AppColors.outlineVariant
                              .withValues(alpha: 0.35),
                          width: 1.0,
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isBookmarked
                                  ? Icons.check_rounded
                                  : Icons.add_rounded,
                              color: isBookmarked
                                  ? AppColors.tertiary
                                  : Colors.white,
                              size: 18,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Koleksi Saya',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: isBookmarked
                                    ? AppColors.tertiary
                                    : Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Info Detail Button
                  GestureDetector(
                    onTap: () => widget.onDetail(movie),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: AppColors.surfaceContainerHigh
                            .withValues(alpha: 0.85),
                        border: Border.all(
                          color: AppColors.outlineVariant
                              .withValues(alpha: 0.35),
                          width: 1.0,
                        ),
                      ),
                      child: const Icon(
                        Icons.info_outline_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSegmentedProgressBar() {
    return Row(
      children: List.generate(widget.heroMovies.length, (idx) {
        return Expanded(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => _goToMovieIndex(idx),
            child: Container(
              height: 12,
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 2.0),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(2),
                child: Container(
                  height: 3.5,
                  color: Colors.white.withValues(alpha: 0.28),
                  child: ValueListenableBuilder<double>(
                    valueListenable: _progressNotifier,
                    builder: (context, progress, child) {
                      double factor;
                      if (idx < _activeMovieIndex) {
                        factor = 1.0;
                      } else if (idx == _activeMovieIndex) {
                        factor = progress;
                      } else {
                        factor = 0.0;
                      }

                      return FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: factor,
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: factor > 0
                                ? [
                                    BoxShadow(
                                      color: AppColors.primaryContainer
                                          .withValues(alpha: 0.8),
                                      blurRadius: 4,
                                    ),
                                  ]
                                : null,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  Widget _buildDotSeparator() {
    return Container(
      width: 3.5,
      height: 3.5,
      margin: const EdgeInsets.symmetric(horizontal: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.45),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildHeroMetaPill(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.18),
          width: 0.8,
        ),
      ),
      child: Text(
        label,
        style: GoogleFonts.outfit(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: Colors.white.withValues(alpha: 0.9),
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}
