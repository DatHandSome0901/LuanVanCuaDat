import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
      watch: {
        ignored: ['**/android/**', '**/ios/**']
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_URL': 'undefined',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
