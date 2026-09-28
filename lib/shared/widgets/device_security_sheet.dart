import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/device_session_model.dart';
import '../../providers/auth_provider.dart';

/// Modal bottom sheet manajemen keamanan perangkat & sesi login.
/// Membedakan sesi Mobile (perangkat ini) dengan sesi Web / Desktop (dev-frontend).
class DeviceSecuritySheet extends ConsumerStatefulWidget {
  const DeviceSecuritySheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const DeviceSecuritySheet(),
    );
  }

  @override
  ConsumerState<DeviceSecuritySheet> createState() => _DeviceSecuritySheetState();
}

class _DeviceSecuritySheetState extends ConsumerState<DeviceSecuritySheet> {
  bool _isProcessing = false;

  void _showNotification(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
        ),
        backgroundColor: isError ? const Color(0xFFE11D48) : const Color(0xFF1E1E2E),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _handleRevokeSingle(DeviceSession session) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Keluarkan Perangkat?',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        content: Text(
          'Sesi login pada ${session.deviceName} (${session.browserOrApp}) akan dicabut seketika. Perangkat tersebut harus login kembali.',
          style: GoogleFonts.inter(
            color: const Color(0xFFA0A0B2),
            fontSize: 13,
            height: 1.5,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx, false),
            child: Text(
              'Batal',
              style: GoogleFonts.outfit(color: const Color(0xFF8E8EA8)),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(dialogCtx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE11D48),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(
              'Keluarkan',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isProcessing = true);
    try {
      await ref.read(authProvider.notifier).revokeDeviceSession(session.sessionId);
      _showNotification('Sesi ${session.deviceName} berhasil dikeluarkan.');
    } catch (_) {
      _showNotification('Gagal mengeluarkan perangkat.', isError: true);
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _handleLogoutAllOther() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Keluarkan Semua Perangkat Web/Lain?',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        content: Text(
          'Seluruh sesi aktif di browser Web (laptop, PC desktop, smart TV) akan dicabut. Sesi LiveEuy Mobile di smartphone ini akan tetap aktif.',
          style: GoogleFonts.inter(
            color: const Color(0xFFA0A0B2),
            fontSize: 13,
            height: 1.5,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx, false),
            child: Text(
              'Batal',
              style: GoogleFonts.outfit(color: const Color(0xFF8E8EA8)),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(dialogCtx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE11D48),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(
              'Ya, Keluarkan Semua',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isProcessing = true);
    try {
      await ref.read(authProvider.notifier).logoutAllDevices(includeCurrent: false);
      _showNotification('Seluruh sesi perangkat lain berhasil dikeluarkan.');
    } catch (_) {
      _showNotification('Gagal memproses logout massal.', isError: true);
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider);
    final sessions = user.activeSessions;
    final currentDevice = sessions.firstWhere(
      (s) => s.isCurrentDevice,
      orElse: () => DeviceSession(
        sessionId: 'sess-mob-current',
        deviceName: user.currentDeviceName,
        deviceType: DeviceType.mobile,
        os: 'Android 14',
        browserOrApp: 'LiveEuy Mobile App v2.4',
        ipAddress: '182.253.14.82',
        location: 'Jakarta Selatan, Indonesia',
        lastActive: 'Aktif Sekarang',
        isCurrentDevice: true,
      ),
    );

    final otherDevices = sessions.where((s) => !s.isCurrentDevice).toList();

    return Container(
      padding: EdgeInsets.only(
        top: 16,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 28,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF141422),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: Color(0xFF28283E), width: 1.5),
        ),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFF383852),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Header title
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF5D5FE6).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF5D5FE6).withValues(alpha: 0.3)),
                        ),
                        child: const Icon(
                          Icons.devices_rounded,
                          color: Color(0xFF8587FC),
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Keamanan & Sesi Perangkat',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Pembedaan Sesi Mobile dan Web Client',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: const Color(0xFFA0A0B2),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close_rounded, color: Color(0xFF8E8EA8)),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Section 1: Perangkat Ini (Mobile)
            Text(
              'PERANGKAT ANDA SAAT INI',
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.0,
                color: const Color(0xFF10B981),
              ),
            ),
            const SizedBox(height: 8),

            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A2B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.35)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.25)),
                    ),
                    child: const Icon(
                      Icons.phone_android_rounded,
                      color: Color(0xFF34D399),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                currentDevice.deviceName,
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'MOBILE • INI',
                                style: GoogleFonts.inter(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF34D399),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${currentDevice.os} • ${currentDevice.ipAddress} • ${currentDevice.location}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: const Color(0xFFA0A0B2),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.circle, color: Color(0xFF10B981), size: 7),
                            const SizedBox(width: 5),
                            Text(
                              currentDevice.lastActive,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF10B981),
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

            const SizedBox(height: 22),

            // Section 2: Perangkat Lain (Web & Desktop)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'PERANGKAT LAIN TERHUBUNG (WEB / DESKTOP)',
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.0,
                      color: const Color(0xFF8587FC),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${otherDevices.length} sesi',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF8E8EA8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            if (otherDevices.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A1A2B).withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF28283E)),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.shield_outlined,
                      color: Color(0xFF10B981),
                      size: 28,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tidak ada perangkat web lain yang aktif',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Akun Anda saat ini hanya terhubung di aplikasi mobile ini.',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: const Color(0xFFA0A0B2),
                      ),
                    ),
                  ],
                ),
              )
            else
              ...otherDevices.map((device) {
                final isWeb = device.isWebOrDesktop;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A2B),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF28283E)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isWeb
                              ? const Color(0xFF5D5FE6).withValues(alpha: 0.12)
                              : const Color(0xFFF59E0B).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isWeb
                                ? const Color(0xFF5D5FE6).withValues(alpha: 0.25)
                                : const Color(0xFFF59E0B).withValues(alpha: 0.25),
                          ),
                        ),
                        child: Icon(
                          isWeb ? Icons.laptop_chromebook_rounded : Icons.tablet_mac_rounded,
                          color: isWeb ? const Color(0xFF8587FC) : const Color(0xFFFBBF24),
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    device.deviceName,
                                    style: GoogleFonts.outfit(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF5D5FE6).withValues(alpha: 0.18),
                                    borderRadius: BorderRadius.circular(5),
                                  ),
                                  child: Text(
                                    isWeb ? 'WEB' : 'TABLET',
                                    style: GoogleFonts.inter(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF8587FC),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${device.browserOrApp} • ${device.ipAddress}',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: const Color(0xFFA0A0B2),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${device.location} • Aktif ${device.lastActive}',
                              style: GoogleFonts.inter(
                                fontSize: 10.5,
                                color: const Color(0xFF8E8EA8),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton(
                        onPressed: _isProcessing ? null : () => _handleRevokeSingle(device),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFFFB7185),
                          side: const BorderSide(color: Color(0xFFE11D48), width: 1),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          minimumSize: const Size(60, 36),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          'Keluarkan',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),

            const SizedBox(height: 18),

            // Section 3: Logout Semua Perangkat Lain Button
            if (otherDevices.isNotEmpty)
              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton.icon(
                  onPressed: _isProcessing ? null : _handleLogoutAllOther,
                  icon: const Icon(Icons.logout_rounded, color: Color(0xFFFB7185), size: 18),
                  label: Text(
                    'KELUARKAN SEMUA PERANGKAT WEB LAIN',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.6,
                      color: const Color(0xFFFB7185),
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE11D48), width: 1.2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),

            const SizedBox(height: 12),
            Center(
              child: Text(
                'Identifikasi perangkat diverifikasi via User-Agent & Header API LiveEuy.',
                style: GoogleFonts.inter(
                  fontSize: 10.5,
                  color: const Color(0xFF717188),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
