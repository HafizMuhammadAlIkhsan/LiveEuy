import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ad_model.dart';

class AdNotifier extends StateNotifier<List<AdCampaign>> {
  AdNotifier() : super(kMockAdCampaigns);

  void recordImpression(String adId) {
    state = [
      for (final ad in state)
        if (ad.id == adId)
          ad.copyWith(impressions: ad.impressions + 1)
        else
          ad,
    ];
  }

  void recordClick(String adId) {
    state = [
      for (final ad in state)
        if (ad.id == adId)
          ad.copyWith(clicks: ad.clicks + 1)
        else
          ad,
    ];
  }

  AdCampaign? getPrerollAd(bool isVip) {
    if (isVip) return null;
    final active = state.where((a) => a.isActive && a.layer == AdPlacementLayer.videoPreroll).toList();
    return active.isNotEmpty ? active.first : null;
  }

  List<AdCampaign> getBillboardAds(bool isVip) {
    if (isVip) return const [];
    return state.where((a) => a.isActive && a.layer == AdPlacementLayer.billboardFeed).toList();
  }
}

final adProvider = StateNotifierProvider<AdNotifier, List<AdCampaign>>((ref) {
  return AdNotifier();
});
