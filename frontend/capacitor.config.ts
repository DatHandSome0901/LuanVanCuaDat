import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.historical.chatbot',
  appName: 'Luan Van Chatbot',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'http',
    allowNavigation: ['10.0.2.2', 'localhost']
  }
};

export default config;
