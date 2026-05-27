// ============================================================
// ⚙️ FILE CẤU HÌNH FLUTTER APP
// ⚠️ Thêm file này vào .gitignore nếu chứa thông tin nhạy cảm
// ============================================================

class AppConfig {
  // ── BASE URLs ──────────────────────────────────────────────
  /// URL backend FastAPI (không có dấu / ở cuối)
  static const String apiBaseUrl = 'https://rehydrate-doing-crust.ngrok-free.dev/api/v1';

  /// URL frontend web (không có dấu / ở cuối)
  static const String webBaseUrl = 'https://frontend-omega-pink-49.vercel.app';

  // ── OAUTH DEEP LINK ────────────────────────────────────────
  /// Scheme cho Deep Link callback sau Google OAuth
  /// Phải khớp với android:scheme trong AndroidManifest.xml
  static const String callbackScheme = 'chatbot';

  // ── APP INFO ───────────────────────────────────────────────
  static const String appName = 'Luan Van Chatbot';
  static const String appVersion = '1.0.0';

  // ── COMPUTED ───────────────────────────────────────────────
  /// URL endpoint đăng nhập Google dành cho Flutter
  static String get googleLoginFlutterUrl =>
      '$apiBaseUrl/auth/google/login/flutter?callback_scheme=$callbackScheme';
}
