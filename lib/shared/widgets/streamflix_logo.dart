import 'package:flutter/material.dart';
import 'liveeuy_logo.dart';

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

  @override
  Widget build(BuildContext context) {
    return LiveEuyLogo(
      fontSize: fontSize,
      showBadge: true,
      showText: showText,
    );
  }
}
