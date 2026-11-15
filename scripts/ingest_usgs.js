/**
 * USGS Planetary Nomenclature Ingestion Script
 * Authoritative Dataset: USGS Gazetteer of Planetary Nomenclature
 * Source: https://planetarynames.wr.usgs.gov/GIS_Downloads
 * S3 Source: https://asc-planetarynames-data.s3.us-west-2.amazonaws.com/MARS_nomenclature_center_pts.kmz
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'server', 'data');
const DB_PATH = path.join(DATA_DIR, 'usgs_mars_nomenclature.db');
const SQL_PATH = path.join(DATA_DIR, 'usgs_mars_nomenclature.sql');
const USGS_LOCAL_DIR = path.join(ROOT_DIR, 'usgs_data');
const KML_PATH = path.join(USGS_LOCAL_DIR, 'extracted', 'MARS_nomenclature_center_pts.kml');
const KMZ_URL = 'https://asc-planetarynames-data.s3.us-west-2.amazonaws.com/MARS_nomenclature_center_pts.kmz';

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed with status code ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

export async function runIngestion() {
  console.log('🚀 Starting USGS Mars Gazetteer ingestion...');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(KML_PATH)) {
    console.log(`KML not found at ${KML_PATH}. Downloading from USGS S3 repository...`);
    if (!fs.existsSync(USGS_LOCAL_DIR)) {
      fs.mkdirSync(USGS_LOCAL_DIR, { recursive: true });
    }
    const tempKmz = path.join(USGS_LOCAL_DIR, 'MARS_nomenclature_center_pts.kmz');
    await downloadFile(KMZ_URL, tempKmz);
    console.log('Downloaded KMZ archive. Extracting...');
    // Use unzip
    const { execSync } = await import('child_process');
    execSync(`unzip -o "${tempKmz}" -d "${path.join(USGS_LOCAL_DIR, 'extracted')}"`);
  }

  console.log(`Reading USGS KML: ${KML_PATH}`);
  const kml = fs.readFileSync(KML_PATH, 'utf8');

  // Remove existing DB to ensure clean ingestion
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const db = new DatabaseSync(DB_PATH);

  // Initialize SQLite schema with R-Tree spatial index
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usgs_id TEXT UNIQUE,
      name TEXT NOT NULL,
      clean_name TEXT,
      approval_date TEXT,
      origin TEXT,
      diameter REAL,
      center_lon REAL,
      center_lat REAL,
      lon REAL NOT NULL,
      lat REAL NOT NULL,
      type TEXT NOT NULL,
      code TEXT,
      approval TEXT,
      min_lon REAL,
      max_lon REAL,
      min_lat REAL,
      max_lat REAL,
      ethnicity TEXT,
      continent TEXT,
      quad_name TEXT,
      quad_code TEXT,
      link TEXT,
      tier INTEGER DEFAULT 3
    );

    CREATE VIRTUAL TABLE features_rtree USING rtree(
      id,
      minLon, maxLon,
      minLat, maxLat
    );

    CREATE INDEX idx_features_type ON features(type);
    CREATE INDEX idx_features_tier ON features(tier);
    CREATE INDEX idx_features_name ON features(name COLLATE NOCASE);
  `);

  const insertFeatureStmt = db.prepare(`
    INSERT INTO features (
      usgs_id, name, clean_name, approval_date, origin, diameter,
      center_lon, center_lat, lon, lat, type, code, approval,
      min_lon, max_lon, min_lat, max_lat, ethnicity, continent,
      quad_name, quad_code, link, tier
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRTreeStmt = db.prepare(`
    INSERT INTO features_rtree (id, minLon, maxLon, minLat, maxLat)
    VALUES (?, ?, ?, ?, ?)
  `);

  const placemarkRegex = /<Placemark id="([^"]+)">([\s\S]*?)<\/Placemark>/g;
  let m;
  let count = 0;
  const typeCounts = {};

  // Also prepare PostGIS SQL dump
  const postgisSqlLines = [
    '-- USGS Planetary Nomenclature Mars Dataset (PostGIS Ingestion)',
    '-- Source: https://planetarynames.wr.usgs.gov/GIS_Downloads',
    'CREATE EXTENSION IF NOT EXISTS postgis;',
    '',
    'CREATE TABLE IF NOT EXISTS gazetteer_features (',
    '  id SERIAL PRIMARY KEY,',
    '  usgs_id VARCHAR(64) UNIQUE,',
    '  name VARCHAR(255) NOT NULL,',
    '  clean_name VARCHAR(255),',
    '  approval_date VARCHAR(64),',
    '  origin TEXT,',
    '  diameter DOUBLE PRECISION,',
    '  center_lon DOUBLE PRECISION,',
    '  center_lat DOUBLE PRECISION,',
    '  lon DOUBLE PRECISION NOT NULL,',
    '  lat DOUBLE PRECISION NOT NULL,',
    '  type VARCHAR(128) NOT NULL,',
    '  code VARCHAR(32),',
    '  approval VARCHAR(128),',
    '  min_lon DOUBLE PRECISION,',
    '  max_lon DOUBLE PRECISION,',
    '  min_lat DOUBLE PRECISION,',
    '  max_lat DOUBLE PRECISION,',
    '  ethnicity VARCHAR(128),',
    '  continent VARCHAR(128),',
    '  quad_name VARCHAR(128),',
    '  quad_code VARCHAR(32),',
    '  link TEXT,',
    '  tier INTEGER DEFAULT 3,',
    '  geom GEOMETRY(Point, 4326)',
    ');',
    '',
    'CREATE INDEX IF NOT EXISTS idx_gazetteer_geom ON gazetteer_features USING GIST (geom);',
    'CREATE INDEX IF NOT EXISTS idx_gazetteer_type ON gazetteer_features (type);',
    'CREATE INDEX IF NOT EXISTS idx_gazetteer_tier ON gazetteer_features (tier);',
    '',
    'BEGIN;'
  ];

  db.exec('BEGIN TRANSACTION');

  const escapeSql = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
  };

  while ((m = placemarkRegex.exec(kml)) !== null) {
    const pId = m[1];
    const block = m[2];

    const map = {};
    const dataRegex = /<SimpleData name="([^"]+)">([\s\S]*?)<\/SimpleData>/g;
    let dm;
    while ((dm = dataRegex.exec(block)) !== null) {
      map[dm[1]] = dm[2].trim();
    }

    const nameMatch = block.match(/<name>([^<]+)<\/name>/);
    const name = nameMatch ? nameMatch[1].trim() : (map.clean_name || 'Unnamed');
    const clean_name = map.clean_name || name;
    const approval_date = map.approvaldt || null;
    const origin = map.origin || null;
    const diameter = parseFloat(map.diameter) || 0;
    const center_lon = parseFloat(map.center_lon) || 0;
    const center_lat = parseFloat(map.center_lat) || 0;
    const type = map.type || 'Feature';
    const code = map.code || null;
    const approval = map.approval || null;
    const min_lon = parseFloat(map.min_lon) || center_lon;
    const max_lon = parseFloat(map.max_lon) || center_lon;
    const min_lat = parseFloat(map.min_lat) || center_lat;
    const max_lat = parseFloat(map.max_lat) || center_lat;
    const ethnicity = map.ethnicity || null;
    const continent = map.continent || null;
    const quad_name = map.quad_name || null;
    const quad_code = map.quad_code || null;
    const link = map.link || null;

    const coordMatch = block.match(/<Point><coordinates>([^<]+)<\/coordinates><\/Point>/);
    let lon = center_lon > 180 ? center_lon - 360 : center_lon;
    let lat = center_lat;
    if (coordMatch) {
      const parts = coordMatch[1].split(',').map(Number);
      lon = parts[0];
      lat = parts[1];
    }

    // Determine visual tier based on planetary feature scale
    let tier = 3;
    const tLower = type.toLowerCase();
    if (tLower.includes('mons') || tLower.includes('chasma') || tLower.includes('planum') || tLower.includes('vastitas') || tLower.includes('terra')) {
      tier = 1;
    } else if (diameter >= 100) {
      tier = 1;
    } else if (diameter >= 30) {
      tier = 2;
    }

    const res = insertFeatureStmt.run(
      pId, name, clean_name, approval_date, origin, diameter,
      center_lon, center_lat, lon, lat, type, code, approval,
      min_lon, max_lon, min_lat, max_lat, ethnicity, continent,
      quad_name, quad_code, link, tier
    );

    const rowId = Number(res.lastInsertRowid);
    insertRTreeStmt.run(rowId, lon - 0.0001, lon + 0.0001, lat - 0.0001, lat + 0.0001);

    postgisSqlLines.push(
      `INSERT INTO gazetteer_features (usgs_id, name, clean_name, approval_date, origin, diameter, center_lon, center_lat, lon, lat, type, code, approval, min_lon, max_lon, min_lat, max_lat, ethnicity, continent, quad_name, quad_code, link, tier, geom) VALUES (${escapeSql(pId)}, ${escapeSql(name)}, ${escapeSql(clean_name)}, ${escapeSql(approval_date)}, ${escapeSql(origin)}, ${diameter}, ${center_lon}, ${center_lat}, ${lon}, ${lat}, ${escapeSql(type)}, ${escapeSql(code)}, ${escapeSql(approval)}, ${min_lon}, ${max_lon}, ${min_lat}, ${max_lat}, ${escapeSql(ethnicity)}, ${escapeSql(continent)}, ${escapeSql(quad_name)}, ${escapeSql(quad_code)}, ${escapeSql(link)}, ${tier}, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326));`
    );

    typeCounts[type] = (typeCounts[type] || 0) + 1;
    count++;
  }

  db.exec('COMMIT');
  postgisSqlLines.push('COMMIT;');

  fs.writeFileSync(SQL_PATH, postgisSqlLines.join('\n'), 'utf8');

  console.log(`✅ Ingestion complete!`);
  console.log(`   Total records inserted: ${count}`);
  console.log(`   SQLite database created: ${DB_PATH}`);
  console.log(`   PostGIS SQL dump created: ${SQL_PATH}`);
  console.log(`   Feature categories: ${Object.keys(typeCounts).length}`);

  return { count, typeCounts, dbPath: DB_PATH, sqlPath: SQL_PATH };
}

// Direct execution support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runIngestion()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Ingestion failed:', err);
      process.exit(1);
    });
}

