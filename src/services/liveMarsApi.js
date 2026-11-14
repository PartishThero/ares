const POI_STORAGE_KEY = 'ares_astronaut_pois_v1';
const MISSION_STORAGE_KEY = 'ares_custom_missions_v1';

export async function fetchLiveSpaceWeather() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      'https://api.nasa.gov/DONKI/SEP?startDate=2024-01-01&endDate=2024-12-31&api_key=DEMO_KEY',
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('DONKI unavailable');
    const data = await res.json();
    return {
      connected: true,
      source: 'NASA DONKI Space Weather Service',
      eventsCount: Array.isArray(data) ? data.length : 0,
      activeAlert: false,
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    return {
      connected: false,
      source: 'NASA In-Situ Archive (Simulated Live Feed)',
      eventsCount: 2,
      activeAlert: false,
      lastUpdated: new Date().toISOString()
    };
  }
}

export function generateLiveMarsTelemetry(solNumber) {
  const now = new Date();
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const hourOfDay = (now.getUTCHours() + now.getUTCMinutes() / 60) % 24;

  const tempCycle = Math.sin(((hourOfDay - 6) / 24) * 2 * Math.PI);
  const airTemp = Math.round(-65 + tempCycle * 42 + Math.sin(seconds * 0.1) * 1.5);
  const groundTemp = Math.round(-60 + tempCycle * 55 + Math.cos(seconds * 0.1) * 2.0);

  const pressureBase = 840;
  const pressure = Math.round(pressureBase + Math.sin(seconds * 0.05) * 8);

  const windSpeed = (3.2 + Math.abs(Math.sin(seconds * 0.2)) * 6.8).toFixed(1);
  const windDirections = ['NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
  const windDirIndex = Math.floor((seconds / 4) % windDirections.length);

  const dustOpacityTau = (0.58 + Math.sin(seconds * 0.02) * 0.08).toFixed(2);
  const radiationGcr = (26.8 + Math.sin(seconds * 0.08) * 1.2).toFixed(1);

  return {
    sol: solNumber || 5073,
    airTemperatureC: airTemp,
    groundTemperatureC: groundTemp,
    atmosphericPressurePa: pressure,
    windSpeedMps: parseFloat(windSpeed),
    windDirection: windDirections[windDirIndex],
    dustOpacityTau: parseFloat(dustOpacityTau),
    radiationRateUsvPerHour: parseFloat(radiationGcr),
    radiationStatus: 'Nominal GCR Background',
    sensorLinkQuality: '99.4% (Direct Mars Relay)',
    timestamp: now.toLocaleTimeString()
  };
}

export function getAstronautPOIs() {
  try {
    const raw = localStorage.getItem(POI_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAstronautPOI(poi) {
  const existing = getAstronautPOIs();
  const updated = [
    {
      ...poi,
      id: poi.id || `poi-user-${Date.now()}`,
      isUserCreated: true,
      createdAt: new Date().toISOString()
    },
    ...existing.filter((p) => p.id !== poi.id)
  ];
  try {
    localStorage.setItem(POI_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save POI:', err);
  }
  return updated;
}

export function deleteAstronautPOI(id) {
  const existing = getAstronautPOIs();
  const updated = existing.filter((p) => p.id !== id);
  try {
    localStorage.setItem(POI_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete POI:', err);
  }
  return updated;
}

export function getCustomMissions() {
  try {
    const raw = localStorage.getItem(MISSION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomMission(mission) {
  const existing = getCustomMissions();
  const updated = [
    {
      ...mission,
      id: mission.id || `mission-custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    },
    ...existing.filter((m) => m.id !== mission.id)
  ];
  try {
    localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom mission:', err);
  }
  return updated;
}

export function deleteCustomMission(id) {
  const existing = getCustomMissions();
  const updated = existing.filter((m) => m.id !== id);
  try {
    localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom mission:', err);
  }
  return updated;
}

