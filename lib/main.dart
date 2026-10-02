import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/config/app_route.dart';
import 'core/theme/app_theme.dart';
import 'core/storage/local_storage_service.dart';
import 'core/storage/offline_storage_service.dart';
import 'features/main_navigation/bindings/main_binding.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize SharedPreferences
  final prefs = await SharedPreferences.getInstance();

  // Initialize Hive for offline storage
  OfflineStorageService? offlineStorage;
  try {
    await Hive.initFlutter();
    final box = await Hive.openBox<Map>(OfflineStorageService.boxName);
    offlineStorage = OfflineStorageService(box: box);
  } catch (e) {
    debugPrint('Hive init error: $e');
  }

  // Register core services with GetX DI
  final localStorage = LocalStorageService(prefs: prefs);
  Get.put<LocalStorageService>(localStorage, permanent: true);
  if (offlineStorage != null) {
    Get.put<OfflineStorageService>(offlineStorage, permanent: true);
  }

  runApp(const LiveEuyApp());
}

class LiveEuyApp extends StatelessWidget {
  const LiveEuyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'LiveEuy',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: AppRoute.main,
      getPages: AppRoute.pages,
      initialBinding: MainBinding(),
    );
  }
}
