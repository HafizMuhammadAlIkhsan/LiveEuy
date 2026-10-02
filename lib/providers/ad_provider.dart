import 'package:get/get.dart';
import '../models/ad_model.dart';

class AdController extends GetxController {
  final ads = <AdCampaign>[...kMockAdCampaigns].obs;

  List<AdCampaign> get state => ads;

  void recordImpression(String adId) {
    final index = ads.indexWhere((a) => a.id == adId);
    if (index >= 0) {
      final ad = ads[index];
      ads[index] = ad.copyWith(impressions: ad.impressions + 1);
    }
  }

  void recordClick(String adId) {
    final index = ads.indexWhere((a) => a.id == adId);
    if (index >= 0) {
      final ad = ads[index];
      ads[index] = ad.copyWith(clicks: ad.clicks + 1);
    }
  }

  AdCampaign? getPrerollAd(bool isVip) {
    if (isVip) return null;
    final active = ads.where((a) => a.isActive && a.layer == AdPlacementLayer.videoPreroll).toList();
    return active.isNotEmpty ? active.first : null;
  }

  List<AdCampaign> getBillboardAds(bool isVip) {
    if (isVip) return const [];
    return ads.where((a) => a.isActive && a.layer == AdPlacementLayer.billboardFeed).toList();
  }
}

typedef AdNotifier = AdController;
