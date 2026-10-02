import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../features/detail/content_detail_screen.dart';
import '../../../../models/movie_model.dart';

class DetailPage extends StatelessWidget {
  const DetailPage({super.key});

  @override
  Widget build(BuildContext context) {
    final movie = Get.arguments as Movie?;
    if (movie == null) {
      return const Scaffold(body: Center(child: Text('Konten tidak ditemukan')));
    }
    return ContentDetailScreen(movie: movie);
  }
}
