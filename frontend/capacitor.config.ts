import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.historical.chatbot',
  appName: 'Luan Van Chatbot',
  webDir: 'dist',
  server: {
    url: 'http://10.0.2.2:3000',
    cleartext: true,
    androidScheme: 'http',
    allowNavigation: ['10.0.2.2', 'localhost', '192.168.1.202']
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
