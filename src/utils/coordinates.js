export const MARS_RADIUS_KM = 3389.5;
export const MARS_RADIUS_M = 3389500;

export function calculateMarsDistanceKm(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return MARS_RADIUS_KM * c;
}

export function formatMarsCoords(lon, lat) {
  if (typeof lon !== 'number' || typeof lat !== 'number') return 'N/A';

  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  const absLat = Math.abs(lat);
  const absLon = Math.abs(lon);

  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = Math.round(((absLat - latDeg) * 60 - latMin) * 60);

  const lonDeg = Math.floor(absLon);
  const lonMin = Math.floor((absLon - lonDeg) * 60);
  const lonSec = Math.round(((absLon - lonDeg) * 60 - lonMin) * 60);

  return `${latDeg}° ${latMin}' ${latSec}" ${latDir}, ${lonDeg}° ${lonMin}' ${lonSec}" ${lonDir}`;
}

export function formatDecimalCoords(lon, lat, precision = 4) {
  if (typeof lon !== 'number' || typeof lat !== 'number') return 'N/A';
  return `${lat.toFixed(precision)}° Lat, ${lon.toFixed(precision)}° Lon`;
}

export function parseMarsCoords(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();
  if (!str) return null;

  // Try matching cardinal directions: e.g. 4.6 S, 137.4 E or 4° 43' S, 137° 23' E
  const latDirMatch = str.match(/([+-]?\d+(?:\.\d+)?)\s*(?:°|deg)?\s*([NS])/i);
  const lonDirMatch = str.match(/([+-]?\d+(?:\.\d+)?)\s*(?:°|deg)?\s*([EW])/i);
  if (latDirMatch && lonDirMatch) {
    let lat = parseFloat(latDirMatch[1]);
    if (latDirMatch[2].toUpperCase() === 'S') lat = -Math.abs(lat);
    let lon = parseFloat(lonDirMatch[1]);
    if (lonDirMatch[2].toUpperCase() === 'W') lon = -Math.abs(lon);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return [lon, lat];
    }
  }

  // Match two floating point numbers: "lon, lat" or "lat, lon"
  const numbers = str.match(/[+-]?\d+(?:\.\d+)?/g);
  if (numbers && numbers.length >= 2) {
    const n1 = parseFloat(numbers[0]);
    const n2 = parseFloat(numbers[1]);
    // For Gale Crater, lon is typically ~137, lat is ~ -4.7
    if (Math.abs(n1) > 90 && Math.abs(n2) <= 90) {
      return [n1, n2];
    } else if (Math.abs(n2) > 90 && Math.abs(n1) <= 90) {
      return [n2, n1];
    } else if (n1 >= -180 && n1 <= 180 && n2 >= -90 && n2 <= 90) {
      return [n1, n2];
    }
  }
  return null;
}

export function getMarsSolTime(lon = 137.44) {
  // Curiosity landed on Sol 0 = August 6, 2012
  const landingEpochMs = 1344230400000;
  const nowMs = Date.now();
  const elapsedMs = Math.max(0, nowMs - landingEpochMs);
  const solDurationMs = 88775244; // 24h 39m 35.244s in ms

  const currentSol = Math.floor(elapsedMs / solDurationMs);
  const solFraction = (elapsedMs % solDurationMs) / solDurationMs;

  const lonOffsetHours = (lon / 360) * 24;
  let totalHours = (solFraction * 24 + lonOffsetHours) % 24;
  if (totalHours < 0) totalHours += 24;

  const h = Math.floor(totalHours);
  const m = Math.floor((totalHours - h) * 60);
  const s = Math.floor(((totalHours - h) * 60 - m) * 60);

  const pad = (n) => String(n).padStart(2, '0');
  return {
    sol: currentSol,
    ltst: `${pad(h)}:${pad(m)}:${pad(s)} LTST`,
    solarLongitudeLs: '142° (Martian Autumn)'
  };
}
