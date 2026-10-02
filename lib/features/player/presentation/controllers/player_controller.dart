import 'package:get/get.dart';
import '../../../../models/movie_model.dart';

class PlayerController extends GetxController {
  final Rxn<Movie> currentMovie = Rxn<Movie>();
  final isPlaying = false.obs;
  final progress = 0.0.obs;

  void setMovie(Movie movie) {
    currentMovie.value = movie;
  }
}
