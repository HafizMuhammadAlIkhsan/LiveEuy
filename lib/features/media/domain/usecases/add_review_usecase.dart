import '../../../../core/usecases/usecase.dart';
import '../../../../models/review_model.dart';
import '../repositories/media_repository.dart';

class AddReviewUseCase extends UseCase<Review?, AddReviewParams> {
  final MediaRepository repository;
  AddReviewUseCase(this.repository);

  @override
  ResultFuture<Review?> call(AddReviewParams params) {
    return repository.addReview(
      mediaId: params.mediaId,
      rating: params.rating,
      comment: params.comment,
      userName: params.userName,
    );
  }
}

class AddReviewParams {
  final String mediaId;
  final double rating;
  final String comment;
  final String userName;
  const AddReviewParams({required this.mediaId, required this.rating, required this.comment, this.userName = 'Anda (Pengguna)'});
}
