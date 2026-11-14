import { calculateMarsDistanceKm, formatMarsCoords } from '../utils/coordinates.js';
import { estimateGaleElevation, getGaleGeologicalContext } from '../utils/calculations.js';
import { getCoordinateHazardFactor, HAZARD_ZONES } from '../data/hazardData.js';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets.js';
import { MSL_RAD_OBSERVATIONS } from '../data/radiationData.js';

export function inspectMarsLocation(lon, lat) {
  const elevation = estimateGaleElevation(lon, lat);
  const geologicalContext = getGaleGeologicalContext(elevation, lon, lat);
  const hazardFactor = getCoordinateHazardFactor(lon, lat);

  let closestTarget = null;
  let minTargetDistKm = Infinity;

  for (const target of SCIENTIFIC_TARGETS) {
    const dist = calculateMarsDistanceKm([lon, lat], target.coordinates);
    if (dist < minTargetDistKm) {
      minTargetDistKm = dist;
      closestTarget = target;
    }
  }

  let activeHazardZone = null;
  for (const zone of HAZARD_ZONES) {
    const dist = calculateMarsDistanceKm([lon, lat], zone.center);
    if (dist <= zone.radiusKm * 1.2) {
      activeHazardZone = { ...zone, currentDistanceKm: Number(dist.toFixed(2)) };
      break;
    }
  }

  const baseDayTempC = Math.round(-12 + (elevation / 500) * 1.5);
  const baseNightTempC = Math.round(-82 - (elevation / 600) * 1.8);

  let closestRad = MSL_RAD_OBSERVATIONS[0];
  let minRadDist = Infinity;
  for (const rad of MSL_RAD_OBSERVATIONS) {
    const dist = calculateMarsDistanceKm([lon, lat], rad.coordinates);
    if (dist < minRadDist) {
      minRadDist = dist;
      closestRad = rad;
    }
  }

  return {
    coordinates: [lon, lat],
    formattedCoords: formatMarsCoords(lon, lat),
    elevationMeters: elevation,
    geology: geologicalContext,
    hazard: {
      factor: Number(hazardFactor.toFixed(2)),
      level: hazardFactor > 0.6 ? 'Severe' : hazardFactor > 0.3 ? 'Moderate' : 'Low',
      activeZone: activeHazardZone
    },
    thermal: {
      daytimeTempC: baseDayTempC,
      nighttimeTempC: baseNightTempC,
      thermalInertiaSI: elevation < -4000 ? '380 J m⁻² K⁻¹ s⁻¹/² (consolidated rock)' : '210 J m⁻² K⁻¹ s⁻¹/² (sand/dust)'
    },
    nearestPOI: {
      target: closestTarget,
      distanceKm: Number(minTargetDistKm.toFixed(2))
    },
    historicalRadiation: closestRad,
    atmosphericPressurePa: Math.round(840 - (elevation + 4500) * 0.08)
  };
}
