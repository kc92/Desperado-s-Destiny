// Force refresh: 2025-12-28T12:00
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { visualizer } from 'rollup-plugin-visualizer';

// Handle monorepo structure difference between local (sibling) and Docker (nested)
const sharedPath = fs.existsSync(path.resolve(__dirname, '../shared'))
  ? path.resolve(__dirname, '../shared')
  : path.resolve(__dirname, './shared');

// Determine API target: use Docker service name if VITE_API_URL is set (Docker), otherwise localhost
const apiTarget = process.env.VITE_API_URL || 'http://localhost:5001';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false, // PRODUCTION FIX: false to prevent CI build hangs on headless servers
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  optimizeDeps: {
    include: ['@desperados/shared'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@desperados/shared': sharedPath,
      '@shared': path.resolve(sharedPath, 'src'),
    },
  },
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion'],
          'vendor-state': ['zustand'],
          'game-pages': [
            './src/pages/Actions.tsx',
            './src/pages/Skills.tsx',
            './src/pages/Combat.tsx',
            './src/pages/Crimes.tsx',
          ],
          'social-pages': [
            './src/pages/Mail.tsx',
            './src/pages/Friends.tsx',
            './src/pages/Gang.tsx',
            './src/pages/Leaderboard.tsx',
          ],
          'shop-pages': [
            './src/pages/Shop.tsx',
            './src/pages/Inventory.tsx',
          ],
          'misc-pages': [
            './src/pages/DeckGuide.tsx',
            './src/pages/QuestLog.tsx',
            './src/pages/Achievements.tsx',
            './src/pages/Help.tsx',
            './src/pages/Tutorial.tsx',
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost', // Rewrite cookie domain
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Forward cookie header from browser to backend
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // Log set-cookie headers for debugging
            const setCookieHeaders = proxyRes.headers['set-cookie'];
            if (setCookieHeaders) {
              console.log('Set-Cookie headers from backend:', setCookieHeaders);
            }
          });
        },
      },
      '/socket.io': {
        target: apiTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/'
      ]
    }
  },
});
