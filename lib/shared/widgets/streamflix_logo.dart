import 'package:flutter/material.dart';
import 'liveeuy_logo.dart';

/// Wrapper StreamFlixLogo yang mengarahkan ke LiveEuyLogo
/// Menggunakan rendering tipografi font murni (tanpa file gambar PNG)
class StreamFlixLogo extends StatelessWidget {
  final double fontSize;
  final double? height;
  final bool? showBadge;
  final bool showText;
  final bool? showSubtitle;
  final bool showLiveDot;
  final double? letterSpacing;

  const StreamFlixLogo({
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
    return LiveEuyLogo(
      fontSize: fontSize,
      height: height,
      showBadge: showBadge,
      showText: showText,
      showSubtitle: showSubtitle,
      showLiveDot: showLiveDot,
      letterSpacing: letterSpacing,
    );
  }
}
