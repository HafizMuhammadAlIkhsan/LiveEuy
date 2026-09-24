import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

class StreamFlixLogo extends StatelessWidget {
  final double fontSize;
  final double? height;
  final bool showText;

  const StreamFlixLogo({
    super.key,
    this.fontSize = 20.0,
    this.height,
    this.showText = true,
  });

  static const String logoUrl =
      'https://lh3.googleusercontent.com/aida/AEtjO1XPfKHhYmisLHcTwp5DOPtbgq9K1O0wQWfY92xggrvXno8WHo9Jey5EhCSgtchxk9srRaADNdin__v-K660zTfMn-GlCfFQzwcSwzEnxzE_tNxGfQc2fACdlCWQ65EnpqyXcN4QhtBnlEMffDJtKWLdFYKYd-F1L1buPlof8vEcWX5EFWBoRUkb0eq_N9H1Q8WDIv7wz20dYnFOdZYWEAkLH6SfoSfvnAgxshgg8guhFAGGETbFzd7by1g';

  @override
  Widget build(BuildContext context) {
    final logoH = height ?? (fontSize * 1.5);
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        CachedNetworkImage(
          imageUrl: logoUrl,
          height: logoH,
          fit: BoxFit.contain,
          placeholder: (context, url) => _buildFallbackBadge(logoH),
          errorWidget: (context, url, error) => _buildFallbackBadge(logoH),
        ),
        if (showText) ...[
          const SizedBox(width: 8),
          Text(
            'LiveEuy',
            style: GoogleFonts.outfit(
              fontSize: fontSize,
              fontWeight: FontWeight.w800,
              color: AppColors.onSurface,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildFallbackBadge(double size) {
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        color: AppColors.primaryContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Icon(
          Icons.play_arrow_rounded,
          color: Colors.white,
          size: size * 0.7,
        ),
      ),
    );
  }
}
