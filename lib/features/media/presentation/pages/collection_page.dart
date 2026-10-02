import 'package:flutter/material.dart';
import '../../../../features/collection/collection_screen.dart';

class CollectionPage extends StatelessWidget {
  final Function(int)? onNavigateTab;
  final VoidCallback? onNavigateHome;
  const CollectionPage({super.key, this.onNavigateTab, this.onNavigateHome});

  @override
  Widget build(BuildContext context) {
    return CollectionScreen(
      onNavigateTab: onNavigateTab ?? (_) {},
      onNavigateHome: onNavigateHome ?? () {},
    );
  }
}
