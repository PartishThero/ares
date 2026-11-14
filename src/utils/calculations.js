import { calculateMarsDistanceKm } from './coordinates.js';

export function calculateSlopeDeg(elevation1, elevation2, distanceMeters) {
  if (distanceMeters <= 0.001) return 0;
  const deltaElev = Math.abs(elevation2 - elevation1);
  const radians = Math.atan(deltaElev / distanceMeters);
  return (radians * 180) / Math.PI;
}

// Astronaut walking speed (km/h) as function of slope in 0.38g gravity
export function calculateSpeedKmH(slopeDeg) {
  if (slopeDeg <= 3) return 1.25;
  if (slopeDeg <= 8) return 1.0;
  if (slopeDeg <= 14) return 0.7;
  if (slopeDeg <= 20) return 0.45;
  return 0.25;
}

export function calculateMetabolicRateKcal(slopeDeg, durationHours) {
  const baseRate = 240;
  const slopePenalty = Math.min(320, slopeDeg * 18);
  return Math.round((baseRate + slopePenalty) * durationHours);
}

// Gale Crater floor datum ~ -4520m; Mount Sharp rises south of lat -4.65°
export function estimateGaleElevation(lon, lat) {
  const distFromPeak = calculateMarsDistanceKm([lon, lat], [137.85, -5.08]);
  const floorElevation = -4520;

  const moundDist = Math.max(0, 42 - distFromPeak);
  const latFactor = Math.min(1.0, Math.max(0, (-lat - 4.65) / 0.15));
  const moundElevation = moundDist > 0 ? (5020 * Math.pow(moundDist / 42, 1.4) * latFactor) : 0;

  const noise = (Math.sin(lon * 420.5) * Math.cos(lat * 380.2) * 10) +
                (Math.sin(lon * 1100.2 + lat * 950.4) * 5);

  return Math.round(floorElevation + moundElevation + noise);
}

export function getGaleGeologicalContext(elevation, lon, lat) {
  if (elevation < -4450) {
    return {
      unit: 'Bradbury Group (Lacustrine Mudstone & Sandstone)',
      era: 'Hesperian to Early Amazonian',
      roughness: 'Moderate (pebble regolith & dust mantle)',
      stability: 'High',
      hazardFactor: 0.15
    };
  } else if (elevation < -4150) {
    return {
      unit: 'Murray Formation (Fluvio-Lacustrine Siltstones)',
      era: 'Late Noachian / Early Hesperian',
      roughness: 'Low-Medium (layered cross-bedding)',
      stability: 'High',
      hazardFactor: 0.22
    };
  } else if (elevation < -3700) {
    return {
      unit: 'Vera Rubin Ridge / Glen Torridon (Clay-Bearing Smectite)',
      era: 'Early Hesperian',
      roughness: 'High (hematite resistant capping, fractured rock)',
      stability: 'Medium-High',
      hazardFactor: 0.38
    };
  } else if (elevation < -2800) {
    return {
      unit: 'Sulfate-Bearing Unit & Boxwork Ridges',
      era: 'Hesperian (Drying Climate Transition)',
      roughness: 'Very High (polygonal cement ridges & hollows)',
      stability: 'Caution (sharp fracture ridges)',
      hazardFactor: 0.65
    };
  } else {
    return {
      unit: 'Upper Mount Sharp Mound (Eolian Layered Deposits)',
      era: 'Amazonian',
      roughness: 'Severe (steep talus slopes, yardangs)',
      stability: 'Low',
      hazardFactor: 0.85
    };
  }
}
