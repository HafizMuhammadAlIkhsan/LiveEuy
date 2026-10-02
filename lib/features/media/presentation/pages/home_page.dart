import 'package:flutter/material.dart';
import '../../../../features/home/home_screen.dart';

class HomePage extends StatelessWidget {
  final Function(int)? onNavigateTab;
  final bool isActive;
  const HomePage({super.key, this.onNavigateTab, this.isActive = true});

  @override
  Widget build(BuildContext context) {
    return HomeScreen(onNavigateTab: onNavigateTab ?? (_) {}, isActive: isActive);
  }
}
