import { defineConfig } from 'vite';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const patternsDir = path.join(import.meta.dirname, 'patterns');

// Dev-only endpoint: lets the browser editor persist its current code back
// to patterns/<name>.js, so livecoding in the browser writes real files on disk.
function patternSaverPlugin() {
  return {
    name: 'pattern-saver',
    configureServer(server) {
      server.middlewares.use('/api/save-pattern', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', async () => {
          try {
            const { name, code } = JSON.parse(body);
            if (typeof name !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(name) || typeof code !== 'string') {
              res.statusCode = 400;
              res.end('Invalid name or code');
              return;
            }
            await writeFile(path.join(patternsDir, `${name}.js`), code, 'utf8');
            res.statusCode = 204;
            res.end();
          } catch (err) {
            res.statusCode = 500;
            res.end('Save failed');
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [patternSaverPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Windows/macOS bind mounts do not always emit inotify events
    watch: { usePolling: true, interval: 300 },
  },
});
