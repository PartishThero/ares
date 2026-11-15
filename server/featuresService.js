/**
 * USGS Planetary Nomenclature Geospatial Query Service
 * Queries local geospatial SQLite database with R-Tree spatial indexing,
 * with seamless in-memory GeoJSON fallback for serverless environments (Vercel, Netlify).
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

let DatabaseSync = null;
try {
  const sqlite = await import('node:sqlite');
  DatabaseSync = sqlite.DatabaseSync;
} catch (_) {
  // node:sqlite not available on older Node runtimes or some serverless workers
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'usgs_mars_nomenclature.db');
const JSON_PATH = path.join(__dirname, 'data', 'usgs_mars_nomenclature.json');

let dbInstance = null;
let memoryDataset = null;

export function getMemoryDataset() {
  if (memoryDataset) return memoryDataset;
  if (fs.existsSync(JSON_PATH)) {
    try {
      const raw = fs.readFileSync(JSON_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      memoryDataset = parsed.features || [];
      return memoryDataset;
    } catch (e) {
      console.error('Error loading in-memory USGS dataset:', e);
    }
  }
  return [];
}

export function getDatabase() {
  if (dbInstance) return dbInstance;
  if (!DatabaseSync) return null;
  try {
    if (fs.existsSync(DB_PATH)) {
      dbInstance = new DatabaseSync(DB_PATH, { readOnly: true });
      return dbInstance;
    }
  } catch (err) {
    console.warn('SQLite DatabaseSync initialization bypassed:', err.message);
  }
  return null;
}

/**
 * Format a database row into a GeoJSON Feature
 */
export function rowToGeoJsonFeature(row) {
  let category = 'Surface Feature';
  const t = (row.type || '').toLowerCase();
  if (t.includes('crater')) category = 'Crater';
  else if (t.includes('mons') || t.includes('tholus') || t.includes('patera')) category = 'Volcanic Peak';
  else if (t.includes('vallis')) category = 'Valley Channel';
  else if (t.includes('chasma')) category = 'Canyon / Chasma';
  else if (t.includes('planum') || t.includes('planitia') || t.includes('vastitas')) category = 'Plains';
  else if (t.includes('mensa')) category = 'Mesa';
  else if (t.includes('fossa') || t.includes('catena') || t.includes('rupes')) category = 'Tectonic Rift';
  else if (t.includes('albedo')) category = 'Albedo Feature';
  else if (t.includes('chaos')) category = 'Chaos Terrain';

  return {
    type: 'Feature',
    id: row.id,
    geometry: {
      type: 'Point',
      coordinates: [Number(row.lon.toFixed(5)), Number(row.lat.toFixed(5))]
    },
    properties: {
      id: row.id,
      usgs_id: row.usgs_id,
      name: row.name,
      clean_name: row.clean_name,
      type: row.type,
      category,
      code: row.code,
      approval: row.approval,
      approval_date: row.approval_date,
      origin: row.origin,
      diameter_km: row.diameter,
      center_lon_deg: row.center_lon,
      center_lat_deg: row.center_lat,
      tier: row.tier,
      quad_name: row.quad_name,
      quad_code: row.quad_code,
      link: row.link,
      ethnicity: row.ethnicity,
      continent: row.continent,
      bounds: [row.min_lon, row.min_lat, row.max_lon, row.max_lat]
    }
  };
}

/**
 * Parse and validate bounding box string: "minLon,minLat,maxLon,maxLat"
 */
export function parseBbox(bboxParam) {
  if (!bboxParam) {
    throw new Error('Bounding box parameter "bbox" is required. Format: minLon,minLat,maxLon,maxLat');
  }

  let parts;
  if (Array.isArray(bboxParam)) {
    parts = bboxParam.map((p) => parseFloat(p));
  } else if (typeof bboxParam === 'object' && ('minLon' in bboxParam || 'minX' in bboxParam)) {
    const minX = bboxParam.minLon ?? bboxParam.minX;
    const minY = bboxParam.minLat ?? bboxParam.minY;
    const maxX = bboxParam.maxLon ?? bboxParam.maxX;
    const maxY = bboxParam.maxLat ?? bboxParam.maxY;
    parts = [minX, minY, maxX, maxY].map(parseFloat);
  } else if (typeof bboxParam === 'string') {
    parts = bboxParam.split(',').map((p) => parseFloat(p.trim()));
  } else {
    throw new Error('Invalid bbox format. Expected: minLon,minLat,maxLon,maxLat as decimal numbers');
  }

  if (parts.length !== 4 || parts.some((p) => isNaN(p))) {
    throw new Error('Invalid bbox format. Expected: minLon,minLat,maxLon,maxLat as decimal numbers');
  }

  let [minLon, minLat, maxLon, maxLat] = parts;

  // Validate latitude range
  if (minLat < -90) minLat = -90;
  if (maxLat > 90) maxLat = 90;
  if (minLat > maxLat) {
    const tmp = minLat;
    minLat = maxLat;
    maxLat = tmp;
  }

  return { minLon, minLat, maxLon, maxLat };
}

/**
 * Execute spatial bounding box query against USGS Gazetteer
 */
export function queryFeaturesByBbox({
  bbox,
  type = null,
  tier = null,
  limit = 200,
  offset = 0
}) {
  const db = getDatabase();
  const { minLon, minLat, maxLon, maxLat } = parseBbox(bbox);

  const parsedLimit = Math.max(1, Math.min(1000, parseInt(limit, 10) || 200));
  const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

  // Check if query crosses antimeridian (minLon > maxLon)
  const isAntiMeridianCross = minLon > maxLon;

  // Fallback to in-memory GeoJSON if SQLite is unavailable (e.g., Vercel Lambda)
  if (!db) {
    const all = getMemoryDataset();
    const filtered = all.filter((f) => {
      const [lon, lat] = f.geometry.coordinates;
      const inBbox = isAntiMeridianCross
        ? (lon >= minLon || lon <= maxLon) && lat >= minLat && lat <= maxLat
        : lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
      if (!inBbox) return false;
      if (type && f.properties.type !== type && f.properties.category !== type) return false;
      if (tier !== null && tier !== undefined && f.properties.tier > parseInt(tier, 10)) return false;
      return true;
    });

    const paginated = filtered.slice(parsedOffset, parsedOffset + parsedLimit);
    return {
      type: 'FeatureCollection',
      bbox: [minLon, minLat, maxLon, maxLat],
      total: filtered.length,
      offset: parsedOffset,
      limit: parsedLimit,
      features: paginated
    };
  }

  const buildSubQuery = (boxMinX, boxMaxX, boxMinY, boxMaxY) => {
    let sql = `
      SELECT f.*
      FROM features_rtree r
      JOIN features f ON f.id = r.id
      WHERE r.maxLon >= ? AND r.minLon <= ?
        AND r.maxLat >= ? AND r.minLat <= ?
    `;
    const params = [boxMinX, boxMaxX, boxMinY, boxMaxY];

    if (type) {
      sql += ` AND f.type LIKE ?`;
      params.push(`%${type}%`);
    }

    if (tier !== null && tier !== undefined) {
      sql += ` AND f.tier <= ?`;
      params.push(parseInt(tier, 10));
    }

    return { sql, params };
  };

  let rows = [];

  if (!isAntiMeridianCross) {
    const q = buildSubQuery(minLon, maxLon, minLat, maxLat);
    const finalSql = `${q.sql} ORDER BY f.tier ASC, f.diameter DESC LIMIT ? OFFSET ?`;
    rows = db.prepare(finalSql).all(...q.params, parsedLimit, parsedOffset);
  } else {
    // Crosses -180/180 meridian: query [minLon, 180] UNION [-180, maxLon]
    const q1 = buildSubQuery(minLon, 180, minLat, maxLat);
    const q2 = buildSubQuery(-180, maxLon, minLat, maxLat);
    const finalSql = `
      SELECT * FROM (
        ${q1.sql}
        UNION
        ${q2.sql}
      ) AS combined
      ORDER BY tier ASC, diameter DESC
      LIMIT ? OFFSET ?
    `;
    rows = db.prepare(finalSql).all(...q1.params, ...q2.params, parsedLimit, parsedOffset);
  }

  const features = rows.map(rowToGeoJsonFeature);

  return {
    type: 'FeatureCollection',
    bbox: [minLon, minLat, maxLon, maxLat],
    total: features.length,
    offset: parsedOffset,
    limit: parsedLimit,
    features
  };
}

/**
 * Text search by feature name or category
 */
export function searchFeatures({ query, type = null, limit = 30 }) {
  const db = getDatabase();
  if (!query || typeof query !== 'string') {
    return { type: 'FeatureCollection', features: [] };
  }

  const cleanQ = query.trim().toLowerCase();
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));

  if (!db) {
    const all = getMemoryDataset();
    const filtered = all.filter((f) => {
      const p = f.properties;
      const name = (p.name || '').toLowerCase();
      const cleanName = (p.clean_name || '').toLowerCase();
      const quad = (p.quad_name || '').toLowerCase();
      const matchesText = name.includes(cleanQ) || cleanName.includes(cleanQ) || quad.includes(cleanQ);
      if (!matchesText) return false;
      if (type && p.type !== type && p.category !== type) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (a.properties.tier !== b.properties.tier) return a.properties.tier - b.properties.tier;
      return (b.properties.diameter_km || 0) - (a.properties.diameter_km || 0);
    });

    const sliced = filtered.slice(0, parsedLimit);
    return {
      type: 'FeatureCollection',
      query: cleanQ,
      total: filtered.length,
      features: sliced
    };
  }

  let sql = `
    SELECT * FROM features
    WHERE (name LIKE ? OR clean_name LIKE ? OR quad_name LIKE ?)
  `;
  const params = [`%${cleanQ}%`, `%${cleanQ}%`, `%${cleanQ}%`];

  if (type) {
    sql += ` AND type LIKE ?`;
    params.push(`%${type}%`);
  }

  sql += ` ORDER BY tier ASC, diameter DESC LIMIT ?`;
  params.push(parsedLimit);

  const rows = db.prepare(sql).all(...params);
  return {
    type: 'FeatureCollection',
    query: cleanQ,
    total: rows.length,
    features: rows.map(rowToGeoJsonFeature)
  };
}

/**
 * Get distinct feature types and counts
 */
export function getFeatureTypes() {
  const db = getDatabase();

  if (!db) {
    const all = getMemoryDataset();
    const counts = new Map();
    all.forEach((f) => {
      const t = f.properties.type;
      const existing = counts.get(t) || { type: t, count: 0, min_tier: f.properties.tier };
      existing.count++;
      existing.min_tier = Math.min(existing.min_tier, f.properties.tier);
      counts.set(t, existing);
    });
    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }

  const rows = db.prepare(`
    SELECT type, COUNT(*) as count, MIN(tier) as min_tier
    FROM features
    GROUP BY type
    ORDER BY count DESC
  `).all();

  return rows;
}

/**
 * Get single feature by ID
 */
export function getFeatureById(id) {
  const db = getDatabase();

  if (!db) {
    const all = getMemoryDataset();
    const found = all.find((f) => f.id === id || f.id === parseInt(id, 10) || f.properties.usgs_id === id);
    return found || null;
  }

  const row = db.prepare(`SELECT * FROM features WHERE id = ? OR usgs_id = ?`).get(id, id);
  if (!row) return null;
  return rowToGeoJsonFeature(row);
}

/**
 * Get total feature count
 */
export function countFeatures() {
  const db = getDatabase();
  if (!db) {
    return getMemoryDataset().length;
  }
  const row = db.prepare(`SELECT COUNT(*) as total FROM features`).get();
  return row ? row.total : 0;
}
