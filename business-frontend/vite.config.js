import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [nodePolyfills()],
  server: {
    port: 5174,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      x402: '@payai/x402',
    },
  },
  optimizeDeps: {
    include: ['buffer', '@payai/x402-axios'],
  },
});