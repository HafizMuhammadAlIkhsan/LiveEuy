import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class AmbientGlow extends StatelessWidget {
  final Widget child;
  final Color glowColor;
  final double blurRadius;
  final double spreadRadius;

  const AmbientGlow({
    super.key,
    required this.child,
    this.glowColor = AppColors.primaryContainer,
    this.blurRadius = 32.0,
    this.spreadRadius = -4.0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: glowColor.withValues(alpha: 0.35),
            blurRadius: blurRadius,
            spreadRadius: spreadRadius,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );
  }
}
