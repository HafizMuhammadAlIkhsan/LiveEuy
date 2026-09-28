import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/notification_provider.dart';

class NotificationIconButton extends ConsumerWidget {
  final void Function(String mediaId)? onOpenMediaId;

  const NotificationIconButton({
    super.key,
    this.onOpenMediaId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifState = ref.watch(notificationProvider);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          key: const Key('notification_button'),
          tooltip: 'Notifikasi',
          icon: const Icon(
            Icons.notifications_none_rounded,
            color: AppColors.onSurface,
            size: 22,
          ),
          onPressed: () => showNotificationSheet(context, ref, onOpenMediaId),
        ),
        if (notifState.hasUnread)
          Positioned(
            top: 10,
            right: 10,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: AppColors.brand500,
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.background,
                  width: 1.5,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

void showNotificationSheet(
  BuildContext context,
  WidgetRef ref,
  void Function(String mediaId)? onOpenMediaId,
) {
  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    builder: (ctx) {
      return Consumer(
        builder: (context, ref, child) {
          final notifState = ref.watch(notificationProvider);

          return Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
            decoration: BoxDecoration(
              color: const Color(0xFF0F101A),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.1),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.6),
                  blurRadius: 24,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Center drag pill handle
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: AppColors.outlineVariant.withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),

                  // Header (NOTIFIKASI TERBARU + Tandai dibaca)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'NOTIFIKASI TERBARU',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                          color: AppColors.brandSlate400,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          ref.read(notificationProvider.notifier).markAllAsRead();
                        },
                        child: Text(
                          'Tandai dibaca',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.brand400,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Divider(color: Colors.white.withValues(alpha: 0.08), height: 1),
                  const SizedBox(height: 12),

                  // Items List
                  if (notifState.items.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          'Tidak ada notifikasi saat ini.',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ),
                    )
                  else
                    ...notifState.items.map((item) {
                      final isSparkles = item.iconType == 'sparkles';
                      final iconBg = isSparkles
                          ? AppColors.brand500.withValues(alpha: 0.15)
                          : const Color(0xFFF59E0B).withValues(alpha: 0.15);
                      final iconColor = isSparkles
                          ? AppColors.brand400
                          : const Color(0xFFF59E0B);
                      final iconData = isSparkles
                          ? Icons.auto_awesome_rounded
                          : Icons.local_fire_department_rounded;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () {
                            ref
                                .read(notificationProvider.notifier)
                                .markAsRead(item.id);
                            Navigator.pop(ctx);
                            if (onOpenMediaId != null && item.targetMediaId != null) {
                              onOpenMediaId(item.targetMediaId!);
                            } else {
                              ref
                                  .read(notificationProvider.notifier)
                                  .openNotification(item);
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: item.isRead
                                  ? Colors.white.withValues(alpha: 0.03)
                                  : Colors.white.withValues(alpha: 0.07),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: item.isRead
                                    ? Colors.white.withValues(alpha: 0.04)
                                    : AppColors.brand400.withValues(alpha: 0.2),
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: iconBg,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(iconData, color: iconColor, size: 18),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            item.title,
                                            style: GoogleFonts.plusJakartaSans(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w700,
                                              color: Colors.white,
                                            ),
                                          ),
                                          if (!item.isRead)
                                            Container(
                                              width: 6,
                                              height: 6,
                                              decoration: const BoxDecoration(
                                                color: AppColors.brand500,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        item.message,
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 12,
                                          color: const Color(0xFFCBD5E1),
                                          height: 1.35,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        item.time,
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 10,
                                          color: AppColors.brandSlate400,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),
                ],
              ),
            ),
          );
        },
      );
    },
  );
}
