import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

class LiveEuyLogo extends StatelessWidget {
  final double fontSize;
  final bool showBadge;

  const LiveEuyLogo({
    super.key,
    this.fontSize = 22.0,
    this.showBadge = true,
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
                colors: [AppColors.primaryCrimson, Color(0xFFFF2E4D)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryCrimson.withValues(alpha: 0.6),
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
          SizedBox(width: fontSize * 0.35),
        ],
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
                  color: AppColors.primaryCrimson,
                  letterSpacing: 1.5,
                  shadows: [
                    Shadow(
                      color: AppColors.primaryCrimson.withValues(alpha: 0.8),
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
