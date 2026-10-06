import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Windows/macOS bind mounts do not always emit inotify events
    watch: { usePolling: true, interval: 300 },
  },
});
