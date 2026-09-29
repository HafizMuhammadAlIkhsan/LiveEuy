enum AdPlacementLayer {
  videoPreroll,
  billboardFeed,
  heroSpotlight,
  topMarquee,
}

extension AdPlacementLayerExtension on AdPlacementLayer {
  String get value {
    switch (this) {
      case AdPlacementLayer.videoPreroll:
        return 'video_preroll';
      case AdPlacementLayer.billboardFeed:
        return 'billboard_feed';
      case AdPlacementLayer.heroSpotlight:
        return 'hero_spotlight';
      case AdPlacementLayer.topMarquee:
        return 'top_marquee';
    }
  }

  static AdPlacementLayer fromString(String val) {
    switch (val) {
      case 'video_preroll':
        return AdPlacementLayer.videoPreroll;
      case 'billboard_feed':
        return AdPlacementLayer.billboardFeed;
      case 'hero_spotlight':
        return AdPlacementLayer.heroSpotlight;
      case 'top_marquee':
        return AdPlacementLayer.topMarquee;
      default:
        return AdPlacementLayer.billboardFeed;
    }
  }
}

class AdCampaign {
  final String id;
  final String title;
  final String partnerName;
  final String? partnerLogo;
  final AdPlacementLayer layer;
  final String bannerUrl;
  final String? videoUrl;
  final String targetUrl;
  final String ctaText;
  final String headline;
  final String description;
  final String badge;
  final String category;
  final int budget;
  final int impressions;
  final int clicks;
  final String startDate;
  final String endDate;
  final bool isActive;
  final int skipAfterSeconds;

  const AdCampaign({
    required this.id,
    required this.title,
    required this.partnerName,
    this.partnerLogo,
    required this.layer,
    required this.bannerUrl,
    this.videoUrl,
    required this.targetUrl,
    required this.ctaText,
    required this.headline,
    required this.description,
    required this.badge,
    required this.category,
    this.budget = 0,
    this.impressions = 0,
    this.clicks = 0,
    this.startDate = '',
    this.endDate = '',
    this.isActive = true,
    this.skipAfterSeconds = 5,
  });

  AdCampaign copyWith({
    String? id,
    String? title,
    String? partnerName,
    String? partnerLogo,
    AdPlacementLayer? layer,
    String? bannerUrl,
    String? videoUrl,
    String? targetUrl,
    String? ctaText,
    String? headline,
    String? description,
    String? badge,
    String? category,
    int? budget,
    int? impressions,
    int? clicks,
    String? startDate,
    String? endDate,
    bool? isActive,
    int? skipAfterSeconds,
  }) {
    return AdCampaign(
      id: id ?? this.id,
      title: title ?? this.title,
      partnerName: partnerName ?? this.partnerName,
      partnerLogo: partnerLogo ?? this.partnerLogo,
      layer: layer ?? this.layer,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      targetUrl: targetUrl ?? this.targetUrl,
      ctaText: ctaText ?? this.ctaText,
      headline: headline ?? this.headline,
      description: description ?? this.description,
      badge: badge ?? this.badge,
      category: category ?? this.category,
      budget: budget ?? this.budget,
      impressions: impressions ?? this.impressions,
      clicks: clicks ?? this.clicks,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      isActive: isActive ?? this.isActive,
      skipAfterSeconds: skipAfterSeconds ?? this.skipAfterSeconds,
    );
  }

  factory AdCampaign.fromJson(Map<String, dynamic> json) {
    return AdCampaign(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      partnerName: json['partnerName'] as String? ?? '',
      partnerLogo: json['partnerLogo'] as String?,
      layer: AdPlacementLayerExtension.fromString(json['layer'] as String? ?? 'billboard_feed'),
      bannerUrl: json['bannerUrl'] as String? ?? '',
      videoUrl: json['videoUrl'] as String?,
      targetUrl: json['targetUrl'] as String? ?? '',
      ctaText: json['ctaText'] as String? ?? 'Kunjungi Situs',
      headline: json['headline'] as String? ?? '',
      description: json['description'] as String? ?? '',
      badge: json['badge'] as String? ?? 'SPONSOR',
      category: json['category'] as String? ?? 'Umum',
      budget: (json['budget'] as num?)?.toInt() ?? 0,
      impressions: (json['impressions'] as num?)?.toInt() ?? 0,
      clicks: (json['clicks'] as num?)?.toInt() ?? 0,
      startDate: json['startDate'] as String? ?? '',
      endDate: json['endDate'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
      skipAfterSeconds: (json['skipAfterSeconds'] as num?)?.toInt() ?? 5,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'partnerName': partnerName,
      'partnerLogo': partnerLogo,
      'layer': layer.value,
      'bannerUrl': bannerUrl,
      'videoUrl': videoUrl,
      'targetUrl': targetUrl,
      'ctaText': ctaText,
      'headline': headline,
      'description': description,
      'badge': badge,
      'category': category,
      'budget': budget,
      'impressions': impressions,
      'clicks': clicks,
      'startDate': startDate,
      'endDate': endDate,
      'isActive': isActive,
      'skipAfterSeconds': skipAfterSeconds,
    };
  }
}

/// Mock Ad Campaigns synchronized 1:1 with dev-frontend
const List<AdCampaign> kMockAdCampaigns = [
  AdCampaign(
    id: 'ad-asus-rog',
    title: 'ASUS ROG Zephyrus Cinema OLED',
    partnerName: 'ASUS Republic of Gamers',
    partnerLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80',
    layer: AdPlacementLayer.videoPreroll,
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    targetUrl: 'https://rog.asus.com/id',
    ctaText: 'Lihat Penawaran Eksklusif',
    headline: 'Layar Sinematik OLED 240Hz Dolby Vision — Sensasi Bioskop Pribadi',
    description: 'Ditenagai prosesor AI dan grafis RTX 4090. Dapatkan bonus langganan VIP LiveEuy 1 Tahun untuk setiap pembelian!',
    badge: 'SPONSOR PRE-ROLL RESMI',
    category: 'Tech & Gadget',
    budget: 35000000,
    impressions: 198200,
    clicks: 14600,
    startDate: '2026-09-10',
    endDate: '2026-11-15',
    isActive: true,
    skipAfterSeconds: 5,
  ),
  AdCampaign(
    id: 'ad-telkomsel-5g',
    title: 'Telkomsel 5G MAXstream Cinema',
    partnerName: 'Telkomsel Indonesia',
    partnerLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    layer: AdPlacementLayer.billboardFeed,
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80',
    targetUrl: 'https://www.telkomsel.com/maxstream',
    ctaText: 'Klaim Kuota 5G',
    headline: 'Streaming Film Full HD Tanpa Buffering dengan Kuota 5G Terluas',
    description: 'Aktifkan paket MAXstream 5G mulai Rp 25.000 dan nikmati akses streaming sepuasnya tanpa batas kuota utama.',
    badge: 'MITRA SPONSOR RESMI',
    category: 'Telco',
    budget: 25000000,
    impressions: 142500,
    clicks: 11200,
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    isActive: true,
  ),
  AdCampaign(
    id: 'ad-bca-blu',
    title: 'blu by BCA Digital VIP Cashback',
    partnerName: 'BCA Digital',
    partnerLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
    layer: AdPlacementLayer.billboardFeed,
    bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1600&auto=format&fit=crop&q=80',
    targetUrl: 'https://blubybcadigital.id',
    ctaText: 'Klaim Cashback 50%',
    headline: 'Cashback 50% Langganan VIP LiveEuy dengan Rekening blu',
    description: 'Gunakan kode promo LIVEEUYVIP saat registrasi rekening blu untuk reward saldo streaming instan.',
    badge: 'PARTNER PEMBAYARAN RESMI',
    category: 'Fintech & Banking',
    budget: 18000000,
    impressions: 89400,
    clicks: 6340,
    startDate: '2026-09-15',
    endDate: '2026-10-15',
    isActive: true,
  ),
];
