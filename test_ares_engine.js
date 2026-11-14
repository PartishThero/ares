/**
 * Comprehensive Validation Test Suite for ARES Engine
 */

import { calculateMarsDistanceKm, formatMarsCoords, getMarsSolTime } from './src/utils/coordinates.js';
import { calculateSlopeDeg, calculateSpeedKmH, calculateMetabolicRateKcal, estimateGaleElevation } from './src/utils/calculations.js';
import { planAresRoute, coordToGrid, gridToCoord, GALE_BOUNDS } from './src/algorithms/astar.js';
import { ROUTE_PROFILES } from './src/algorithms/terrainCost.js';
import { scoreRoute } from './src/algorithms/routeScoring.js';
import { inspectMarsLocation } from './src/services/marsData.js';
import { calculateEvaRadiationDose } from './src/data/radiationData.js';
import { SCIENTIFIC_TARGETS } from './src/data/scientificTargets.js';
import { HAZARD_ZONES } from './src/data/hazardData.js';
import { PRESET_MISSIONS } from './src/data/missionData.js';

console.log('====================================================');
console.log('   ARES ENGINE VERIFICATION TEST SUITE (NASA 2026)  ');
console.log('====================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Coordinates & Geometry
console.log('\n[1] Testing Coordinate Math & Mars Spherical Geometry:');
const bradbury = [137.4417, -4.5895];
const boxwork = [137.4025, -4.9450];
const dist = calculateMarsDistanceKm(bradbury, boxwork);
assert(dist > 20 && dist < 25, `Bradbury to Boxwork distance should be ~21.2 km (got: ${dist.toFixed(2)} km)`);

const formatted = formatMarsCoords(137.4025, -4.945);
assert(formatted.includes('4° 56\'') && formatted.includes('S') && formatted.includes('E'), `Format Mars coords correct (got: ${formatted})`);

const marsSol = getMarsSolTime();
assert(marsSol.sol > 4000 && marsSol.ltst.includes('LTST'), `Mars Sol and LTST time generated (Sol ${marsSol.sol}, ${marsSol.ltst})`);

// 2. Terrain & Topography Calculations
console.log('\n[2] Testing Terrain & Bioenergetics:');
const elevFloor = estimateGaleElevation(137.44, -4.59);
const elevSlope = estimateGaleElevation(137.40, -4.95);
assert(elevFloor < -4400, `Crater floor elevation should be ~ -4500m (got: ${elevFloor}m)`);
assert(elevSlope > -3600, `Mount Sharp flank elevation should be higher (got: ${elevSlope}m)`);

const slope = calculateSlopeDeg(-4500, -4400, 1000);
assert(slope > 5 && slope < 6, `Slope for 100m rise over 1000m should be ~5.7° (got: ${slope.toFixed(2)}°)`);

const speedFlat = calculateSpeedKmH(2);
const speedSteep = calculateSpeedKmH(18);
assert(speedFlat > speedSteep && speedFlat === 1.25, `Flat speed (1.25 km/h) faster than steep (${speedSteep} km/h)`);

const cal = calculateMetabolicRateKcal(10, 4);
assert(cal > 1000 && cal < 2500, `EVA 4-hour caloric expenditure reasonable (got: ${cal} kcal)`);

// 3. Grid & A* Pathfinding Engine
console.log('\n[3] Testing A* Pathfinding Engine:');
const start = [137.3880, -4.7310]; // Glen Torridon
const dest = [137.4025, -4.9450];  // Boxwork Alpha

const gridStart = coordToGrid(start[0], start[1]);
assert(gridStart.col >= 0 && gridStart.col < GALE_BOUNDS.cols, 'Start grid col within bounds');
assert(gridStart.row >= 0 && gridStart.row < GALE_BOUNDS.rows, 'Start grid row within bounds');

console.log('  Running A* for SAFEST route profile...');
const safestPlan = planAresRoute(start, dest, [], ROUTE_PROFILES.SAFEST);
assert(safestPlan.coordinates.length > 5, `Safest route generated with ${safestPlan.coordinates.length} waypoints`);
assert(safestPlan.metrics.totalDistanceKm > 10 && safestPlan.metrics.totalDistanceKm < 20, `Safest route distance reasonable (${safestPlan.metrics.totalDistanceKm} km)`);
assert(safestPlan.elevationProfile.length === safestPlan.coordinates.length, 'Elevation profile samples match coordinates count');

console.log('  Running A* for SHORTEST route profile...');
const shortestPlan = planAresRoute(start, dest, [], ROUTE_PROFILES.SHORTEST);
assert(shortestPlan.metrics.totalDistanceKm <= safestPlan.metrics.totalDistanceKm, `Shortest route (${shortestPlan.metrics.totalDistanceKm} km) <= Safest (${safestPlan.metrics.totalDistanceKm} km)`);

// 4. Route Scoring Formula
console.log('\n[4] Testing Blueprint Route Scoring:');
const scoreSafest = scoreRoute(safestPlan.metrics, 85);
assert(scoreSafest.score >= 10 && scoreSafest.score <= 100, `Score within 10-100 range (got: ${scoreSafest.score})`);
assert(scoreSafest.formulaText.includes('Score = 100 -'), 'Formula explanation string generated transparently');

// 5. Scientific Datasets & Multi-layer Inspection
console.log('\n[5] Testing Scientific Target & Location Inspector:');
assert(SCIENTIFIC_TARGETS.length >= 8, `At least 8 scientific targets registered (got: ${SCIENTIFIC_TARGETS.length})`);
assert(HAZARD_ZONES.length >= 5, `At least 5 hazard zones registered (got: ${HAZARD_ZONES.length})`);
assert(PRESET_MISSIONS.length >= 3, `At least 3 preset missions registered (got: ${PRESET_MISSIONS.length})`);

const inspection = inspectMarsLocation(137.4025, -4.9450);
assert(inspection.geology.unit.includes('Boxwork') || inspection.geology.unit.includes('Sulfate'), `Geological unit correctly identified (${inspection.geology.unit})`);
assert(inspection.thermal.daytimeTempC && inspection.thermal.nighttimeTempC, 'Thermal estimates generated');
assert(inspection.historicalRadiation.doseEquivalentUsvDay > 0, 'Historical RAD measurement linked');

// 6. Radiation Dosimetry Calculator
console.log('\n[6] Testing MSL RAD Radiation Dosimetry:');
const radDose = calculateEvaRadiationDose(4.5, false);
assert(radDose.totalDoseUsv > 100 && radDose.totalDoseUsv < 150, `4.5h nominal dose should be ~122 μSv (got: ${radDose.totalDoseUsv} μSv)`);
const radDoseSpe = calculateEvaRadiationDose(4.5, true);
assert(radDoseSpe.totalDoseUsv > radDose.totalDoseUsv * 2, 'SPE solar flare increases dose substantially');

console.log('====================================================');
console.log(`   TEST RESULTS: ${passedTests} / ${totalTests} PASSED   `);
console.log('====================================================');

