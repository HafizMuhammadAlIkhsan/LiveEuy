import 'package:flutter/material.dart';
import '../../../../features/auth/login_screen.dart';

class LoginPage extends StatelessWidget {
  final int initialTabIndex;
  const LoginPage({super.key, this.initialTabIndex = 0});

  @override
  Widget build(BuildContext context) {
    return LoginScreen(initialTabIndex: initialTabIndex);
  }
}
