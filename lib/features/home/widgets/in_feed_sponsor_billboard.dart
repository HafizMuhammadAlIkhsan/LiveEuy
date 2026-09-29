import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/ad_model.dart';
import '../../../providers/ad_provider.dart';
import '../../../providers/auth_provider.dart';

class InFeedSponsorBillboard extends ConsumerStatefulWidget {
  final int placementIndex;

  const InFeedSponsorBillboard({
    super.key,
    this.placementIndex = 0,
  });

  @override
  ConsumerState<InFeedSponsorBillboard> createState() => _InFeedSponsorBillboardState();
}

class _InFeedSponsorBillboardState extends ConsumerState<InFeedSponsorBillboard> {
  bool _hasRecordedImpression = false;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);

    // VIP users are completely exempt from sponsor billboards
    if (user.isVip) {
      return const SizedBox.shrink();
    }

    final billboardAds = ref.watch(adProvider).where((a) => a.isActive && a.layer == AdPlacementLayer.billboardFeed).toList();
    if (billboardAds.isEmpty) {
      return const SizedBox.shrink();
    }

    final ad = billboardAds[widget.placementIndex % billboardAds.length];

    if (!_hasRecordedImpression) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ref.read(adProvider.notifier).recordImpression(ad.id);
          _hasRecordedImpression = true;
        }
      });
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: GestureDetector(
        key: Key('in_feed_sponsor_card_${ad.id}'),
        onTap: () {
          ref.read(adProvider.notifier).recordClick(ad.id);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Membuka penawaran: ${ad.partnerName}',
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500),
              ),
              backgroundColor: AppColors.surfaceContainerHigh,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 2),
            ),
          );
        },
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: AppColors.outlineVariant.withValues(alpha: 0.25),
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            children: [
              // 1. Background image with cinematic dark wash
              Positioned.fill(
                child: CachedNetworkImage(
                  imageUrl: ad.bannerUrl,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(color: AppColors.surfaceContainerHigh),
                  errorWidget: (context, url, error) => Container(color: AppColors.surfaceContainerHigh),
                ),
              ),
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [
                        const Color(0xF20D0D17),
                        const Color(0xD90D0D17),
                        Colors.black.withValues(alpha: 0.70),
                      ],
                    ),
                  ),
                ),
              ),

              // 2. Foreground content
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Badge and partner name row
                    Row(
                      children: [
                        Flexible(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                            decoration: BoxDecoration(
                              color: Colors.amber.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: Colors.amber.withValues(alpha: 0.35),
                              ),
                            ),
                            child: Text(
                              ad.badge,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFFFDE68A),
                                letterSpacing: 0.4,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            ad.partnerName,
                            textAlign: TextAlign.end,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Headline
                    Text(
                      ad.headline,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Description & Action
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            ad.description,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                ad.ctaText,
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(
                                Icons.arrow_forward_rounded,
                                size: 12,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
