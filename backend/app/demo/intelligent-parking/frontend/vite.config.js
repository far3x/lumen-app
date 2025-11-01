import { defineConfig } from 'vite';

export default defineConfig({
  // Configure the dev server to proxy API requests to your FastAPI backend
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:6967', // Your backend server
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:6967', // Proxy websockets
        ws: true,
      },
    },
  },
  // Configure the build output
  build: {
    outDir: '../backend/static', // Build files into a 'static' folder in the backend
    emptyOutDir: true,
  },
});