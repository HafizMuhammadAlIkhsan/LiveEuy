import 'package:dartz/dartz.dart';
import '../error/failures.dart';

typedef ResultFuture<T> = Future<Either<Failure, T>>;
typedef ResultVoid = Future<Either<Failure, void>>;

abstract class UseCase<T, Params> {
  ResultFuture<T> call(Params params);
}

class NoParams {
  const NoParams();
}
