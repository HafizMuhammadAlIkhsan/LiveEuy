import 'package:flutter/material.dart';
import 'login_screen.dart';

/// RegisterScreen forwards to unified [LoginScreen] with the 'Daftar' tab (index 1) preselected.
class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const LoginScreen(initialTabIndex: 1);
  }
}
