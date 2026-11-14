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

let cachedGrid = null;
export function getOrCreateGrid() {
  if (cachedGrid) return cachedGrid;

  const { cols, rows } = GALE_BOUNDS;
  const grid = new Array(rows);

  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(cols);
    for (let c = 0; c < cols; c++) {
      const [lon, lat] = gridToCoord(c, r);
      const elevation = estimateGaleElevation(lon, lat);
      const hazard = getCoordinateHazardFactor(lon, lat);
      grid[r][c] = { col: c, row: r, lon, lat, elevation, hazard };
    }
  }

  cachedGrid = grid;
  return grid;
}

function aStarSegment(startCoord, destCoord, profile = ROUTE_PROFILES.SAFEST) {
  const grid = getOrCreateGrid();
  const startGrid = coordToGrid(startCoord[0], startCoord[1]);
  const destGrid = coordToGrid(destCoord[0], destCoord[1]);

  const startIndex = `${startGrid.col},${startGrid.row}`;
  const destIndex = `${destGrid.col},${destGrid.row}`;

  if (startIndex === destIndex) {
    const node = grid[startGrid.row][startGrid.col];
    return [node];
  }

  const openSet = new MinHeap();
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();

  gScore.set(startIndex, 0);
  const initialH = calculateMarsDistanceKm(startCoord, destCoord) * profile.weights.distance;
  openSet.push({ col: startGrid.col, row: startGrid.row, f: initialH });

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
  const MAX_ITERATIONS = 6000;

  while (!openSet.isEmpty() && iterations < MAX_ITERATIONS) {
    iterations++;
    const current = openSet.pop();
    const currentKey = `${current.col},${current.row}`;

    if (current.col === destGrid.col && current.row === destGrid.row) {
      const path = [];
      let currKey = currentKey;
      while (currKey) {
        const [c, r] = currKey.split(',').map(Number);
        path.unshift(grid[r][c]);
        currKey = cameFrom.get(currKey);
      }
      return path;
    }

    closedSet.add(currentKey);
    const currentNode = grid[current.row][current.col];
    const currentG = gScore.get(currentKey) ?? Infinity;

    for (const nb of neighbors) {
      const nc = current.col + nb.dc;
      const nr = current.row + nb.dr;

      if (nc < 0 || nc >= GALE_BOUNDS.cols || nr < 0 || nr >= GALE_BOUNDS.rows) {
        continue;
      }

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

  return [
    grid[startGrid.row][startGrid.col],
    grid[destGrid.row][destGrid.col]
  ];
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

  let totalDistanceKm = 0;
  let totalElevationGain = 0;
  let totalElevationLoss = 0;
  let maxSlopeDeg = 0;
  let sumSlope = 0;
  let totalTravelHours = 0;
  let hazardExposureCount = 0;

  const elevationProfile = [];
  const coordinates = [];

  for (let i = 0; i < rawNodes.length; i++) {
    const curr = rawNodes[i];
    coordinates.push([curr.lon, curr.lat]);

    let stepDistKm = 0;
    let stepSlopeDeg = 0;

    if (i > 0) {
      const prev = rawNodes[i - 1];
      stepDistKm = calculateMarsDistanceKm([prev.lon, prev.lat], [curr.lon, curr.lat]);
      totalDistanceKm += stepDistKm;

      const deltaElev = curr.elevation - prev.elevation;
      if (deltaElev > 0) totalElevationGain += deltaElev;
      else totalElevationLoss += Math.abs(deltaElev);

      stepSlopeDeg = calculateSlopeDeg(prev.elevation, curr.elevation, stepDistKm * 1000);
      maxSlopeDeg = Math.max(maxSlopeDeg, stepSlopeDeg);
      sumSlope += stepSlopeDeg;

      const speedKmH = calculateSpeedKmH(stepSlopeDeg);
      totalTravelHours += stepDistKm / speedKmH;
    }

    if (curr.hazard > 0.3) {
      hazardExposureCount++;
    }

    elevationProfile.push({
      distanceKm: Number(totalDistanceKm.toFixed(2)),
      elevationM: curr.elevation,
      slopeDeg: Number(stepSlopeDeg.toFixed(1)),
      hazard: curr.hazard,
      lon: curr.lon,
      lat: curr.lat
    });
  }

  const avgSlopeDeg = rawNodes.length > 1 ? sumSlope / (rawNodes.length - 1) : 0;
  const hazardExposurePercent = rawNodes.length > 0
    ? Math.round((hazardExposureCount / rawNodes.length) * 100)
    : 0;

  const totalMetabolicKcal = calculateMetabolicRateKcal(avgSlopeDeg, totalTravelHours);

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
      hazardExposurePercent,
      estimatedCaloriesKcal: totalMetabolicKcal,
      nodeCount: rawNodes.length
    }
  };
}
