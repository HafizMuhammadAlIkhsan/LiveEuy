import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

class LiveEuyLogo extends StatelessWidget {
  final double fontSize;
  final bool showBadge;
  final bool showText;

  const LiveEuyLogo({
    super.key,
    this.fontSize = 22.0,
    this.showBadge = true,
    this.showText = true,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (showBadge) ...[
          Container(
            padding: EdgeInsets.all(fontSize * 0.28),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [AppColors.primaryContainer, AppColors.tertiary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryContainer.withValues(alpha: 0.5),
                  blurRadius: 14,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(
              Icons.play_arrow_rounded,
              color: Colors.white,
              size: fontSize * 0.75,
            ),
          ),
          if (showText) SizedBox(width: fontSize * 0.35),
        ],
        if (showText)
          Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: 'LIVE',
                  style: GoogleFonts.outfit(
                    fontSize: fontSize,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 1.5,
                  ),
                ),
                TextSpan(
                  text: 'EUY',
                  style: GoogleFonts.outfit(
                    fontSize: fontSize,
                    fontWeight: FontWeight.w900,
                    color: AppColors.tertiary,
                    letterSpacing: 1.5,
                    shadows: [
                      Shadow(
                        color: AppColors.primaryContainer.withValues(alpha: 0.8),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
