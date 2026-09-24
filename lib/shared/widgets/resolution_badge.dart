import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

class ResolutionBadge extends StatelessWidget {
  final String label;

  const ResolutionBadge({
    super.key,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final isCyanTag = label.contains('4K') || label.contains('Vision') || label.contains('Atmos') || label.contains('HDR');
    
    final bg = isCyanTag ? AppColors.tertiaryCyan.withValues(alpha: 0.12) : AppColors.surfaceLayer2;
    final border = isCyanTag ? AppColors.tertiaryCyan.withValues(alpha: 0.4) : AppColors.textMuted.withValues(alpha: 0.3);
    final textCol = isCyanTag ? AppColors.tertiaryCyan : AppColors.textPrimary;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: border, width: 0.8),
      ),
      child: Text(
        label.toUpperCase(),
        style: GoogleFonts.outfit(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: textCol,
          letterSpacing: 0.08,
        ),
      ),
    );
  }
}
