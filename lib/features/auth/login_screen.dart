import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../shared/widgets/streamflix_logo.dart';

class LoginScreen extends ConsumerStatefulWidget {
  final int initialTabIndex; // 0 for Masuk, 1 for Daftar

  const LoginScreen({
    super.key,
    this.initialTabIndex = 0,
  });

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  late int _activeTabIndex;

  // Masuk Form controllers
  final _masukEmailController = TextEditingController(text: 'alex@streamflix.id');
  final _masukPassController = TextEditingController(text: 'Password123!');
  bool _masukPassObscure = true;
  bool _rememberMe = true;

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
  }

  @override
  void dispose() {
    _masukEmailController.dispose();
    _masukPassController.dispose();
    _daftarNameController.dispose();
    _daftarEmailController.dispose();
    _daftarPassController.dispose();
    super.dispose();
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

    if (email.isEmpty) {
      _showToast('Validasi Gagal', 'Masukkan email atau username Anda', icon: Icons.warning_rounded);
      return;
    }

    setState(() => _isLoading = true);
    final success = await ref.read(authProvider.notifier).login(email, pass, _rememberMe);
    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        _showToast('Verifikasi Berhasil', 'Selamat menonton film favoritmu!', icon: Icons.check_circle_rounded);
        Navigator.pop(context);
      }
    }
  }

  void _handleDaftar() async {
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

    setState(() => _isLoading = true);
    final success = await ref.read(authProvider.notifier).register(name, email, pass);
    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        _showToast('Pendaftaran Berhasil', 'Akun Anda berhasil didaftarkan. Selamat datang!', icon: Icons.check_circle_rounded);
        Navigator.pop(context);
      }
    }
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

  void _handleForgotPassword() {
    _showToast('Pemulihan Sandi', 'Tautan pemulihan dikirimkan ke email terdaftar', icon: Icons.mark_email_read_rounded);
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

                        // Live Ambient Visualizer Strip
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceContainerHigh.withValues(alpha: 0.8),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppColors.tertiary,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'STREAMING FILM & SERIAL MODERN',
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.tertiaryFixed,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Heading with Gradient
                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            style: GoogleFonts.outfit(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: AppColors.onSurface,
                              height: 1.2,
                            ),
                            children: [
                              const TextSpan(text: 'Nonton Film & Serial Favoritmu '),
                              TextSpan(
                                text: 'Tanpa Batas',
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
                          'Streaming ribuan film, anime, dan serial pilihan dengan kualitas audio visual jernih.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppColors.onSurfaceVariant.withValues(alpha: 0.8),
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
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(color: AppColors.tertiary, shape: BoxShape.circle),
                ),
                const SizedBox(width: 4),
                Text(
                  '256-BIT ENCRYPTION',
                  style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.tertiary),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 18),

        // CTA Masuk Button
        GestureDetector(
          onTap: _isLoading ? null : _handleMasuk,
          child: Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryContainer, AppColors.tertiaryContainer],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryContainer.withValues(alpha: 0.4),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(
                      'MASUK SEKARANG',
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
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
          onTap: _isLoading ? null : _handleDaftar,
          child: Container(
            width: double.infinity,
            height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryContainer, Color(0xFF5F5CFF)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryContainer.withValues(alpha: 0.4),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(
                      'DAFTAR SEKARANG',
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
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
            Row(
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
              return Container(
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
              );
            },
          ),
        ),
      ],
    );
  }
}
