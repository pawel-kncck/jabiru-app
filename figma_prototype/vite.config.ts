import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    strictPort: true, // fail if port is already in use
    // open: true, // automatically open browser
  },
});
