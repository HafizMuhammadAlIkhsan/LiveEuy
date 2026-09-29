import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    allowedHosts: true,
    watch: {
      ignored: [
        '**/build/**',
        '**/android/**',
        '**/ios/**',
        '**/.dart_tool/**',
        '**/backend/**',
        '**/auth-service/**',
        '**/catalog-service/**'
      ]
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-hls': ['hls.js']
        }
      }
    }
  }
});
