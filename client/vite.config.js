import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: Vite serves the SPA on :5173 and proxies API/auth calls to the
// Express server on :3000. Build: static output goes to client/dist,
// which Express serves in production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },
});
