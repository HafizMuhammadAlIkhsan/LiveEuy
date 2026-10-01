import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/network/dio_exception.dart';
import '../../core/theme/app_theme.dart';
import '../../models/device_session_model.dart';
import '../../providers/auth_provider.dart';
import '../../shared/widgets/device_conflict_dialog.dart';
import '../../shared/widgets/streamflix_logo.dart';

class LoginScreen extends ConsumerStatefulWidget {
  final int initialTabIndex; // 0 for Masuk, 1 for Daftar
  final String? initialResetToken;
  final bool openForgotPasswordImmediately;
  final String? initialVerifyEmail;
  final String? initialVerifyPin;

  const LoginScreen({
    super.key,
    this.initialTabIndex = 0,
    this.initialResetToken,
    this.openForgotPasswordImmediately = false,
    this.initialVerifyEmail,
    this.initialVerifyPin,
  });

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  late int _activeTabIndex;

  // Masuk Form controllers
  final _masukEmailController = TextEditingController(text: 'hafiz@liveeuy.id');
  final _masukPassController = TextEditingController(text: 'LiveEuy#2026');
  bool _masukPassObscure = true;
  bool _rememberMe = true;

  // Brute-force rate limiting state (Section 5.1 & Matriks QA #11)
  int _failedLoginAttempts = 0;
  int _lockoutSecondsRemaining = 0;
  Timer? _lockoutTimer;

  // Daftar Form controllers
  final _daftarNameController = TextEditingController();
  final _daftarEmailController = TextEditingController();
  final _daftarPassController = TextEditingController();
  bool _daftarPassObscure = true;
  bool _termsAgree = true;

  // Password strength
  String _strengthLabel = 'Belum diisi';
  Color _strengthColor = AppColors.onSurfaceVariant;
  int _strengthScore = 0; // 0 to 4

  bool _isLoading = false;

  final List<Map<String, String>> _cinemaTrends = [
    {
      'title': 'Cyber Odyssey',
      'badge': 'TOP 1',
      'poster':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAK5V153bbQ1s5oEJ2ZgQZunyk3m0O60Tff4xmQ5dfbPk-8KiOO18pMv04123-J0ma4_0qUWnv3NGH1MoHZ6Hy7JzdK6FgyY3sLP9FZV5bOJeDBfczxRI-b0-LElWonAg0ZvVAqjuq2Oc2oArVEFBrq7S8fv1RVu64T6UN4zcl0G37U8DqvzAICbUDIXX4Tc5RNSy-p4CKusRBxpOAfI33wV3p-lzkjLQL0jm-A7NDdNF7wpt-is7dW',
    },
    {
      'title': 'Midnight Protocol',
      'badge': 'FULL HD',
      'poster':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDbGSDFGu3qch76hw_LKlHUowehX4gSLBJfiANzLFc4OtwRkrHtSDD7n2EiQLSDpQIZuDFoDo5f_IvDysajdJmcV4jdf4TMxe5kFRmch0JsgeHRQCsS2Vd_h-qFv-mwt26YGpGCb_ywnGlUTzs9_RP5nGXuBI6Ppg7BKpBjnGLhXbWz1dywWAtd37BHKJD-ca43B-_HIpgAEnYcZbMDZaAWhBFpVxJkDy2uv1QnknRfY8B3ZeBYRygS',
    },
    {
      'title': 'Crown of Embers',
      'badge': 'SERIES',
      'poster':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDI15jlVSATE91AslqbNa9YUhHrvv9RHBxlfUd9xPfgYzjkIjwXw5uRE9We6ieYUP-7rmumavPHt5C9HHT7w7agFY61mXwlOdcwxgogwDruZ_8s_i1AbgabCdTE6TgiEWmjDlv-IZrpJA0LC1iKNTPMDStMblfJfMNKNYM5ijE66yrJesq4mhM-GdU1F7aeCp2brdzu5HpXuhEIP8344t2jRLPPNW54ZhBM1u4FxfuihfdOfbTSQ5YB',
    },
  ];

  @override
  void initState() {
    super.initState();
    _activeTabIndex = widget.initialTabIndex;

    if (widget.initialVerifyEmail != null && widget.initialVerifyEmail!.isNotEmpty) {
      _activeTabIndex = 1;
      _daftarEmailController.text = widget.initialVerifyEmail!;
      _daftarNameController.text = widget.initialVerifyEmail!.split('@').first;
    }

    if (widget.openForgotPasswordImmediately ||
        (widget.initialResetToken != null && widget.initialResetToken!.isNotEmpty)) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _handleForgotPassword(initialToken: widget.initialResetToken);
        }
      });
    } else if (widget.initialVerifyEmail != null && widget.initialVerifyEmail!.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _showRegisterPinVerificationSheet(
            name: _daftarNameController.text.isNotEmpty ? _daftarNameController.text : 'Pengguna Baru',
            email: widget.initialVerifyEmail!,
            pass: '',
            initialPin: widget.initialVerifyPin,
          );
        }
      });
    }
  }

  @override
  void dispose() {
    _lockoutTimer?.cancel();
    _masukEmailController.dispose();
    _masukPassController.dispose();
    _daftarNameController.dispose();
    _daftarEmailController.dispose();
    _daftarPassController.dispose();
    super.dispose();
  }

  void _startLockoutCountdown() {
    setState(() {
      _lockoutSecondsRemaining = 60;
    });
    _lockoutTimer?.cancel();
    _lockoutTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        if (_lockoutSecondsRemaining > 1) {
          _lockoutSecondsRemaining--;
        } else {
          _lockoutSecondsRemaining = 0;
          _failedLoginAttempts = 0;
          timer.cancel();
        }
      });
    });
  }

  void _showToast(String title, String message, {IconData icon = Icons.verified_rounded}) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryContainer,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(icon, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    message,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.surfaceContainerHighest.withValues(alpha: 0.95),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _evaluatePasswordStrength(String val) {
    int score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 8 && RegExp(r'[A-Z]').hasMatch(val)) score++;
    if (RegExp(r'[0-9]').hasMatch(val)) score++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(val)) score++;

    setState(() {
      _strengthScore = score;
      if (val.isEmpty) {
        _strengthLabel = 'Belum diisi';
        _strengthColor = AppColors.onSurfaceVariant;
      } else if (score <= 1) {
        _strengthLabel = 'Lemah';
        _strengthColor = const Color(0xFFFBBF24);
      } else if (score == 2 || score == 3) {
        _strengthLabel = 'Sedang';
        _strengthColor = AppColors.secondary;
      } else {
        _strengthLabel = 'Sangat Kuat';
        _strengthColor = AppColors.tertiaryFixed;
      }
    });
  }

  void _handleMasuk() async {
    final email = _masukEmailController.text.trim();
    final pass = _masukPassController.text.trim();

    if (_lockoutSecondsRemaining > 0) {
      _showToast(
        'Form Terkunci Sementara',
        'Terlalu banyak percobaan gagal. Tunggu $_lockoutSecondsRemaining detik.',
        icon: Icons.timer_outlined,
      );
      return;
    }

    if (email.isEmpty) {
      _showToast('Validasi Gagal', 'Masukkan email atau username Anda', icon: Icons.warning_rounded);
      return;
    }

    setState(() => _isLoading = true);

    // 1. Jalankan Device Conflict Checker (Web vs Mobile Single Session Rule)
    final conflictCheck = await ref.read(authProvider.notifier).checkDeviceConflict(email);
    if (!mounted) return;

    if (conflictCheck.hasWebConflict) {
      setState(() => _isLoading = false);
      _showDeviceConflictDialog(conflictCheck, email, pass);
      return;
    }

    try {
      final success = await ref.read(authProvider.notifier).login(email, pass, _rememberMe);
      if (mounted) {
        setState(() => _isLoading = false);
        if (success) {
          _failedLoginAttempts = 0;
          _showToast('Verifikasi Berhasil', 'Selamat menonton film favoritmu!', icon: Icons.check_circle_rounded);
          Navigator.pop(context);
        } else {
          _failedLoginAttempts++;
          if (_failedLoginAttempts >= 5) {
            _startLockoutCountdown();
            _showToast('Keamanan Terpicu', 'Form login dikunci 60 detik demi keamanan akun.', icon: Icons.lock_clock_rounded);
          } else {
            _showToast('Masuk Gagal', 'Kredensial atau otentikasi tidak valid (${5 - _failedLoginAttempts}x percobaan tersisa)', icon: Icons.error_outline_rounded);
          }
        }
      }
    } on DioException catch (dioErr) {
      if (mounted) {
        setState(() => _isLoading = false);
        _failedLoginAttempts++;
        if (_failedLoginAttempts >= 5) {
          _startLockoutCountdown();
          _showToast('Keamanan Terpicu', 'Form login dikunci 60 detik demi keamanan akun.', icon: Icons.lock_clock_rounded);
        } else {
          _showToast(
            'Masuk Gagal',
            dioErr.message,
            icon: Icons.error_outline_rounded,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showToast('Masuk Gagal', 'Terjadi kesalahan sistem: $e', icon: Icons.error_outline_rounded);
      }
    }
  }

  void _showDeviceConflictDialog(DeviceCheckResult conflictResult, String email, String pass) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          bool isTakeoverProcessing = false;
          return DeviceConflictDialog(
            conflictResult: conflictResult,
            isProcessing: isTakeoverProcessing,
            onCancel: () {
              Navigator.of(dialogCtx).pop();
              _showToast(
                'Masuk Dibatalkan',
                'Sesi akun Anda tetap aktif di Web Browser.',
                icon: Icons.info_outline_rounded,
              );
            },
            onConfirmTakeover: () async {
              setDialogState(() => isTakeoverProcessing = true);
              try {
                final success = await ref.read(authProvider.notifier).login(
                      email,
                      pass,
                      _rememberMe,
                      forceTakeover: true,
                    );
                if (dialogCtx.mounted) {
                  Navigator.of(dialogCtx).pop();
                }
                if (!mounted) return;
                if (success) {
                  _showToast(
                    'Sesi Web Dikeluarkan',
                    'Akun Anda kini aktif di perangkat Mobile ini.',
                    icon: Icons.phonelink_lock_rounded,
                  );
                  Navigator.pop(context);
                } else {
                  _showToast(
                    'Gagal Mengambil Alih Sesi',
                    'Terjadi kesalahan saat mencabut sesi Web.',
                    icon: Icons.error_outline_rounded,
                  );
                }
              } on DioException catch (dioErr) {
                if (dialogCtx.mounted) {
                  Navigator.of(dialogCtx).pop();
                }
                if (mounted) {
                  _showToast(
                    'Gagal Masuk',
                    dioErr.message,
                    icon: Icons.error_outline_rounded,
                  );
                }
              } catch (_) {
                if (dialogCtx.mounted) {
                  Navigator.of(dialogCtx).pop();
                }
                if (mounted) {
                  _showToast(
                    'Gagal Mengambil Alih Sesi',
                    'Terjadi kesalahan saat mencabut sesi Web.',
                    icon: Icons.error_outline_rounded,
                  );
                }
              }
            },
          );
        },
      ),
    );
  }

  void _handleDaftar() {
    final name = _daftarNameController.text.trim();
    final email = _daftarEmailController.text.trim();
    final pass = _daftarPassController.text.trim();

    if (name.isEmpty) {
      _showToast('Validasi Gagal', 'Nama lengkap wajib diisi', icon: Icons.warning_rounded);
      return;
    }
    if (email.isEmpty || !email.contains('@')) {
      _showToast('Validasi Gagal', 'Alamat email tidak valid', icon: Icons.warning_rounded);
      return;
    }
    if (pass.length < 6) {
      _showToast('Validasi Gagal', 'Password minimal 6 karakter', icon: Icons.warning_rounded);
      return;
    }
    if (!_termsAgree) {
      _showToast('Persetujuan Diperlukan', 'Harap setujui Ketentuan Layanan', icon: Icons.info_outline_rounded);
      return;
    }

    _showRegisterPinVerificationSheet(name: name, email: email, pass: pass);
  }

  void _showRegisterPinVerificationSheet({
    required String name,
    required String email,
    required String pass,
    String? initialPin,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => _RegisterPinVerificationSheet(
        name: name,
        email: email,
        password: pass,
        initialPin: initialPin,
        onVerificationSuccess: () {
          if (mounted) {
            _showToast(
              'Pendaftaran Berhasil',
              'Akun dan PIN keamanan berhasil dibuat. Selamat datang!',
              icon: Icons.check_circle_rounded,
            );
            Navigator.pop(context);
          }
        },
      ),
    );
  }

  void _handleSocial(String platform) {
    _showToast('Otorisasi $platform', 'Membuka gerbang aman akun...', icon: Icons.lock_open_rounded);
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        ref.read(authProvider.notifier).login('user.$platform@streamflix.id', 'SocialPass', true);
        Navigator.pop(context);
      }
    });
  }

  void _handleForgotPassword({String? initialToken}) {
    final emailInitial = _masukEmailController.text.trim();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => _ForgotPasswordSheet(
        initialEmail: emailInitial,
        initialToken: initialToken,
        onResetSuccess: (newPass) {
          if (mounted) {
            _masukPassController.text = newPass;
            _showToast(
              'Kata Sandi Berhasil Direset',
              'Silakan masuk menggunakan kata sandi baru Anda.',
              icon: Icons.check_circle_rounded,
            );
          }
        },
      ),
    );
  }

  void _handleDemoPersona(String persona) async {
    setState(() => _isLoading = true);
    try {
      final success = await ref.read(authProvider.notifier).demoLogin(persona, rememberMe: _rememberMe);
      if (mounted) {
        setState(() => _isLoading = false);
        if (success) {
          _showToast(
            'Demo Login Berhasil',
            'Masuk sebagai akun $persona',
            icon: Icons.check_circle_rounded,
          );
          Navigator.pop(context);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showToast('Demo Login Gagal', '$e', icon: Icons.error_outline_rounded);
      }
    }
  }

  Widget _buildDemoPersonaButton(String label, String persona, IconData icon) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.onSurface,
        side: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.4)),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      onPressed: _isLoading ? null : () => _handleDemoPersona(persona),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: persona == 'ultra' ? AppColors.accentGold : AppColors.primary),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Subtle Cinematic Ambient Glow
          Positioned(
            top: -60,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 260,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryContainer.withValues(alpha: 0.14),
                ),
              ),
            ),
          ),

          // Scrollable Content
          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: Column(
                children: [
                  // Back button on top left if can pop
                  if (Navigator.canPop(context))
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        icon: const Icon(Icons.arrow_back_rounded, color: AppColors.onSurface),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),

                  // Header Branding Area
                  Center(
                    child: Column(
                      children: [
                        const SizedBox(height: 4),
                        const StreamFlixLogo(fontSize: 26, height: 40),
                        const SizedBox(height: 16),

                        const SizedBox(height: 20),

                        // Heading with Editorial Typography
                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            style: GoogleFonts.outfit(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: AppColors.onSurface,
                              height: 1.2,
                              letterSpacing: -0.3,
                            ),
                            children: [
                              const TextSpan(text: 'Nonton Film & Serial Pilihan '),
                              TextSpan(
                                text: 'Kualitas Tinggi',
                                style: GoogleFonts.outfit(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Streaming film, anime, dan serial terlengkap dengan audio visual jernih.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.onSurfaceVariant.withValues(alpha: 0.85),
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Main Interaction Card Container
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainer.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.glassBorder),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.surfaceContainerLowest.withValues(alpha: 0.6),
                          blurRadius: 24,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Segmented Tab Switcher (Masuk <-> Daftar)
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceContainerLowest.withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _activeTabIndex = 0),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: _activeTabIndex == 0 ? AppColors.primaryContainer : Colors.transparent,
                                      borderRadius: BorderRadius.circular(8),
                                      boxShadow: _activeTabIndex == 0
                                          ? [
                                              BoxShadow(
                                                color: AppColors.primaryContainer.withValues(alpha: 0.4),
                                                blurRadius: 10,
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.login_rounded,
                                          size: 18,
                                          color: _activeTabIndex == 0 ? Colors.white : AppColors.onSurfaceVariant,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Masuk',
                                          style: GoogleFonts.outfit(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                            color: _activeTabIndex == 0 ? Colors.white : AppColors.onSurfaceVariant,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _activeTabIndex = 1),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    decoration: BoxDecoration(
                                      color: _activeTabIndex == 1 ? AppColors.primaryContainer : Colors.transparent,
                                      borderRadius: BorderRadius.circular(8),
                                      boxShadow: _activeTabIndex == 1
                                          ? [
                                              BoxShadow(
                                                color: AppColors.primaryContainer.withValues(alpha: 0.4),
                                                blurRadius: 10,
                                              ),
                                            ]
                                          : null,
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.person_add_rounded,
                                          size: 18,
                                          color: _activeTabIndex == 1 ? Colors.white : AppColors.onSurfaceVariant,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Daftar',
                                          style: GoogleFonts.outfit(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                            color: _activeTabIndex == 1 ? Colors.white : AppColors.onSurfaceVariant,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Form Switcher
                        if (_activeTabIndex == 0) _buildMasukForm() else _buildDaftarForm(),

                        const SizedBox(height: 20),

                        // Cinematic Separator
                        Row(
                          children: [
                            const Expanded(child: Divider(color: AppColors.surfaceVariant)),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 10.0),
                              child: Text(
                                'atau masuk dengan',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: AppColors.onSurfaceVariant,
                                ),
                              ),
                            ),
                            const Expanded(child: Divider(color: AppColors.surfaceVariant)),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Social Button: Google Auth Only (Apple Login removed)
                        SizedBox(
                          width: double.infinity,
                          child: _buildGoogleButton(
                            onTap: () => _handleSocial('Google'),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Security Guarantee Footer Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.verified_user_rounded, size: 16, color: AppColors.outline),
                      const SizedBox(width: 6),
                      Text(
                        'Akses Streaming Cepat & Terenkripsi Aman',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: AppColors.outline,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 28),

                  // Quick Preview Tray: Sedang Tren di Bioskop
                  _buildCinemaTrendTray(),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Masuk Form
  Widget _buildMasukForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Email or Username
        Text(
          'Email atau Username',
          style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant),
        ),
        const SizedBox(height: 6),
        _buildTextField(
          controller: _masukEmailController,
          hint: 'alex@streamflix.id',
          icon: Icons.mail_outline_rounded,
        ),
        const SizedBox(height: 14),

        // Password
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Kata Sandi',
              style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant),
            ),
            GestureDetector(
              onTap: _handleForgotPassword,
              child: Text(
                'Lupa Password?',
                style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        _buildTextField(
          controller: _masukPassController,
          hint: '••••••••',
          icon: Icons.lock_outline_rounded,
          isPassword: true,
          obscureText: _masukPassObscure,
          onToggleVisibility: () => setState(() => _masukPassObscure = !_masukPassObscure),
        ),
        const SizedBox(height: 12),

        // Remember Me & 256-Bit Encryption
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => setState(() => _rememberMe = !_rememberMe),
              child: Row(
                children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: _rememberMe ? AppColors.primaryContainer : AppColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: _rememberMe
                        ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
                        : null,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Ingat Saya',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant),
                  ),
                ],
              ),
            ),
            Row(
              children: [
                const Icon(Icons.shield_outlined, size: 14, color: AppColors.outline),
                const SizedBox(width: 4),
                Text(
                  'Sesi Terlindungi',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.outline),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 18),

        // Lockout Banner
        if (_lockoutSecondsRemaining > 0)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.redAccent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
            ),
            child: Row(
              children: [
                const Icon(Icons.lock_clock_rounded, color: Colors.amberAccent, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Form terkunci sementara ($_lockoutSecondsRemaining detik). Terlalu banyak kegagalan autentikasi.',
                    style: GoogleFonts.inter(fontSize: 11, color: Colors.white70),
                  ),
                ),
              ],
            ),
          ),

        // CTA Masuk Button
        GestureDetector(
          onTap: (_isLoading || _lockoutSecondsRemaining > 0) ? null : _handleMasuk,
          child: Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              color: _lockoutSecondsRemaining > 0
                  ? AppColors.surfaceContainerHighest
                  : AppColors.primaryContainer,
              borderRadius: BorderRadius.circular(12),
              boxShadow: _lockoutSecondsRemaining > 0
                  ? null
                  : [
                      BoxShadow(
                        color: AppColors.primaryContainer.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
            ),
            child: Center(
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(
                      _lockoutSecondsRemaining > 0
                          ? 'Terkunci ($_lockoutSecondsRemaining dtk)'
                          : 'Masuk ke Akun',
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.2,
                        color: _lockoutSecondsRemaining > 0 ? AppColors.outline : Colors.white,
                      ),
                    ),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Demo Persona Switcher (Backend Multi-Device Testing)
        Row(
          children: [
            const Expanded(child: Divider(color: AppColors.outlineVariant, height: 1)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Text(
                'ATAU UJI DEMO PERSONA',
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurfaceVariant,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const Expanded(child: Divider(color: AppColors.outlineVariant, height: 1)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildDemoPersonaButton('Tamu (1 Dev)', 'free', Icons.person_outline_rounded),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildDemoPersonaButton('VIP (2 Dev)', 'standard', Icons.star_border_rounded),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildDemoPersonaButton('Ultra (4 Dev)', 'ultra', Icons.diamond_outlined),
            ),
          ],
        ),
      ],
    );
  }

  // Daftar Form
  Widget _buildDaftarForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Nama Lengkap
        Text(
          'Nama Lengkap',
          style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant),
        ),
        const SizedBox(height: 6),
        _buildTextField(
          fieldKey: const Key('daftar_name_field'),
          controller: _daftarNameController,
          hint: 'Rian Pratama',
          icon: Icons.badge_outlined,
        ),
        const SizedBox(height: 14),

        // Email
        Text(
          'Alamat Email Aktif',
          style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant),
        ),
        const SizedBox(height: 6),
        _buildTextField(
          fieldKey: const Key('daftar_email_field'),
          controller: _daftarEmailController,
          hint: 'rian@example.com',
          icon: Icons.alternate_email_rounded,
        ),
        const SizedBox(height: 14),

        // Password with Strength Meter
        Text(
          'Buat Kata Sandi Baru',
          style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant),
        ),
        const SizedBox(height: 6),
        _buildTextField(
          fieldKey: const Key('daftar_pass_field'),
          controller: _daftarPassController,
          hint: 'Minimal 8 karakter',
          icon: Icons.key_rounded,
          isPassword: true,
          obscureText: _daftarPassObscure,
          onChanged: _evaluatePasswordStrength,
          onToggleVisibility: () => setState(() => _daftarPassObscure = !_daftarPassObscure),
        ),
        const SizedBox(height: 6),

        // Password Strength Indicator
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Kekuatan Sandi:', style: GoogleFonts.inter(fontSize: 10, color: AppColors.onSurfaceVariant)),
            Text(
              _strengthLabel,
              style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: _strengthColor),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Row(
          children: List.generate(4, (i) {
            final isMet = (i + 1) <= _strengthScore;
            return Expanded(
              child: Container(
                height: 4,
                margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  color: isMet ? _strengthColor : AppColors.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 14),

        // Terms Agreement
        GestureDetector(
          key: const Key('daftar_terms_checkbox'),
          onTap: () => setState(() => _termsAgree = !_termsAgree),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 20,
                height: 20,
                margin: const EdgeInsets.only(top: 2),
                decoration: BoxDecoration(
                  color: _termsAgree ? AppColors.primaryContainer : AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: _termsAgree
                    ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
                    : null,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant, height: 1.4),
                    children: const [
                      TextSpan(text: 'Saya menyetujui '),
                      TextSpan(
                        text: 'Ketentuan Layanan',
                        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                      ),
                      TextSpan(text: ' & '),
                      TextSpan(
                        text: 'Kebijakan Privasi',
                        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                      ),
                      TextSpan(text: ' LiveEuy.'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // CTA Daftar Button
        GestureDetector(
          key: const Key('daftar_submit_button'),
          onTap: _isLoading ? null : _handleDaftar,
          child: Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryContainer.withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Center(
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(
                      'Daftar Akun Baru',
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.2,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    Key? fieldKey,
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isPassword = false,
    bool obscureText = false,
    ValueChanged<String>? onChanged,
    VoidCallback? onToggleVisibility,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(10),
      ),
      child: TextField(
        key: fieldKey,
        controller: controller,
        obscureText: isPassword ? obscureText : false,
        onChanged: onChanged,
        style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: AppColors.onSurfaceVariant.withValues(alpha: 0.7), size: 20),
          suffixIcon: isPassword
              ? GestureDetector(
                  onTap: onToggleVisibility,
                  child: Icon(
                    obscureText ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                    color: AppColors.onSurfaceVariant,
                    size: 20,
                  ),
                )
              : null,
          hintText: hint,
          hintStyle: GoogleFonts.inter(color: AppColors.onSurfaceVariant.withValues(alpha: 0.4), fontSize: 13),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildGoogleButton({required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 16),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.outlineVariant.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
              ),
              child: Center(
                child: Text(
                  'G',
                  style: GoogleFonts.outfit(
                    color: const Color(0xFF4285F4),
                    fontWeight: FontWeight.w800,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              'Lanjutkan dengan Google',
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCinemaTrendTray() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Sedang Tren di Bioskop',
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.onSurface,
              ),
            ),
            GestureDetector(
              onTap: () {
                _showToast('Katalog Bioskop', 'Jelajahi tayangan bioskop terbaru setelah masuk', icon: Icons.local_movies_rounded);
              },
              child: Row(
                children: [
                  Text(
                    'Lihat Semua',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded, size: 16, color: AppColors.primary),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 170,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _cinemaTrends.length,
            itemBuilder: (context, index) {
              final item = _cinemaTrends[index];
              return GestureDetector(
                onTap: () {
                  _showToast(item['title']!, 'Tersedia di katalog streaming LiveEuy', icon: Icons.movie_rounded);
                },
                child: Container(
                  width: 115,
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: AppColors.surfaceContainerLow,
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        CachedNetworkImage(
                          imageUrl: item['poster']!,
                          fit: BoxFit.cover,
                        ),
                        Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                              colors: [
                                AppColors.surfaceContainerLowest,
                                Colors.transparent,
                              ],
                              stops: [0.0, 0.5],
                            ),
                          ),
                        ),
                        Positioned(
                          top: 6,
                          left: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(
                              color: item['badge'] == 'TOP 1'
                                  ? AppColors.primaryContainer
                                  : AppColors.surfaceBright,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              item['badge']!,
                              style: GoogleFonts.outfit(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 6,
                          left: 6,
                          right: 6,
                          child: Text(
                            item['title']!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _ForgotPasswordSheet extends ConsumerStatefulWidget {
  final String initialEmail;
  final String? initialToken;
  final ValueChanged<String> onResetSuccess;

  const _ForgotPasswordSheet({
    required this.initialEmail,
    this.initialToken,
    required this.onResetSuccess,
  });

  @override
  ConsumerState<_ForgotPasswordSheet> createState() => _ForgotPasswordSheetState();
}

class _ForgotPasswordSheetState extends ConsumerState<_ForgotPasswordSheet> {
  int _step = 1; // 1: Input email, 2: Input token & new password
  late final TextEditingController _emailController;
  final TextEditingController _tokenController = TextEditingController();
  final TextEditingController _newPassController = TextEditingController();
  final TextEditingController _confirmPassController = TextEditingController();

  bool _obscureNewPass = true;
  bool _obscureConfirmPass = true;
  bool _isLoading = false;
  String? _errorMessage;
  String? _infoMessage;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController(text: widget.initialEmail);
    if (widget.initialToken != null && widget.initialToken!.isNotEmpty) {
      _step = 2;
      _tokenController.text = widget.initialToken!;
      _infoMessage = 'Token verifikasi terdeteksi dari tautan reset sandi.';
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _tokenController.dispose();
    _newPassController.dispose();
    _confirmPassController.dispose();
    super.dispose();
  }

  Future<void> _handleSendResetLink() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _errorMessage = 'Masukkan alamat email yang valid.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final success = await ref.read(authProvider.notifier).forgotPassword(email);

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      if (success) {
        _step = 2;
        _tokenController.text = '123456';
        _infoMessage = 'Tautan atau token pemulihan (123456) telah dikirim ke $email.';
      } else {
        _errorMessage = 'Gagal mengirim instruksi pemulihan. Pastikan email terdaftar.';
      }
    });
  }

  Future<void> _handleResetPassword() async {
    final token = _tokenController.text.trim();
    final newPass = _newPassController.text.trim();
    final confirmPass = _confirmPassController.text.trim();

    if (token.isEmpty) {
      setState(() => _errorMessage = 'Token pemulihan tidak boleh kosong.');
      return;
    }
    if (newPass.length < 6) {
      setState(() => _errorMessage = 'Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPass != confirmPass) {
      setState(() => _errorMessage = 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final success = await ref
        .read(authProvider.notifier)
        .resetPassword(token: token, newPassword: newPass);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      Navigator.pop(context);
      widget.onResetSuccess(newPass);
    } else {
      setState(() {
        _errorMessage = 'Token tidak valid atau sudah kedaluwarsa. Silakan coba kembali.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + bottomInset),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: AppColors.glassBorder),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryContainer.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.lock_reset_rounded,
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      _step == 1 ? 'Lupa Kata Sandi' : 'Setel Ulang Sandi',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.outline),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              _step == 1
                  ? 'Masukkan email akun LiveEuy Anda untuk menerima token atau tautan pemulihan kata sandi.'
                  : 'Masukkan token verifikasi yang dikirimkan ke email Anda dan tentukan kata sandi baru.',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            if (_infoMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.mark_email_read_rounded, color: AppColors.primary, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _infoMessage!,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],
            if (_errorMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.errorContainer.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.errorContainer),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.error,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],
            if (_step == 1) ...[
              TextField(
                key: const Key('forgot_password_email_field'),
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Alamat Email',
                  hintText: 'nama@email.com',
                  labelStyle: GoogleFonts.inter(color: AppColors.outline, fontSize: 12),
                  hintStyle: GoogleFonts.inter(color: AppColors.outlineVariant, fontSize: 12),
                  prefixIcon: const Icon(Icons.mail_outline_rounded, color: AppColors.outline, size: 20),
                  filled: true,
                  fillColor: AppColors.surfaceContainerLowest,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  key: const Key('forgot_password_send_link_button'),
                  onPressed: _isLoading ? null : _handleSendResetLink,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryContainer,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(
                          'Kirim Tautan / Token',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                ),
              ),
              const SizedBox(height: 10),
              Center(
                child: TextButton(
                  key: const Key('forgot_password_switch_step_button'),
                  onPressed: () => setState(() => _step = 2),
                  child: Text(
                    'Sudah punya token pemulihan? Masukkan di sini',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ] else ...[
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 8,
                runSpacing: 4,
                children: [
                  Text(
                    'Simulasi Cepat Token:',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant),
                  ),
                  TextButton.icon(
                    key: const Key('forgot_password_demo_token_button'),
                    onPressed: () {
                      setState(() {
                        _tokenController.text = '123456';
                        _newPassController.text = 'PasswordBaru#2026';
                        _confirmPassController.text = 'PasswordBaru#2026';
                        _errorMessage = null;
                      });
                    },
                    icon: const Icon(Icons.bolt_rounded, size: 14, color: AppColors.accentGold),
                    label: Text(
                      'Isi Token Demo (123456)',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accentGold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                key: const Key('forgot_password_token_field'),
                controller: _tokenController,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Token Pemulihan',
                  hintText: 'Contoh: rst-tok-8472...',
                  labelStyle: GoogleFonts.inter(color: AppColors.outline, fontSize: 12),
                  hintStyle: GoogleFonts.inter(color: AppColors.outlineVariant, fontSize: 12),
                  prefixIcon: const Icon(Icons.vpn_key_outlined, color: AppColors.outline, size: 20),
                  filled: true,
                  fillColor: AppColors.surfaceContainerLowest,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                key: const Key('forgot_password_new_pass_field'),
                controller: _newPassController,
                obscureText: _obscureNewPass,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Kata Sandi Baru (Min. 6 Karakter)',
                  labelStyle: GoogleFonts.inter(color: AppColors.outline, fontSize: 12),
                  prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.outline, size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureNewPass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      color: AppColors.outline,
                      size: 18,
                    ),
                    onPressed: () => setState(() => _obscureNewPass = !_obscureNewPass),
                  ),
                  filled: true,
                  fillColor: AppColors.surfaceContainerLowest,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                key: const Key('forgot_password_confirm_pass_field'),
                controller: _confirmPassController,
                obscureText: _obscureConfirmPass,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Konfirmasi Kata Sandi Baru',
                  labelStyle: GoogleFonts.inter(color: AppColors.outline, fontSize: 12),
                  prefixIcon: const Icon(Icons.check_circle_outline_rounded, color: AppColors.outline, size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirmPass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      color: AppColors.outline,
                      size: 18,
                    ),
                    onPressed: () => setState(() => _obscureConfirmPass = !_obscureConfirmPass),
                  ),
                  filled: true,
                  fillColor: AppColors.surfaceContainerLowest,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  key: const Key('forgot_password_submit_button'),
                  onPressed: _isLoading ? null : _handleResetPassword,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryContainer,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(
                          'Perbarui Kata Sandi',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                ),
              ),
              const SizedBox(height: 10),
              Center(
                child: TextButton(
                  onPressed: () => setState(() => _step = 1),
                  child: Text(
                    'Kembali ke Kirim Tautan',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.outline,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _RegisterPinVerificationSheet extends ConsumerStatefulWidget {
  final String name;
  final String email;
  final String password;
  final String? initialPin;
  final VoidCallback onVerificationSuccess;

  const _RegisterPinVerificationSheet({
    required this.name,
    required this.email,
    required this.password,
    this.initialPin,
    required this.onVerificationSuccess,
  });

  @override
  ConsumerState<_RegisterPinVerificationSheet> createState() => _RegisterPinVerificationSheetState();
}

class _RegisterPinVerificationSheetState extends ConsumerState<_RegisterPinVerificationSheet> {
  final TextEditingController _pinController = TextEditingController();
  int _countdown = 30;
  Timer? _countdownTimer;
  bool _isLoading = false;
  String? _errorMessage;
  String? _infoMessage;

  @override
  void initState() {
    super.initState();
    if (widget.initialPin != null && widget.initialPin!.isNotEmpty) {
      _pinController.text = widget.initialPin!;
    }
    _startTimer();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_countdown > 1) {
        setState(() => _countdown--);
      } else {
        setState(() => _countdown = 0);
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _pinController.dispose();
    super.dispose();
  }

  Future<void> _handleResendPin() async {
    setState(() {
      _countdown = 60;
      _infoMessage = 'Mengirimkan kode PIN verifikasi ke ${widget.email}...';
      _errorMessage = null;
    });
    _startTimer();
    final res = await ref.read(authProvider.notifier).resendVerificationPin(widget.email);
    if (!mounted) return;
    setState(() {
      if (res) {
        _infoMessage = 'Kode PIN verifikasi baru telah dikirimkan ke ${widget.email}.';
      } else {
        _errorMessage = 'Gagal mengirim ulang kode PIN. Silakan coba lagi.';
      }
    });
  }

  Future<void> _handleVerifyAndRegister() async {
    final pin = _pinController.text.trim();
    if (pin.length < 4 || pin.length > 6 || int.tryParse(pin) == null) {
      setState(() => _errorMessage = 'Masukkan PIN berupa 4-6 digit angka.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final isValid = await ref.read(authProvider.notifier).verifyRegistrationPin(widget.email, pin);
      if (!isValid) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = 'PIN tidak valid. Harap periksa kembali.';
          });
        }
        return;
      }

      final success = await ref.read(authProvider.notifier).register(
        widget.name,
        widget.email,
        widget.password,
        'VIP Standard',
        pin,
      );

      if (mounted) {
        setState(() => _isLoading = false);
        if (success) {
          Navigator.pop(context);
          widget.onVerificationSuccess();
        } else {
          setState(() => _errorMessage = 'Pendaftaran gagal. Silakan coba kembali.');
        }
      }
    } on DioException catch (dioErr) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = dioErr.message;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Terjadi kesalahan sistem: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + bottomInset),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHigh.withValues(alpha: 0.98),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: AppColors.glassBorder),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryContainer.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.pin_outlined,
                        color: AppColors.primary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Verifikasi PIN Akun',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.outline),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Buat 4-digit PIN keamanan untuk memverifikasi akun (${widget.email}) dan mengaktifkan profil tontonan keluarga.',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),

            if (_infoMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.mark_email_read_rounded, color: AppColors.primary, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _infoMessage!,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

            if (_errorMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.errorContainer.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.errorContainer),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.error,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

            // 4 PIN Boxes display
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (index) {
                final hasVal = _pinController.text.length > index;
                final val = hasVal ? _pinController.text[index] : '';
                final isCurrent = _pinController.text.length == index;
                return Container(
                  width: 52,
                  height: 56,
                  margin: const EdgeInsets.symmetric(horizontal: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isCurrent
                          ? AppColors.primary
                          : (hasVal
                              ? AppColors.primaryContainer
                              : AppColors.outlineVariant.withValues(alpha: 0.3)),
                      width: isCurrent ? 2 : 1,
                    ),
                    boxShadow: isCurrent
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.25),
                              blurRadius: 8,
                            )
                          ]
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    hasVal ? val : '—',
                    style: GoogleFonts.outfit(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: hasVal ? Colors.white : AppColors.outline,
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 16),

            // PIN Text Field for direct keyboard input
            TextField(
              key: const Key('register_pin_input_field'),
              controller: _pinController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                fontSize: 18,
                letterSpacing: 6,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
              decoration: InputDecoration(
                counterText: '',
                hintText: 'Ketik 4-digit PIN di sini',
                hintStyle: GoogleFonts.inter(color: AppColors.outlineVariant, fontSize: 12, letterSpacing: 0),
                filled: true,
                fillColor: AppColors.surfaceContainerLowest,
                prefixIcon: const Icon(Icons.shield_outlined, color: AppColors.outline, size: 20),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.3)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
              onChanged: (val) {
                setState(() {});
              },
            ),
            const SizedBox(height: 12),

            // Demo Fill Pill Button
            Center(
              child: OutlinedButton.icon(
                key: const Key('register_pin_demo_button'),
                onPressed: () {
                  setState(() {
                    _pinController.text = '1234';
                    _errorMessage = null;
                  });
                },
                icon: const Icon(Icons.bolt_rounded, size: 15, color: AppColors.accentGold),
                label: Text(
                  'Gunakan PIN Demo: 1234',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.accentGold,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.accentGold.withValues(alpha: 0.4)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Resend Countdown Row
            Center(
              child: Wrap(
                alignment: WrapAlignment.center,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 4,
                children: [
                  Text(
                    'Tidak menerima kode verifikasi? ',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant),
                  ),
                  if (_countdown > 0)
                    Text(
                      'Kirim ulang (${_countdown}d)',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.outline,
                        fontWeight: FontWeight.w600,
                      ),
                    )
                  else
                    GestureDetector(
                      key: const Key('register_pin_resend_button'),
                      onTap: _handleResendPin,
                      child: Text(
                        'Kirim Ulang PIN',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                key: const Key('register_pin_submit_button'),
                onPressed: _isLoading ? null : _handleVerifyAndRegister,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryContainer,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        'Verifikasi & Selesaikan Pendaftaran',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

