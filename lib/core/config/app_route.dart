import 'package:get/get.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/bindings/auth_binding.dart';
import '../../features/main_navigation/pages/main_navigation_page.dart';
import '../../features/main_navigation/bindings/main_binding.dart';
import '../../features/media/presentation/pages/detail_page.dart';
import '../../features/media/presentation/bindings/detail_binding.dart';
import '../../features/player/presentation/pages/player_page.dart';
import '../../features/player/presentation/bindings/player_binding.dart';

class AppRoute {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String main = '/main';
  static const String detail = '/detail';
  static const String player = '/player';

  static String get defaultRoute => main;

  static List<GetPage> get pages => [
    GetPage(
      name: main,
      page: () => const MainNavigationPage(),
      binding: MainBinding(),
    ),
    GetPage(
      name: login,
      page: () => const LoginPage(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: register,
      page: () => const RegisterPage(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: detail,
      page: () => const DetailPage(),
      binding: DetailBinding(),
    ),
    GetPage(
      name: player,
      page: () => const PlayerPage(),
      binding: PlayerBinding(),
    ),
  ];
}
