import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../features/player/video_player_screen.dart';
import '../../../../models/movie_model.dart';

class PlayerPage extends StatelessWidget {
  const PlayerPage({super.key});

  @override
  Widget build(BuildContext context) {
    final args = Get.arguments as Map<String, dynamic>?;
    final movie = args?['movie'] as Movie?;
    if (movie == null) {
      return const Scaffold(body: Center(child: Text('Video tidak ditemukan')));
    }
    return VideoPlayerScreen(movie: movie);
  }
}
