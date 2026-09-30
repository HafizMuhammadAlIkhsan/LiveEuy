import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://i.ytimg.com https://commondatastorage.googleapis.com https://via.placeholder.com",
  "media-src 'self' blob: https://commondatastorage.googleapis.com https://test-streams.mux.dev https://bitdash-a.akamaihd.net https://multiplatform-f.akamaihd.net http://localhost:* https://*.cloudfront.net https://*.cloudflarestream.com",
  "connect-src 'self' http://localhost:* ws://localhost:* https://*.googleapis.com https://test-streams.mux.dev https://commondatastorage.googleapis.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    allowedHosts: ['localhost', '127.0.0.1', '.localhost', '10.0.2.2', '.local'],
    headers: {
      'Content-Security-Policy': cspDirectives,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    },
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
  preview: {
    port: 3000,
    headers: {
      'Content-Security-Policy': cspDirectives,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
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
