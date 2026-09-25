import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Pitch dark OLED base canvas tiering (StreamFlix design system)
  static const Color background = Color(0xFF12121D);
  static const Color surface = Color(0xFF12121D);
  static const Color surfaceCanvas = Color(0xFF12121D);
  static const Color surfaceContainerLowest = Color(0xFF0D0D17);
  static const Color surfaceContainerLow = Color(0xFF1A1B25);
  static const Color surfaceContainer = Color(0xFF1F1F29);
  static const Color surfaceContainerHigh = Color(0xFF292934);
  static const Color surfaceContainerHighest = Color(0xFF34343F);
  static const Color surfaceBright = Color(0xFF383844);
  static const Color surfaceVariant = Color(0xFF34343F);

  // Legacy mappings for existing references
  static const Color surfaceLayer1 = Color(0xFF1A1B25);
  static const Color surfaceLayer2 = Color(0xFF1F1F29);
  static const Color surfaceLayer3 = Color(0xFF292934);
  static const Color surfaceLayerHighest = Color(0xFF34343F);

  // StreamFlix Primary & Accent Colors
  static const Color primary = Color(0xFFC1C1FF);
  static const Color primaryContainer = Color(0xFF433FFE);
  static const Color onPrimaryContainer = Color(0xFFDAD9FF);
  static const Color primaryFixed = Color(0xFFE1DFFF);
  static const Color primaryCrimson = Color(0xFF433FFE); // Electric indigo (no red)
  static const Color primaryGlow = Color(0xFF433FFE);

  // Secondary & Tertiary Accents
  static const Color secondary = Color(0xFFC1C1FF);
  static const Color secondaryViolet = Color(0xFFC1C1FF);
  static const Color secondaryContainer = Color(0xFF3D3E95);
  static const Color onSecondaryContainer = Color(0xFFB0B1FF);
  static const Color tertiary = Color(0xFF81CFFF);
  static const Color tertiaryContainer = Color(0xFF006890);
  static const Color tertiaryFixed = Color(0xFFC6E7FF);
  static const Color tertiaryCyan = Color(0xFF81CFFF);
  static const Color accentGold = Color(0xFFFFB800);

  // Text & Foregrounds
  static const Color onSurface = Color(0xFFE3E1F0);
  static const Color textPrimary = Color(0xFFE3E1F0);
  static const Color onSurfaceVariant = Color(0xFFC6C4DA);
  static const Color textSecondary = Color(0xFFC6C4DA);
  static const Color outline = Color(0xFF908FA3);
  static const Color outlineVariant = Color(0xFF454557);
  static const Color textMuted = Color(0xFF908FA3);

  // Errors & Alerts
  static const Color error = Color(0xFFFFB4AB);
  static const Color errorContainer = Color(0xFF93000A);

  // Glassmorphism & Translucency
  static const Color glassSurface = Color(0xB81F1F29);
  static const Color glassBorder = Color(0x2E908FA3);
  static const Color glassBorderActive = Color(0x60433FFE);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primaryContainer,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        onPrimary: AppColors.surfaceContainerLowest,
        primaryContainer: AppColors.primaryContainer,
        onPrimaryContainer: AppColors.onPrimaryContainer,
        secondary: AppColors.secondary,
        secondaryContainer: AppColors.secondaryContainer,
        tertiary: AppColors.tertiary,
        surface: AppColors.surfaceContainer,
        onSurface: AppColors.onSurface,
        error: AppColors.error,
        errorContainer: AppColors.errorContainer,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceContainer,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: AppColors.outlineVariant.withValues(alpha: 0.2),
            width: 1,
          ),
        ),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(
          fontSize: 36,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
          letterSpacing: -0.02,
        ),
        headlineLarge: GoogleFonts.outfit(
          fontSize: 26,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          letterSpacing: -0.015,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          letterSpacing: -0.01,
        ),
        headlineSmall: GoogleFonts.outfit(
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: AppColors.textPrimary,
          height: 1.5,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondary,
          height: 1.4,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColors.textSecondary,
        ),
        labelLarge: GoogleFonts.outfit(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          letterSpacing: 0.02,
        ),
        labelMedium: GoogleFonts.outfit(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary,
          letterSpacing: 0.04,
        ),
        labelSmall: GoogleFonts.outfit(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: AppColors.tertiaryCyan,
          letterSpacing: 0.08,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceContainerHigh,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.25)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.25)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primaryContainer, width: 1.5),
        ),
        labelStyle: GoogleFonts.inter(color: AppColors.textSecondary),
        hintStyle: GoogleFonts.inter(color: AppColors.textMuted),
      ),
    );
  }
}
