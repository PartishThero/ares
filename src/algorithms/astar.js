import { calculateMarsDistanceKm } from '../utils/coordinates.js';
import { estimateGaleElevation, calculateSlopeDeg, calculateSpeedKmH, calculateMetabolicRateKcal } from '../utils/calculations.js';
import { getCoordinateHazardFactor } from '../data/hazardData.js';
import { calculateEdgeCost, ROUTE_PROFILES } from './terrainCost.js';

export const GALE_BOUNDS = {
  minLon: 137.31,
  maxLon: 137.47,
  minLat: -5.02,
  maxLat: -4.56,
  cols: 56,
  rows: 72
};

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._sinkDown(0);
    }
    return top;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(idx) {
    const element = this.heap[idx];
    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1;
      const parent = this.heap[parentIdx];
      if (element.f >= parent.f) break;
      this.heap[idx] = parent;
      idx = parentIdx;
    }
    this.heap[idx] = element;
  }

  _sinkDown(idx) {
    const length = this.heap.length;
    const element = this.heap[idx];
    while (true) {
      let leftIdx = (idx << 1) + 1;
      let rightIdx = leftIdx + 1;
      let swapIdx = null;

      if (leftIdx < length) {
        if (this.heap[leftIdx].f < element.f) {
          swapIdx = leftIdx;
        }
      }
      if (rightIdx < length) {
        if (
          (swapIdx === null && this.heap[rightIdx].f < element.f) ||
          (swapIdx !== null && this.heap[rightIdx].f < this.heap[leftIdx].f)
        ) {
          swapIdx = rightIdx;
        }
      }
      if (swapIdx === null) break;
      this.heap[idx] = this.heap[swapIdx];
      idx = swapIdx;
    }
    this.heap[idx] = element;
  }
}

export function coordToGrid(lon, lat) {
  const { minLon, maxLon, minLat, maxLat, cols, rows } = GALE_BOUNDS;
  const col = Math.round(((lon - minLon) / (maxLon - minLon)) * (cols - 1));
  const row = Math.round(((lat - minLat) / (maxLat - minLat)) * (rows - 1));
  return {
    col: Math.max(0, Math.min(cols - 1, col)),
    row: Math.max(0, Math.min(rows - 1, row))
  };
}

export function gridToCoord(col, row) {
  const { minLon, maxLon, minLat, maxLat, cols, rows } = GALE_BOUNDS;
  const lon = minLon + (col / (cols - 1)) * (maxLon - minLon);
  const lat = minLat + (row / (rows - 1)) * (maxLat - minLat);
  return [lon, lat];
}

function aStarSegment(startCoord, destCoord, profile = ROUTE_PROFILES.SAFEST) {
  const directDist = calculateMarsDistanceKm(startCoord, destCoord);
  if (directDist < 0.005) {
    const elev = estimateGaleElevation(startCoord[0], startCoord[1]);
    const hazard = getCoordinateHazardFactor(startCoord[0], startCoord[1]);
    return [{ col: 0, row: 0, lon: startCoord[0], lat: startCoord[1], elevation: elev, hazard }];
  }

  // Adaptive dynamic bounding box enclosing both points with obstacle clearance buffer
  const minLon = Math.min(startCoord[0], destCoord[0]);
  const maxLon = Math.max(startCoord[0], destCoord[0]);
  const minLat = Math.min(startCoord[1], destCoord[1]);
  const maxLat = Math.max(startCoord[1], destCoord[1]);

  const spanLon = maxLon - minLon;
  const spanLat = maxLat - minLat;
  const maxSpan = Math.max(spanLon, spanLat, 0.08);

  // Dynamic padding scaled to traversal corridor ensures clearance around massive crater rims
  const padLon = Math.max(spanLon * 0.35, maxSpan * 0.30, 0.22);
  const padLat = Math.max(spanLat * 0.35, maxSpan * 0.30, 0.22);

  const bMinLon = Math.max(-180, minLon - padLon);
  const bMaxLon = Math.min(180, maxLon + padLon);
  const bMinLat = Math.max(-89.5, minLat - padLat);
  const bMaxLat = Math.min(89.5, maxLat + padLat);

  const COLS = 60;
  const ROWS = 60;

  const toCol = (lon) => Math.max(0, Math.min(COLS - 1, Math.round(((lon - bMinLon) / (bMaxLon - bMinLon)) * (COLS - 1))));
  const toRow = (lat) => Math.max(0, Math.min(ROWS - 1, Math.round(((lat - bMinLat) / (bMaxLat - bMinLat)) * (ROWS - 1))));
  const toLon = (c) => bMinLon + (c / (COLS - 1)) * (bMaxLon - bMinLon);
  const toLat = (r) => bMinLat + (r / (ROWS - 1)) * (bMaxLat - bMinLat);

  const startCol = toCol(startCoord[0]);
  const startRow = toRow(startCoord[1]);
  const destCol = toCol(destCoord[0]);
  const destRow = toRow(destCoord[1]);

  // If endpoints map to identical cell, construct a fine interpolated line
  if (startCol === destCol && startRow === destRow) {
    const sElev = estimateGaleElevation(startCoord[0], startCoord[1]);
    const dElev = estimateGaleElevation(destCoord[0], destCoord[1]);
    return [
      { col: startCol, row: startRow, lon: startCoord[0], lat: startCoord[1], elevation: sElev, hazard: getCoordinateHazardFactor(startCoord[0], startCoord[1]) },
      { col: destCol, row: destRow, lon: destCoord[0], lat: destCoord[1], elevation: dElev, hazard: getCoordinateHazardFactor(destCoord[0], destCoord[1]) }
    ];
  }

  // Construct dynamic terrain & hazard mesh
  const grid = new Array(ROWS);
  for (let r = 0; r < ROWS; r++) {
    grid[r] = new Array(COLS);
    for (let c = 0; c < COLS; c++) {
      const lon = toLon(c);
      const lat = toLat(r);
      grid[r][c] = {
        col: c,
        row: r,
        lon,
        lat,
        elevation: estimateGaleElevation(lon, lat),
        hazard: getCoordinateHazardFactor(lon, lat)
      };
    }
  }

  const openSet = new MinHeap();
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();

  const startKey = `${startCol},${startRow}`;
  const destKey = `${destCol},${destRow}`;
  gScore.set(startKey, 0);

  const initialH = calculateMarsDistanceKm(startCoord, destCoord) * profile.weights.distance;
  openSet.push({ col: startCol, row: startRow, f: initialH });

  const neighbors = [
    { dc: 0, dr: 1 },
    { dc: 0, dr: -1 },
    { dc: 1, dr: 0 },
    { dc: -1, dr: 0 },
    { dc: 1, dr: 1 },
    { dc: -1, dr: 1 },
    { dc: 1, dr: -1 },
    { dc: -1, dr: -1 }
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 8000;
  let reachedDest = false;

  while (!openSet.isEmpty() && iterations < MAX_ITERATIONS) {
    iterations++;
    const current = openSet.pop();
    const currentKey = `${current.col},${current.row}`;

    if (current.col === destCol && current.row === destRow) {
      reachedDest = true;
      const path = [];
      let currKey = currentKey;
      while (currKey) {
        const [c, r] = currKey.split(',').map(Number);
        path.unshift({ ...grid[r][c] });
        currKey = cameFrom.get(currKey);
      }
      // Guarantee exact endpoints match user clicks
      if (path.length > 0) {
        path[0].lon = startCoord[0];
        path[0].lat = startCoord[1];
        path[0].elevation = estimateGaleElevation(startCoord[0], startCoord[1]);
        path[0].hazard = getCoordinateHazardFactor(startCoord[0], startCoord[1]);

        path[path.length - 1].lon = destCoord[0];
        path[path.length - 1].lat = destCoord[1];
        path[path.length - 1].elevation = estimateGaleElevation(destCoord[0], destCoord[1]);
        path[path.length - 1].hazard = getCoordinateHazardFactor(destCoord[0], destCoord[1]);
      }
      return path;
    }

    closedSet.add(currentKey);
    const currentNode = grid[current.row][current.col];
    const currentG = gScore.get(currentKey) ?? Infinity;

    for (const nb of neighbors) {
      const nc = current.col + nb.dc;
      const nr = current.row + nb.dr;

      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;

      const neighborKey = `${nc},${nr}`;
      if (closedSet.has(neighborKey)) continue;

      const neighborNode = grid[nr][nc];
      const stepDistKm = calculateMarsDistanceKm(
        [currentNode.lon, currentNode.lat],
        [neighborNode.lon, neighborNode.lat]
      );

      const edgeCost = calculateEdgeCost(
        stepDistKm,
        currentNode.elevation,
        neighborNode.elevation,
        currentNode.hazard,
        neighborNode.hazard,
        profile
      );

      const tentativeG = currentG + edgeCost;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeG);

        const h = calculateMarsDistanceKm([neighborNode.lon, neighborNode.lat], destCoord) * profile.weights.distance;
        const totalF = tentativeG + h;

        openSet.push({ col: nc, row: nr, f: totalF });
      }
    }
  }

  // Fallback: geodesic direct connection with interpolated elevations and hazards
  const STEPS = 20;
  const fallbackPath = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const lon = startCoord[0] + (destCoord[0] - startCoord[0]) * t;
    const lat = startCoord[1] + (destCoord[1] - startCoord[1]) * t;
    fallbackPath.push({
      col: Math.round(startCol + (destCol - startCol) * t),
      row: Math.round(startRow + (destRow - startRow) * t),
      lon,
      lat,
      elevation: estimateGaleElevation(lon, lat),
      hazard: getCoordinateHazardFactor(lon, lat)
    });
  }
  return fallbackPath;
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const f0 = -0.5 * t3 + t2 - 0.5 * t;
  const f1 = 1.5 * t3 - 2.5 * t2 + 1.0;
  const f2 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
  const f3 = 0.5 * t3 - 0.5 * t2;
  return [
    p0[0] * f0 + p1[0] * f1 + p2[0] * f2 + p3[0] * f3,
    p0[1] * f0 + p1[1] * f1 + p2[1] * f2 + p3[1] * f3
  ];
}

function smoothTraverseCoordinates(rawNodes) {
  if (rawNodes.length <= 4) return rawNodes.map((n) => [n.lon, n.lat]);

  // Decimate collinear and minor zig-zag nodes while retaining key turns
  const keyNodes = [rawNodes[0]];
  const stride = Math.max(2, Math.floor(rawNodes.length / 16));
  for (let i = stride; i < rawNodes.length - stride; i += stride) {
    keyNodes.push(rawNodes[i]);
  }
  keyNodes.push(rawNodes[rawNodes.length - 1]);

  const pts = [
    [keyNodes[0].lon, keyNodes[0].lat],
    ...keyNodes.map((n) => [n.lon, n.lat]),
    [keyNodes[keyNodes.length - 1].lon, keyNodes[keyNodes.length - 1].lat]
  ];

  const smoothCoords = [];
  const samples = 4;
  for (let i = 0; i < keyNodes.length - 1; i++) {
    for (let s = 0; s < samples; s++) {
      const t = s / samples;
      smoothCoords.push(catmullRom(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], t));
    }
  }
  smoothCoords.push([rawNodes[rawNodes.length - 1].lon, rawNodes[rawNodes.length - 1].lat]);

  if (smoothCoords.length > 0) {
    smoothCoords[0] = [rawNodes[0].lon, rawNodes[0].lat];
    smoothCoords[smoothCoords.length - 1] = [rawNodes[rawNodes.length - 1].lon, rawNodes[rawNodes.length - 1].lat];
  }

  return smoothCoords;
}

export function planAresRoute(startCoord, destCoord, waypoints = [], profile = ROUTE_PROFILES.SAFEST) {
  const allStops = [startCoord, ...waypoints, destCoord];
  let rawNodes = [];

  for (let i = 0; i < allStops.length - 1; i++) {
    const segmentNodes = aStarSegment(allStops[i], allStops[i + 1], profile);
    if (i > 0 && segmentNodes.length > 0) {
      rawNodes.push(...segmentNodes.slice(1));
    } else {
      rawNodes.push(...segmentNodes);
    }
  }

  // Generate smooth, continuous Any-Angle trajectory
  const coordinates = smoothTraverseCoordinates(rawNodes);

  let totalDistanceKm = 0;
  let totalElevationGain = 0;
  let totalElevationLoss = 0;
  let maxSlopeDeg = 0;
  let sumSlope = 0;
  let totalTravelHours = 0;
  let hazardExposureCount = 0;

  const elevationProfile = [];

  for (let i = 0; i < coordinates.length; i++) {
    const [cLon, cLat] = coordinates[i];
    const elev = estimateGaleElevation(cLon, cLat);
    const hazard = getCoordinateHazardFactor(cLon, cLat);

    let stepDistKm = 0;
    let stepSlopeDeg = 0;

    if (i > 0) {
      const [pLon, pLat] = coordinates[i - 1];
      const prevElev = elevationProfile[i - 1].elevationM;
      stepDistKm = calculateMarsDistanceKm([pLon, pLat], [cLon, cLat]);
      totalDistanceKm += stepDistKm;

      const deltaElev = elev - prevElev;
      if (deltaElev > 0) totalElevationGain += deltaElev;
      else totalElevationLoss += Math.abs(deltaElev);

      stepSlopeDeg = calculateSlopeDeg(prevElev, elev, stepDistKm * 1000);
      maxSlopeDeg = Math.max(maxSlopeDeg, stepSlopeDeg);
      sumSlope += stepSlopeDeg;

      const speedKmH = calculateSpeedKmH(stepSlopeDeg);
      totalTravelHours += stepDistKm / speedKmH;
    }

    if (hazard > 0.3) {
      hazardExposureCount++;
    }

    elevationProfile.push({
      distanceKm: Number(totalDistanceKm.toFixed(2)),
      elevationM: elev,
      slopeDeg: Number(stepSlopeDeg.toFixed(1)),
      hazard,
      lon: cLon,
      lat: cLat
    });
  }

  const avgSlopeDeg = coordinates.length > 1 ? sumSlope / (coordinates.length - 1) : 0;
  const hazardExposurePercent = coordinates.length > 0
    ? Math.round((hazardExposureCount / coordinates.length) * 100)
    : 0;

  const totalMetabolicKcal = calculateMetabolicRateKcal(avgSlopeDeg, totalTravelHours);

  // NASA PLSS Life Support Consumables Budget (4.86 kcal / L O2 in 0.38g)
  const o2Liters = Math.round(totalMetabolicKcal / 4.86);
  const o2Kg = Number((o2Liters * 0.001429).toFixed(2));
  const batteryWh = Math.round(totalTravelHours * 320); // 320W suit power
  const coolingWaterKg = Number((totalTravelHours * 0.38).toFixed(2)); // sublimator rate
  const pointOfSafeReturnKm = Number((totalDistanceKm * 0.45).toFixed(1));

  return {
    profileId: profile.id,
    profileName: profile.name,
    coordinates,
    rawNodes,
    elevationProfile,
    metrics: {
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      estimatedDurationHours: Number(totalTravelHours.toFixed(2)),
      maxSlopeDeg: Number(maxSlopeDeg.toFixed(1)),
      avgSlopeDeg: Number(avgSlopeDeg.toFixed(1)),
      elevationGainM: Math.round(totalElevationGain),
      elevationLossM: Math.round(totalElevationLoss),
      minElevationM: Math.min(...elevationProfile.map((p) => p.elevationM)),
      maxElevationM: Math.max(...elevationProfile.map((p) => p.elevationM)),
      baseElevationM: elevationProfile[0]?.elevationM ?? 0,
      relativeMaxReliefM: Math.round(Math.max(...elevationProfile.map((p) => p.elevationM - (elevationProfile[0]?.elevationM || 0)))),
      hazardExposurePercent,
      estimatedCaloriesKcal: totalMetabolicKcal,
      nodeCount: coordinates.length,
      plssConsumables: {
        oxygenLiters: o2Liters,
        oxygenKg: o2Kg,
        batteryWh,
        coolingWaterKg,
        pointOfSafeReturnKm,
        suitMobilityMargin: maxSlopeDeg <= 10 ? 'Nominal (100% Suit Mobility)' : maxSlopeDeg <= 15 ? 'Manageable (Paced Ascent)' : 'Caution (Steep Scree)'
      }
    }
  };
}
