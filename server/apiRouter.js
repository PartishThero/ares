/**
 * USGS Planetary Nomenclature API Router
 * Dispatches HTTP requests to featuresService and returns standard GeoJSON.
 */

import { 
  queryFeaturesByBbox, 
  searchFeatures, 
  getFeatureTypes, 
  getFeatureById,
  countFeatures
} from './featuresService.js';

export function handleApiRequest(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // CORS and JSON Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Only GET is supported.' }));
    return true;
  }

  // Health check
  if (pathname === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'healthy', service: 'usgs-mars-gazetteer-api' }));
    return true;
  }

  // Feature Types breakdown
  if (pathname === '/api/features/types') {
    try {
      const types = getFeatureTypes();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        count: types.length, 
        totalFeatures: countFeatures(), 
        types 
      }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
    return true;
  }

  // Search features by query text
  if (pathname === '/api/features/search') {
    const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '';
    const type = urlObj.searchParams.get('type') || null;
    const limit = urlObj.searchParams.get('limit') || 25;

    try {
      const results = searchFeatures({ query: q, type, limit });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(results));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
    return true;
  }

  // Get single feature by ID: /api/features/:id
  const featureIdMatch = pathname.match(/^\/api\/features\/(\d+)$/);
  if (featureIdMatch) {
    const id = parseInt(featureIdMatch[1], 10);
    try {
      const feature = getFeatureById(id);
      if (!feature) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Feature with ID ${id} not found.` }));
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(feature));
      }
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
    return true;
  }

  // Main BBox Query: GET /api/features?bbox=minLon,minLat,maxLon,maxLat
  if (pathname === '/api/features') {
    const bbox = urlObj.searchParams.get('bbox');
    const type = urlObj.searchParams.get('type') || null;
    const tier = urlObj.searchParams.get('tier') || null;
    const limit = urlObj.searchParams.get('limit') || 200;
    const offset = urlObj.searchParams.get('offset') || 0;

    if (!bbox) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Missing required query parameter "bbox".',
        usage: 'GET /api/features?bbox=minLon,minLat,maxLon,maxLat[&type=...][&tier=...][&limit=...][&offset=...]'
      }));
      return true;
    }

    try {
      const result = queryFeaturesByBbox({ bbox, type, tier, limit, offset });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.end(JSON.stringify(result));
    } catch (err) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
    return true;
  }

  return false;
}
