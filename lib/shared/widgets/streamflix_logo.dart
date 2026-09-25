import 'package:flutter/material.dart';
import 'liveeuy_logo.dart';

class StreamFlixLogo extends StatelessWidget {
  final double fontSize;
  final double? height;
  final bool showText;
  final bool? showSubtitle;
  final bool showLiveDot;

  const StreamFlixLogo({
    super.key,
    this.fontSize = 20.0,
    this.height,
    this.showText = true,
    this.showSubtitle,
    this.showLiveDot = true,
  });

  @override
  Widget build(BuildContext context) {
    return LiveEuyLogo(
      fontSize: fontSize,
      height: height,
      showBadge: true,
      showText: showText,
      showSubtitle: showSubtitle,
      showLiveDot: showLiveDot,
    );
  }
}
