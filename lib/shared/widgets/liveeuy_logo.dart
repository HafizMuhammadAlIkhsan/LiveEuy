import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

/// Logo brand LiveEuy berbasis Tipografi Murni (100% Font / Tanpa Aset Raster/PNG)
/// Mengikuti referensi desain resmi LiveEuy:
/// - 'LIVE' berwarna putih murni (#FFFFFF)
/// - 'EUY' berwarna biru-ungu periwinkle cerah (#5D5FE6)
/// - Font: Geometric Display Extra-Bold / Black (GoogleFonts.outfit w900)
/// - Kerning / letterSpacing presisi (-0.6)
/// - Opsional: Badge squircle untuk icon-only / compact mode
class LiveEuyLogo extends StatelessWidget {
  final double fontSize;
  final double? height;
  final bool? showBadge;
  final bool showText;
  final bool? showSubtitle;
  final bool showLiveDot;
  final double? letterSpacing;

  const LiveEuyLogo({
    super.key,
    this.fontSize = 20.0,
    this.height,
    this.showBadge,
    this.showText = true,
    this.showSubtitle,
    this.showLiveDot = false,
    this.letterSpacing,
  });

  @override
  Widget build(BuildContext context) {
    final double boxSize = height ?? (fontSize * 1.5);
    final double radius = boxSize * 0.28;
    // Default showBadge: false jika showText true (tipografi murni seperti referensi),
    // atau true jika showText false (icon-only mode untuk AppBar detail)
    final bool displayBadge = showBadge ?? (!showText);
    final bool displaySubtitle = showSubtitle ?? false;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (displayBadge) ...[
          Container(
            key: const Key('liveeuy_badge_box'),
            width: boxSize,
            height: boxSize,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(radius),
              gradient: const LinearGradient(
                colors: [AppColors.primaryContainer, AppColors.brandEuy],
                begin: Alignment.bottomLeft,
                end: Alignment.topRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.brandEuy.withValues(alpha: 0.35),
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
          if (showText) SizedBox(width: fontSize * 0.4),
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
                    _buildTypographyLogo(),
                    if (showLiveDot) ...[
                      SizedBox(width: fontSize * 0.2),
                      _LiveDot(size: fontSize * 0.3),
                    ],
                  ],
                ),
                Text(
                  'CINEMA STREAM',
                  style: GoogleFonts.outfit(
                    fontSize: (fontSize * 0.38).clamp(8.5, 12.0),
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2.0,
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
                _buildTypographyLogo(),
                if (showLiveDot) ...[
                  SizedBox(width: fontSize * 0.2),
                  _LiveDot(size: fontSize * 0.3),
                ],
              ],
            ),
        ],
      ],
    );
  }

  Widget _buildTypographyLogo() {
    final effectiveSpacing = letterSpacing ?? -0.6;
    return Text.rich(
      key: const Key('liveeuy_typography_logo'),
      TextSpan(
        style: GoogleFonts.outfit(
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
          letterSpacing: effectiveSpacing,
          height: 1.0,
        ),
        children: const [
          TextSpan(
            text: 'LIVE',
            style: TextStyle(
              color: AppColors.brandLive,
            ),
          ),
          TextSpan(
            text: 'EUY',
            style: TextStyle(
              color: AppColors.brandEuy,
            ),
          ),
        ],
      ),
    );
  }
}

class _LiveDot extends StatelessWidget {
  final double size;
  const _LiveDot({required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.brandEuy,
        border: Border.all(
          color: AppColors.brandEuy.withValues(alpha: 0.35),
          width: 1.5,
        ),
      ),
    );
  }
}
