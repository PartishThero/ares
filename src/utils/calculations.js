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
  return estimateMarsElevation(lon, lat);
}

export function estimateMarsElevation(lon, lat) {
  // Gale Crater local micro-topography (~154 km diameter, center ~137.4° Lon, -4.6° Lat)
  if (Math.abs(lon - 137.4) < 1.9 && Math.abs(lat - (-4.6)) < 1.9) {
    const distFromPeak = calculateMarsDistanceKm([lon, lat], [137.85, -5.08]);
    const floorElevation = -4520;

    const moundDist = Math.max(0, 42 - distFromPeak);
    const latFactor = Math.min(1.0, Math.max(0, (-lat - 4.65) / 0.15));
    const moundElevation = moundDist > 0 ? (5020 * Math.pow(moundDist / 42, 1.4) * latFactor) : 0;

    const noise = (Math.sin(lon * 420.5) * Math.cos(lat * 380.2) * 10) +
                  (Math.sin(lon * 1100.2 + lat * 950.4) * 5);

    return Math.round(floorElevation + moundElevation + noise);
  }

  // Major planetary landmarks (MOLA topographic datum)
  const landmarks = [
    { center: [-133.8, 18.65], peak: 21287, radiusKm: 340, isDepression: false }, // Olympus Mons
    { center: [-104.5, 11.9], peak: 18225, radiusKm: 240, isDepression: false },  // Ascraeus Mons
    { center: [-112.8, 0.8], peak: 14058, radiusKm: 210, isDepression: false },   // Pavonis Mons
    { center: [-120.9, -8.4], peak: 17761, radiusKm: 230, isDepression: false },  // Arsia Mons
    { center: [146.8, 25.0], peak: 12600, radiusKm: 240, isDepression: false },   // Elysium Mons
    { center: [70.5, -42.4], peak: -7200, radiusKm: 1100, isDepression: true },   // Hellas Basin
    { center: [-43.0, -49.7], peak: -5200, radiusKm: 450, isDepression: true },   // Argyre Basin
    { center: [-80.0, -9.5], peak: -6000, radiusKm: 380, isDepression: true },    // Valles Marineris
    { center: [77.45, 18.44], peak: -2530, radiusKm: 30, isDepression: true }     // Jezero Crater
  ];

  let landmarkDelta = 0;
  for (const lm of landmarks) {
    const d = calculateMarsDistanceKm([lon, lat], lm.center);
    if (d < lm.radiusKm) {
      const frac = 1 - (d / lm.radiusKm);
      if (lm.isDepression) {
        landmarkDelta += (lm.peak - (-3500)) * Math.pow(frac, 1.2);
      } else {
        landmarkDelta += (lm.peak - 1200) * Math.pow(frac, 1.5);
      }
      break;
    }
  }

  // Mars Crustal Dichotomy: Northern Lowlands vs Southern Highlands
  let baseElev;
  if (lat > 18) {
    baseElev = -4200;
  } else if (lat < -12) {
    baseElev = 1800;
  } else {
    // Transition slope between -12° and +18° Lat
    baseElev = -4200 + ((18 - lat) / 30) * 6000;
  }

  // Realistic planetary roughness and cratered terrain noise
  const noise = (Math.sin(lon * 0.05) * Math.cos(lat * 0.05) * 450) +
                (Math.sin(lon * 0.25 + lat * 0.2) * 180) +
                (Math.sin(lon * 2.1 - lat * 1.8) * 40);

  return Math.round(baseElev + landmarkDelta + noise);
}

export function getGaleGeologicalContext(elevation, lon, lat) {
  // If in Gale crater
  if (Math.abs(lon - 137.4) < 1.9 && Math.abs(lat - (-4.6)) < 1.9) {
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

  // Planetary regional context
  if (elevation > 10000) {
    return {
      unit: 'Tharsis / Elysium Shield Volcanic Unit (Effusive Basalts)',
      era: 'Amazonian / Hesperian',
      roughness: 'Extreme (lava tubes, collapsed calderas, fresh lava flows)',
      stability: 'Low-Medium',
      hazardFactor: 0.80
    };
  } else if (elevation < -5500) {
    return {
      unit: 'Deep Impact Basin / Chasma Floor (Sedimentary Fill & Breccia)',
      era: 'Noachian Basal Units',
      roughness: 'Variable (high dust accumulation, thermal inertia pockets)',
      stability: 'Medium',
      hazardFactor: 0.50
    };
  } else if (lat < -10) {
    return {
      unit: 'Noachian Cratering Highlands (Ancient Crust & Impact Regolith)',
      era: 'Early to Middle Noachian (> 3.7 Ga)',
      roughness: 'High (heavily cratered, ejecta blankets, bedrock outcrops)',
      stability: 'High',
      hazardFactor: 0.30
    };
  } else {
    return {
      unit: 'Northern Lowland Plains (Vastitas Borealis Sedimentary Mantle)',
      era: 'Hesperian / Amazonian',
      roughness: 'Low (smooth eolian plains, cryoturbated polygonal soil)',
      stability: 'High',
      hazardFactor: 0.20
    };
  }
}
