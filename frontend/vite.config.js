import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    // Make the server accessible from the host machine
    host: '0.0.0.0', 
    // Enable polling to detect file changes in a container
    watch: {
      usePolling: true,
    },
  },
});