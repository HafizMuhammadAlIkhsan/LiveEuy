abstract class NetworkInfo {
  Future<bool> get isConnected;
}

class NetworkInfoImpl implements NetworkInfo {
  @override
  Future<bool> get isConnected async {
    try {
      // Simple connectivity check - in production use connectivity_plus
      return true;
    } catch (_) {
      return false;
    }
  }
}
