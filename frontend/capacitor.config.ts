import type { CapacitorConfig } from '@capacitor/cli';

// ================================================================
// CHE DO PHAT TRIEN (DEV MODE)
// - App load tu vite dev server (http://localhost:5173 qua ngrok)
// - Sua giao dien -> lam moi app la thay ngay, KHONG can build APK
//
// CHE DO SAN XUAT (PROD MODE)  
// - App load tu file dist da build san trong APK
// - Can build APK moi khi cap nhat
// ================================================================

// === CHUYEN CHE DO TAI DAY ===
const DEV_MODE = false; // true = dev (load tu server), false = prod (load tu APK)

// URL cua vite dev server (can chay: npm run dev)
// Dung ngrok URL neu dien thoai khac mang voi may tinh
const DEV_SERVER_URL = 'http://192.168.1.16:5173'; // <= doi thanh ngrok URL hoac IP may tinh

// ================================================================

const config: CapacitorConfig = {
  appId: 'com.historical.chatbot',
  appName: 'Chatbot Historical',
  webDir: 'dist',
  server: DEV_MODE
    ? {
        // Dev: load tu vite dev server (hot reload)
        url: DEV_SERVER_URL,
        cleartext: true,
        androidScheme: 'http',
      }
    : {
        // Prod: load tu APK (file dist da dong goi)
        cleartext: true,
        androidScheme: 'http',
      },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
