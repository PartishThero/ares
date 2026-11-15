import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  queryFeaturesByBbox,
  searchFeatures,
  getFeatureTypes,
  getFeatureById,
  countFeatures
} from '../server/featuresService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('   USGS GAZETTEER & SPATIAL API VALIDATION SUITE    ');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 0;

function test(title, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ PASS: ${title}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${title}`);
    console.error(`    ${err.message}`);
  }
}

async function testAsync(title, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${title}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${title}`);
    console.error(`    ${err.message}`);
  }
}

async function runValidation() {
  console.log('[1] Official USGS Source & Ingestion Verification:');
  
  test('SQLite database exists and has non-zero size', () => {
    const dbPath = path.join(rootDir, 'server', 'data', 'usgs_mars_nomenclature.db');
    assert(fs.existsSync(dbPath), 'usgs_mars_nomenclature.db must exist');
    const stats = fs.statSync(dbPath);
    assert(stats.size > 500 * 1024, `DB size should be > 500KB (actual: ${(stats.size / 1024).toFixed(1)} KB)`);
  });

  test('PostGIS migration SQL file exists', () => {
    const sqlPath = path.join(rootDir, 'server', 'data', 'usgs_mars_nomenclature.sql');
    assert(fs.existsSync(sqlPath), 'usgs_mars_nomenclature.sql must exist');
    const stats = fs.statSync(sqlPath);
    assert(stats.size > 1024 * 1024, `SQL file should be > 1MB (actual: ${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  });

  test('Database contains exact 2,055 official USGS nomenclature records', () => {
    const total = countFeatures();
    assert.equal(total, 2055, `Expected 2055 records from USGS official source, got ${total}`);
  });

  console.log('\n[2] Feature Coordinates & Planetary Projection Verification:');

  test('EPSG:4326 planetocentric coordinates within valid spherical ranges', () => {
    const featureTypes = getFeatureTypes();
    assert(featureTypes.length > 20, `Expected >20 feature types, got ${featureTypes.length}`);
    
    // Check Gale Crater
    const gale = getFeatureById(690);
    assert(gale, 'Gale Crater (ID 690) must exist in Gazetteer');
    assert.equal(gale.properties.name, 'Gale');
    assert.equal(gale.properties.type, 'Crater, craters');
    assert(Math.abs(gale.geometry.coordinates[0] - 137.811) < 0.001, 'Gale lon should be 137.811° E');
    assert(Math.abs(gale.geometry.coordinates[1] - (-5.3672)) < 0.001, 'Gale lat should be -5.3672° S');
    assert(gale.properties.diameter_km > 150, 'Gale diameter should be >150 km');

    // Check Olympus Mons
    const olympus = getFeatureById(990);
    assert(olympus, 'Olympus Mons (ID 990) must exist in Gazetteer');
    assert.equal(olympus.properties.name, 'Olympus Mons');
    assert(Math.abs(olympus.geometry.coordinates[0] - (-133.8025)) < 0.001, 'Olympus lon should be -133.8025° E');
    assert(Math.abs(olympus.geometry.coordinates[1] - 18.6528) < 0.001, 'Olympus lat should be 18.6528° N');
    assert(Math.abs(olympus.properties.center_lon_deg - 226.1975) < 0.001, 'Olympus positive east lon should be 226.1975°');
  });

  console.log('\n[3] Bounding-Box Spatial Queries (R-Tree Indexing):');

  test('Standard Bounding-Box around Gale Crater (130 to 145 Lon, -10 to 5 Lat)', () => {
    const t0 = performance.now();
    const result = queryFeaturesByBbox({
      bbox: '130,-10,145,5',
      limit: 100
    });
    const duration = performance.now() - t0;
    assert.equal(result.type, 'FeatureCollection');
    assert(result.total >= 19, `Expected >= 19 features in Gale quad, got ${result.total}`);
    assert(duration < 15, `Spatial R-Tree query should execute in < 15ms (actual: ${duration.toFixed(2)}ms)`);
    
    // Verify all returned features are inside bbox
    result.features.forEach((f) => {
      const [lon, lat] = f.geometry.coordinates;
      assert(lon >= 130 - 0.001 && lon <= 145 + 0.001, `Lon ${lon} outside bbox`);
      assert(lat >= -10 - 0.001 && lat <= 5 + 0.001, `Lat ${lat} outside bbox`);
    });
  });

  test('Antimeridian Crossing Bounding-Box (170 to -170 Lon)', () => {
    const result = queryFeaturesByBbox({
      bbox: '170,-30,-170,30',
      limit: 100
    });
    assert.equal(result.type, 'FeatureCollection');
    assert(Array.isArray(result.features), 'Result features must be an array');
    result.features.forEach((f) => {
      const [lon, lat] = f.geometry.coordinates;
      assert(lon >= 170 || lon <= -170, `Lon ${lon} should cross antimeridian`);
      assert(lat >= -30 && lat <= 30, `Lat ${lat} out of bounds`);
    });
  });

  test('Empty Region Returns Valid Empty FeatureCollection', () => {
    const result = queryFeaturesByBbox({
      bbox: '0.1,89.9,0.2,89.95',
      limit: 50
    });
    assert.equal(result.type, 'FeatureCollection');
    assert.equal(result.total, 0);
    assert.equal(result.features.length, 0);
  });

  console.log('\n[4] Feature-Type & Tier Filtering:');

  test('Filter by Feature Type ("Mons, montes")', () => {
    const result = queryFeaturesByBbox({
      bbox: '-180,-90,180,90',
      type: 'Mons, montes',
      limit: 100
    });
    assert(result.total > 0, 'Expected Montes features');
    result.features.forEach((f) => {
      assert.equal(f.properties.type, 'Mons, montes');
    });
  });

  test('Filter by Semantic Tier (Tier 1 major planetary landmarks)', () => {
    const result = queryFeaturesByBbox({
      bbox: '-180,-90,180,90',
      tier: 1,
      limit: 500
    });
    assert(result.total > 0, 'Expected Tier 1 features');
    result.features.forEach((f) => {
      assert(f.properties.tier <= 1, `Expected tier <= 1, got ${f.properties.tier}`);
    });
  });

  console.log('\n[5] Dynamic Text Search (Autocomplete):');

  test('Search "Olympus" returns Olympus Mons and associated features', () => {
    const result = searchFeatures({ query: 'Olympus', limit: 10 });
    assert(result.total >= 4, `Expected >= 4 features for Olympus, got ${result.total}`);
    const names = result.features.map((f) => f.properties.name);
    assert(names.includes('Olympus Mons'), 'Must include Olympus Mons');
    assert(names.includes('Olympus Rupes'), 'Must include Olympus Rupes');
  });

  test('Search "Gale" returns Gale crater', () => {
    const result = searchFeatures({ query: 'Gale', limit: 10 });
    assert(result.total >= 1, 'Expected at least 1 result for Gale');
    assert.equal(result.features[0].properties.name, 'Gale');
  });

  console.log('\n[6] Frontend Decoupling & Bundle Verification:');

  test('Frontend src/ contains ZERO imports or usages of nasaMarsTrek2000.js / .json', () => {
    const srcDir = path.join(rootDir, 'src');
    function checkDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          checkDir(full);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
          const content = fs.readFileSync(full, 'utf-8');
          assert(!content.includes('nasaMarsTrek2000'), `File ${full} still imports/references nasaMarsTrek2000!`);
        }
      }
    }
    checkDir(srcDir);
  });

  test('Production dist/ bundle does NOT contain embedded legacy POI array', () => {
    const distAssetsDir = path.join(rootDir, 'dist', 'assets');
    assert(fs.existsSync(distAssetsDir), 'dist/assets must exist (run npm run build first)');
    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    for (const file of jsFiles) {
      const full = path.join(distAssetsDir, file);
      const content = fs.readFileSync(full, 'utf-8');
      assert(!content.includes('MARS_POI_DATA_FULL'), `dist file ${file} contains MARS_POI_DATA_FULL!`);
    }
  });

  console.log('\n[7] Live HTTP Server & Middleware Verification:');

  await testAsync('GET /api/features?bbox=130,-10,145,5 returns 200 GeoJSON via Vite', async () => {
    const res = await fetch('http://localhost:5173/api/features?bbox=130,-10,145,5');
    assert.equal(res.status, 200);
    assert(res.headers.get('content-type')?.includes('application/json'));
    const data = await res.json();
    assert.equal(data.type, 'FeatureCollection');
    assert(data.features.length > 0);
  });

  await testAsync('GET /api/features/search?q=Valles returns matching canyon systems', async () => {
    const res = await fetch('http://localhost:5173/api/features/search?q=Valles&limit=5');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.type, 'FeatureCollection');
    assert(data.features.length > 0);
    assert(data.features[0].properties.name.toLowerCase().includes('valles'));
  });

  await testAsync('GET /api/features/types returns feature type counts', async () => {
    const res = await fetch('http://localhost:5173/api/features/types');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.types));
    assert(data.totalFeatures === 2055);
  });

  await testAsync('GET /api/features/690 returns Gale Crater detail', async () => {
    const res = await fetch('http://localhost:5173/api/features/690');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.properties.name, 'Gale');
    assert.equal(data.geometry.type, 'Point');
  });

  await testAsync('GET /api/features with invalid bbox returns HTTP 400 with descriptive error', async () => {
    const res = await fetch('http://localhost:5173/api/features?bbox=not,valid,coords,here');
    assert.equal(res.status, 400);
    const data = await res.json();
    assert(data.error);
  });

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passCount} / ${totalCount} PASSED`);
  if (passCount === totalCount) {
    console.log('ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
  } else {
    console.error(`${totalCount - passCount} TESTS FAILED.`);
    process.exit(1);
  }
  console.log('====================================================\n');
}

runValidation().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
