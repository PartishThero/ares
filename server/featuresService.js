/**
 * USGS Planetary Nomenclature Geospatial Query Service
 * Queries local geospatial SQLite database with R-Tree spatial indexing.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'usgs_mars_nomenclature.db');

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) return dbInstance;
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`USGS Gazetteer database not found at ${DB_PATH}. Run "node scripts/ingest_usgs.js" first.`);
  }
  dbInstance = new DatabaseSync(DB_PATH, { readOnly: true });
  return dbInstance;
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
  const row = db.prepare(`SELECT * FROM features WHERE id = ? OR usgs_id = ?`).get(id, id);
  if (!row) return null;
  return rowToGeoJsonFeature(row);
}

/**
 * Get total feature count
 */
export function countFeatures() {
  const db = getDatabase();
  const row = db.prepare(`SELECT COUNT(*) as total FROM features`).get();
  return row ? row.total : 0;
}
