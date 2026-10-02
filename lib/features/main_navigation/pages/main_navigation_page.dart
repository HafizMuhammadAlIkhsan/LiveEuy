import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../features/home/home_screen.dart';
import '../../../features/search/search_screen.dart';
import '../../../features/collection/collection_screen.dart';
import '../../account/presentation/pages/account_page.dart';
import '../controllers/main_navigation_controller.dart';

class MainNavigationPage extends StatelessWidget {
  const MainNavigationPage({super.key});

  @override
  Widget build(BuildContext context) {
    final navController = Get.find<MainNavigationController>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Obx(() {
        final index = navController.currentIndex.value;
        return Stack(
          children: [
            IndexedStack(
              index: index,
              children: [
                HomeScreen(
                  onNavigateTab: navController.navigateToTab,
                  isActive: index == 0,
                ),
                SearchScreen(onNavigateTab: navController.navigateToTab),
                CollectionScreen(
                  onNavigateTab: navController.navigateToTab,
                  onNavigateHome: () => navController.navigateToTab(0),
                ),
                const AccountPage(),
              ],
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: ClipRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface.withValues(alpha: 0.92),
                      border: Border(
                        top: BorderSide(
                          color: AppColors.outlineVariant.withValues(alpha: 0.15),
                          width: 1.0,
                        ),
                      ),
                    ),
                    child: SafeArea(
                      top: false,
                      child: SizedBox(
                        height: 64,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildNavItem(navController, 0, Icons.home_rounded, Icons.home_outlined, 'Beranda'),
                            _buildNavItem(navController, 1, Icons.search_rounded, Icons.search_rounded, 'Cari'),
                            _buildNavItem(navController, 2, Icons.video_library_rounded, Icons.video_library_outlined, 'Koleksi'),
                            _buildNavItem(navController, 3, Icons.account_circle_rounded, Icons.account_circle_outlined, 'Akun'),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildNavItem(
    MainNavigationController controller,
    int index,
    IconData activeIcon,
    IconData inactiveIcon,
    String label,
  ) {
    return Obx(() {
      final isSelected = controller.currentIndex.value == index;
      return Expanded(
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => controller.navigateToTab(index),
            splashColor: AppColors.primaryContainer.withValues(alpha: 0.15),
            highlightColor: Colors.transparent,
            child: SizedBox(
              height: 64,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      if (isSelected)
                        Container(
                          width: 36,
                          height: 28,
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer.withValues(alpha: 0.22),
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      Icon(
                        isSelected ? activeIcon : inactiveIcon,
                        color: isSelected ? AppColors.primary : AppColors.onSurfaceVariant,
                        size: 24,
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    label.toUpperCase(),
                    style: GoogleFonts.outfit(
                      fontSize: 10,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      letterSpacing: 0.8,
                      color: isSelected ? AppColors.primary : AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    });
  }
}
