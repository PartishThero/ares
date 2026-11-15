import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './server/apiRouter.js';

function usgsGazetteerApiPlugin() {
  return {
    name: 'usgs-gazetteer-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const handled = handleApiRequest(req, res);
            if (!handled) next();
          } catch (err) {
            next(err);
          }
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const handled = handleApiRequest(req, res);
            if (!handled) next();
          } catch (err) {
            next(err);
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), usgsGazetteerApiPlugin()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/ol') || id.includes('node_modules/proj4')) {
            return 'vendor-openlayers';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/framer-motion')) {
            return 'vendor-ui';
          }
        }
      }
    }
  }
});
