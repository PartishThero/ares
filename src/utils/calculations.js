import { calculateMarsDistanceKm } from './coordinates.js';
import { NASA_MARS_TREK_TARGETS } from '../data/nasaMarsTrek2000.js';

let spatialFeatureIndex = null;
function getSpatialFeatureIndex() {
  if (spatialFeatureIndex) return spatialFeatureIndex;
  spatialFeatureIndex = new Map();
  for (const t of (NASA_MARS_TREK_TARGETS || [])) {
    const [lon, lat] = t.coordinates;
    const k = `${Math.floor(lon / 8)},${Math.floor(lat / 8)}`;
    if (!spatialFeatureIndex.has(k)) spatialFeatureIndex.set(k, []);
    spatialFeatureIndex.get(k).push(t);
  }
  return spatialFeatureIndex;
}

function getPlanetaryFeatureDelta(lon, lat) {
  const index = getSpatialFeatureIndex();
  const bx = Math.floor(lon / 8);
  const by = Math.floor(lat / 8);
  let delta = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bin = index.get(`${bx + dx},${by + dy}`);
      if (!bin) continue;
      for (const feat of bin) {
        const cat = (feat.category || '').toLowerCase();
        const isCrater = cat.includes('crater');
        const isMons = cat.includes('mons') || cat.includes('peak');
        if (!isCrater && !isMons) continue;

        const dKm = calculateMarsDistanceKm([lon, lat], feat.coordinates);
        const radiusKm = isMons ? 120 : feat.tier === 1 ? 45 : feat.tier === 2 ? 22 : 12;

        if (dKm < radiusKm) {
          if (isCrater) {
            if (dKm < radiusKm * 0.7) {
              delta += -1400 * (1 - dKm / (radiusKm * 0.7));
            } else {
              delta += 600 * Math.sin(((dKm - radiusKm * 0.7) / (radiusKm * 0.3)) * Math.PI);
            }
          } else if (isMons) {
            delta += 4500 * Math.pow(1 - dKm / radiusKm, 1.4);
          }
          return delta;
        }
      }
    }
  }
  return delta;
}

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

  // Regional adjustment for Elysium Planitia / Aeolis lowland province (Lon 130° to 155°, Lat -7° to 15°)
  // In real Mars MOLA datum, Elysium Planitia is an extensive volcanic/sedimentary lowland at ~ -2400m datum
  let regionalElev = baseElev;
  if (lon >= 130 && lon <= 155 && lat >= -7 && lat <= 15) {
    const elyCenterLon = 142.0;
    const elyCenterLat = 4.0;
    const dEly = calculateMarsDistanceKm([lon, lat], [elyCenterLon, elyCenterLat]);
    const maxREly = 650;
    if (dEly < maxREly) {
      const frac = 1 - (dEly / maxREly);
      const smoothFrac = 0.5 * (1 - Math.cos(frac * Math.PI));
      regionalElev = baseElev * (1 - smoothFrac) + (-2400) * smoothFrac;
    }
  }

  // Gale Crater Regional Topography (Floor datum ~ -4520m, Rim wall, Mount Sharp, and Companion Craters)
  // Continuous C1 elevation model without artificial step discontinuities
  const distGale = calculateMarsDistanceKm([lon, lat], [137.40, -4.60]);
  let galeDelta = 0;

  if (distGale < 110) {
    if (distGale < 52) {
      // Inside Gale Crater floor (-4520m)
      const floorTarget = -4520 - regionalElev;
      galeDelta += floorTarget;

      // Mount Sharp central mound (rises south of lat -4.65°)
      const distPeak = calculateMarsDistanceKm([lon, lat], [137.85, -5.08]);
      const moundDist = Math.max(0, 36 - distPeak);
      const latFactor = Math.min(1.0, Math.max(0, (-lat - 4.65) / 0.15));
      const moundElevation = moundDist > 0 ? (5020 * Math.pow(moundDist / 36, 1.4) * latFactor) : 0;
      galeDelta += moundElevation;
    } else if (distGale < 77) {
      // Gale Crater circular rim wall (rising steeply from -4520m up to -2100m)
      const t = (distGale - 52) / 25;
      const rimElev = -4520 + 2420 * Math.sin(t * Math.PI / 2);
      galeDelta += (rimElev - regionalElev);
    } else {
      // Outer rim ramp transitioning down to regional plains
      const t = (distGale - 77) / 33;
      const rampElev = -2100 - 300 * Math.sin(t * Math.PI / 2);
      const fade = Math.pow(1 - t, 2);
      galeDelta += (rampElev - regionalElev) * fade;
    }
  }

  // Prominent Eastern Companion Impact Crater at [138.80° Lon, -4.50° Lat], radius 14 km
  const dCrater = calculateMarsDistanceKm([lon, lat], [138.80, -4.50]);
  let craterDelta = 0;
  if (dCrater < 22) {
    if (dCrater < 10) {
      craterDelta = -3800 - regionalElev;
    } else if (dCrater < 14) {
      const t = (dCrater - 10) / 4;
      const rimElev = -3800 + 2600 * t;
      craterDelta = rimElev - regionalElev;
    } else {
      const t = (dCrater - 14) / 8;
      const ejectaElev = -1200 - 1200 * t;
      const fade = Math.pow(1 - t, 2);
      craterDelta = (ejectaElev - regionalElev) * fade;
    }
  }

  // Secondary Satellite Crater at [138.90° Lon, -5.25° Lat], radius 7 km
  const dSat = calculateMarsDistanceKm([lon, lat], [138.90, -5.25]);
  let satDelta = 0;
  if (dSat < 12) {
    if (dSat < 5) {
      satDelta = -3500 - regionalElev;
    } else if (dSat < 7) {
      const t = (dSat - 5) / 2;
      const rimElev = -3500 + 2100 * t;
      satDelta = rimElev - regionalElev;
    } else {
      const t = (dSat - 7) / 5;
      const ejectaElev = -1400 - 1000 * t;
      const fade = Math.pow(1 - t, 2);
      satDelta = (ejectaElev - regionalElev) * fade;
    }
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

  // Planetary feature deltas outside Gale Crater (Gale Crater features are modeled with high-resolution continuous models above)
  const featureDelta = distGale < 110 ? 0 : getPlanetaryFeatureDelta(lon, lat);

  // Micro-relief and planetary roughness noise
  const noise = (Math.sin(lon * 0.05) * Math.cos(lat * 0.05) * 450) +
                (Math.sin(lon * 0.25 + lat * 0.2) * 180) +
                (Math.sin(lon * 2.1 - lat * 1.8) * 40) +
                (Math.sin(lon * 420.5) * Math.cos(lat * 380.2) * 8);

  return Math.round(regionalElev + galeDelta + craterDelta + satDelta + landmarkDelta + featureDelta + noise);
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

/**
 * Formats elevation into readable human/astronaut terms:
 * Explains planetary MOLA areoid datum and calculates relative ground relief.
 */
export function formatReadableElevation(elevationM, baseElevationM = null) {
  if (typeof elevationM !== 'number' || isNaN(elevationM)) return 'N/A';
  
  if (baseElevationM !== null && typeof baseElevationM === 'number') {
    const diff = Math.round(elevationM - baseElevationM);
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toLocaleString()} m (Relief) · ${formatMolaDatum(elevationM)}`;
  }
  return formatMolaDatum(elevationM);
}

export function formatMolaDatum(elevationM) {
  if (typeof elevationM !== 'number' || isNaN(elevationM)) return 'N/A';
  if (elevationM === 0) return '0 m (Mars Areoid Datum)';
  if (elevationM < 0) {
    const absKm = (Math.abs(elevationM) / 1000).toFixed(1);
    return `${elevationM.toLocaleString()} m MOLA (${absKm} km below datum)`;
  }
  const km = (elevationM / 1000).toFixed(1);
  return `+${elevationM.toLocaleString()} m MOLA (+${km} km above datum)`;
}
