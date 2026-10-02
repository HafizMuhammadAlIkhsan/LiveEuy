import 'package:flutter/material.dart';
import '../../../../features/search/search_screen.dart';

class SearchPage extends StatelessWidget {
  final Function(int)? onNavigateTab;
  const SearchPage({super.key, this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    return SearchScreen(onNavigateTab: onNavigateTab ?? (_) {});
  }
}
