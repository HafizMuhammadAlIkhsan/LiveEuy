import '../../../../core/storage/local_storage_service.dart';
import '../../../../models/watch_progress_model.dart';

abstract class MediaLocalDataSource {
  Set<String> getWatchlistIds();
  Future<void> saveWatchlistIds(Set<String> ids);
  List<WatchProgress> getWatchProgressList();
  Future<void> saveWatchProgressList(List<WatchProgress> list);
}

class MediaLocalDataSourceImpl implements MediaLocalDataSource {
  final LocalStorageService storageService;
  MediaLocalDataSourceImpl({required this.storageService});

  @override
  Set<String> getWatchlistIds() => storageService.getWatchlistIds();

  @override
  Future<void> saveWatchlistIds(Set<String> ids) => storageService.saveWatchlistIds(ids);

  @override
  List<WatchProgress> getWatchProgressList() => storageService.getWatchProgressList();

  @override
  Future<void> saveWatchProgressList(List<WatchProgress> list) => storageService.saveWatchProgressList(list);
}
