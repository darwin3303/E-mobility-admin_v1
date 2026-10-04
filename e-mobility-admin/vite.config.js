import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,   // Fail loudly instead of silently jumping to 5174
    host: '0.0.0.0',   // Bind to all interfaces for LAN access
    open: false,
    // Dev proxy: forwards /api requests to backend (no CORS issues in dev)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});