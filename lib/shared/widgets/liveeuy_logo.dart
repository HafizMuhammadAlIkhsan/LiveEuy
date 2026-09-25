import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

/// Logo brand LiveEuy yang diselaraskan 1:1 dengan desain di `dev-frontend` (React/Tailwind):
/// - Kotak squircle `rounded-xl` dengan gradien `brand-600` (#E11D48) ke `rose-400` (#FB7185)
/// - Ikon Play warna putih yang terpusat secara optik
/// - Teks 'Live' putih dan 'Euy' warna brand-500 (#F43F5E) dengan font Plus Jakarta Sans Extra-Bold
/// - Indikator live berkedip (pulsing ping dot)
/// - Subtitle 'CINEMA STREAM' berwarna slate-400
class LiveEuyLogo extends StatelessWidget {
  final double fontSize;
  final double? height;
  final bool showBadge;
  final bool showText;
  final bool? showSubtitle;
  final bool showLiveDot;

  const LiveEuyLogo({
    super.key,
    this.fontSize = 20.0,
    this.height,
    this.showBadge = true,
    this.showText = true,
    this.showSubtitle,
    this.showLiveDot = true,
  });

  @override
  Widget build(BuildContext context) {
    final double boxSize = height ?? (fontSize * 1.65);
    final double radius = boxSize * 0.28;
    final bool displaySubtitle = showSubtitle ?? (fontSize >= 19 && showText);

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (showBadge) ...[
          Container(
            width: boxSize,
            height: boxSize,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(radius),
              gradient: const LinearGradient(
                colors: [AppColors.brand600, AppColors.brand400],
                begin: Alignment.bottomLeft,
                end: Alignment.topRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.brand500.withValues(alpha: 0.35),
                  blurRadius: boxSize * 0.3,
                  offset: Offset(0, boxSize * 0.08),
                ),
              ],
            ),
            child: Center(
              child: Transform.translate(
                offset: Offset(boxSize * 0.04, 0),
                child: Icon(
                  Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: boxSize * 0.58,
                ),
              ),
            ),
          ),
          if (showText) SizedBox(width: fontSize * 0.45),
        ],
        if (showText) ...[
          if (displaySubtitle)
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    _buildBrandText(),
                    if (showLiveDot) ...[
                      SizedBox(width: fontSize * 0.22),
                      _LiveDot(size: fontSize * 0.32),
                    ],
                  ],
                ),
                Text(
                  'CINEMA STREAM',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: (fontSize * 0.4).clamp(9.0, 13.0),
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.8,
                    color: AppColors.brandSlate400,
                    height: 1.1,
                  ),
                ),
              ],
            )
          else
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _buildBrandText(),
                if (showLiveDot) ...[
                  SizedBox(width: fontSize * 0.22),
                  _LiveDot(size: fontSize * 0.32),
                ],
              ],
            ),
        ],
      ],
    );
  }

  Widget _buildBrandText() {
    return Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: 'Live',
            style: GoogleFonts.plusJakartaSans(
              fontSize: fontSize,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.4,
            ),
          ),
          TextSpan(
            text: 'Euy',
            style: GoogleFonts.plusJakartaSans(
              fontSize: fontSize,
              fontWeight: FontWeight.w800,
              color: AppColors.brand500,
              letterSpacing: -0.4,
            ),
          ),
        ],
      ),
    );
  }
}

class _LiveDot extends StatefulWidget {
  final double size;
  const _LiveDot({required this.size});

  @override
  State<_LiveDot> createState() => _LiveDotState();
}

class _LiveDotState extends State<_LiveDot> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double pingSize = widget.size * 1.8;
    return SizedBox(
      width: pingSize,
      height: pingSize,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final progress = _controller.value;
              final scale = 1.0 + (progress * 1.1);
              final opacity = (1.0 - progress).clamp(0.0, 1.0) * 0.75;
              return Transform.scale(
                scale: scale,
                child: Container(
                  width: widget.size,
                  height: widget.size,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.brand400.withValues(alpha: opacity),
                  ),
                ),
              );
            },
          ),
          Container(
            width: widget.size,
            height: widget.size,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.brand500,
            ),
          ),
        ],
      ),
    );
  }
}
