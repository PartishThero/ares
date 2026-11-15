/**
 * Standalone API Server for USGS Mars Gazetteer
 * Run with: node server/index.js
 */

import http from 'http';
import { handleApiRequest } from './apiRouter.js';

const PORT = parseInt(process.env.PORT, 10) || 3001;

const server = http.createServer((req, res) => {
  const handled = handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found.' }));
  }
});

server.listen(PORT, () => {
  console.log(`🪐 USGS Mars Gazetteer API server running on http://localhost:${PORT}`);
  console.log(`   Endpoint: GET http://localhost:${PORT}/api/features?bbox=minLon,minLat,maxLon,maxLat`);
  console.log(`   Types:    GET http://localhost:${PORT}/api/features/types`);
  console.log(`   Search:   GET http://localhost:${PORT}/api/features/search?q=gale`);
});

