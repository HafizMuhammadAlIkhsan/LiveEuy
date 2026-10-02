import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

class SnackbarHelper {
  static void showError({required String message}) {
    if (Get.isSnackbarOpen) return;
    Get.rawSnackbar(
      message: message,
      backgroundColor: const Color(0xFF93000A),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 3),
      icon: const Icon(Icons.error_outline_rounded, color: Colors.white),
      messageText: Text(
        message,
        style: GoogleFonts.outfit(color: Colors.white, fontSize: 13),
      ),
    );
  }

  static void showSuccess({required String message}) {
    if (Get.isSnackbarOpen) return;
    Get.rawSnackbar(
      message: message,
      backgroundColor: const Color(0xFF1B3A2D),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 3),
      icon: const Icon(Icons.check_circle_outline_rounded, color: Colors.greenAccent),
      messageText: Text(
        message,
        style: GoogleFonts.outfit(color: Colors.white, fontSize: 13),
      ),
    );
  }

  static void showInfo({required String message}) {
    if (Get.isSnackbarOpen) return;
    Get.rawSnackbar(
      message: message,
      backgroundColor: const Color(0xFF1A1A2E),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 3),
      icon: const Icon(Icons.info_outline_rounded, color: Color(0xFF81CFFF)),
      messageText: Text(
        message,
        style: GoogleFonts.outfit(color: Colors.white, fontSize: 13),
      ),
    );
  }
}
