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
          if (id.includes('node_modules/@arcgis') || id.includes('node_modules/@esri') || id.includes('node_modules/@zip.js') || id.includes('node_modules/gl-matrix')) return 'vendor-arcgis-3d';
          if (id.includes('node_modules/ol') || id.includes('node_modules/proj4')) return 'vendor-openlayers';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) return 'vendor-react';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion-')) return 'vendor-motion';
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          if (id.includes('node_modules/lenis')) return 'vendor-scroll';
        }
      }
    }
  }
});
