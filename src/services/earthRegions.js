// Geodesic scaling factor between Earth (radius ~6371 km) and Mars (radius ~3389.5 km)
// Ratio: 6371 / 3389.5 = 1.8796 ~ 1.887x
export const MARS_TO_EARTH_SCALE_FACTOR = 1.887;

export const EARTH_COUNTRIES = [
  {
    id: 'usa',
    name: 'United States',
    areaKm2: '9,833,517 km²',
    description: 'Spans nearly an entire Martian hemisphere from Tharsis to Elysium.',
    approxRadiusDeg: 24.0,
    aspectRatio: 1.6,
    color: [64, 158, 255, 0.45],
    outlineColor: '#409EFF'
  },
  {
    id: 'india',
    name: 'India',
    areaKm2: '3,287,263 km²',
    description: 'Encompasses the entire Hellas Impact Basin or Valles Marineris.',
    approxRadiusDeg: 14.5,
    aspectRatio: 0.85,
    color: [255, 145, 0, 0.45],
    outlineColor: '#FF9100'
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    areaKm2: '41,285 km²',
    description: 'Fits comfortably inside the caldera rim of Olympus Mons or Gale Crater.',
    approxRadiusDeg: 2.1,
    aspectRatio: 1.5,
    color: [255, 77, 79, 0.55],
    outlineColor: '#FF4D4F'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    areaKm2: '242,495 km²',
    description: 'Matches the size of Elysium Mons volcanic shield.',
    approxRadiusDeg: 4.8,
    aspectRatio: 0.6,
    color: [114, 46, 209, 0.45],
    outlineColor: '#722ED1'
  },
  {
    id: 'germany',
    name: 'Germany',
    areaKm2: '357,022 km²',
    description: 'Equal in diameter to the Argyre Impact Basin floor.',
    approxRadiusDeg: 5.6,
    aspectRatio: 0.9,
    color: [250, 219, 20, 0.45],
    outlineColor: '#FADB14'
  },
  {
    id: 'australia',
    name: 'Australia',
    areaKm2: '7,692,024 km²',
    description: 'Covers the entire Martian northern lowlands of Acidalia Planitia.',
    approxRadiusDeg: 21.0,
    aspectRatio: 1.3,
    color: [82, 196, 26, 0.45],
    outlineColor: '#52C41A'
  },
  {
    id: 'brazil',
    name: 'Brazil',
    areaKm2: '8,515,767 km²',
    description: 'Equivalent to the entire southern highlands plateau of Noachis Terra.',
    approxRadiusDeg: 22.5,
    aspectRatio: 1.05,
    color: [19, 194, 194, 0.45],
    outlineColor: '#13C2C2'
  },
  {
    id: 'japan',
    name: 'Japan',
    areaKm2: '377,975 km²',
    description: 'Archipelago length spans the entire trench of Valles Marineris.',
    approxRadiusDeg: 7.2,
    aspectRatio: 0.4,
    color: [235, 47, 150, 0.45],
    outlineColor: '#EB2F96'
  }
];

export function generateScaleCorrectedCountryPolygon(country, centerLon, centerLat) {
  const scaledRadius = country.approxRadiusDeg * MARS_TO_EARTH_SCALE_FACTOR;
  const numPoints = 64;
  const ring = [];

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    // Add subtle procedural organic boundary variation to look like a realistic coastline/border
    const wobble = 1 + (Math.sin(angle * 5) * 0.08) + (Math.cos(angle * 9) * 0.05);
    const dLon = Math.cos(angle) * scaledRadius * (country.aspectRatio || 1.0) * wobble;
    const dLat = Math.sin(angle) * scaledRadius * wobble;
    
    // Scale longitude by cosine of latitude to maintain true spherical shape on Martian globe
    const cosLat = Math.max(0.15, Math.cos((centerLat * Math.PI) / 180));
    ring.push([
      centerLon + (dLon / cosLat),
      Math.max(-88, Math.min(88, centerLat + dLat))
    ]);
  }

  return ring;
}

