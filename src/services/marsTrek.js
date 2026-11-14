export const MARS_MAP_LAYERS = [
  {
    id: 'viking-color',
    name: 'Viking MDIM2.1 Color (Optical)',
    type: 'Optical Imagery',
    instrument: 'Viking Orbiter Cameras (USGS/NASA)',
    description: 'Calibrated color mosaic representing the visual optical appearance of the Martian surface at 232m/pixel.',
    urlTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    format: 'image/jpeg',
    maxZoom: 7,
    category: 'Optical',
    provenance: 'NASA PDS / USGS Astrogeology',
    legend: {
      type: 'gradient',
      colors: ['#422115', '#8a482b', '#b96c42', '#de986c', '#fae0cd'],
      labels: ['Dark Basaltic Sand', 'Oxidized Dust Mantle', 'Bright Dust Plumes']
    }
  },
  {
    id: 'mola-elevation',
    name: 'MOLA Topographic Color Hillshade',
    type: 'Topographic Elevation',
    instrument: 'Mars Global Surveyor MOLA (NASA/GSFC)',
    description: 'Precision laser altimetry blended with shaded relief showing regional elevation gradients and slope topography.',
    urlTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    format: 'image/jpeg',
    maxZoom: 7,
    category: 'Topographic',
    provenance: 'NASA MGS MOLA Science Team / ASU',
    legend: {
      type: 'gradient',
      colors: ['#1d2d50', '#133b5c', '#1e5f74', '#588b76', '#99b898', '#e2b357', '#d83a56', '#ffffff'],
      labels: ['-8,000m (Basins)', '-4,500m (Gale Floor)', '0m (Datum)', '+5,000m (Mount Sharp)', '+21,000m (Olympus)']
    }
  },
  {
    id: 'mola-hrsc-blend',
    name: 'MOLA / HRSC High-Resolution Topo',
    type: 'Fused Topography',
    instrument: 'ESA Mars Express HRSC + NASA MOLA',
    description: 'Composite high-resolution topography combining European Space Agency HRSC stereo imagery with NASA MOLA laser data.',
    urlTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MOLA_blend200ppx_HRSC_ClrShade_clon0dd_200mpp_lzw/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    format: 'image/jpeg',
    maxZoom: 7,
    category: 'Topographic',
    provenance: 'ESA / DLR / NASA / USGS',
    legend: {
      type: 'gradient',
      colors: ['#1a2a6c', '#b21f1f', '#fdbb2d'],
      labels: ['Low Floor Elevation', 'Mid-Slopes', 'High Prominence Peaks']
    }
  },
  {
    id: 'themis-day-ir',
    name: 'THEMIS Daytime Infrared (Thermal)',
    type: 'Thermal Infrared',
    instrument: 'Mars Odyssey THEMIS (NASA/JPL/ASU)',
    description: 'Daytime thermal infrared emission indicating thermal inertia, rock abundance, and consolidated bedrock vs loose dust.',
    urlTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/THEMIS_DayIR_ControlledMosaics_100m_v2_oct2018/1.0.0/default/default028mm/{z}/{y}/{x}.png',
    format: 'image/png',
    maxZoom: 7,
    category: 'Thermal',
    provenance: 'Arizona State University / NASA Mars Odyssey',
    legend: {
      type: 'gradient',
      colors: ['#000000', '#3b1c52', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],
      labels: ['Low Daytime Temp (Insulating Dust)', 'Moderate Temp', 'High Daytime Temp (Solid Bedrock)']
    }
  },
  {
    id: 'themis-night-ir',
    name: 'THEMIS Nighttime Infrared (Thermal Inertia)',
    type: 'Thermal Inertia',
    instrument: 'Mars Odyssey THEMIS (NASA/JPL/ASU)',
    description: 'Nighttime surface temperatures. High thermal inertia materials (solid rock, cement veins) stay warm at night, while fine dust cools rapidly.',
    urlTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/THEMIS_NightIR_ControlledMosaics_100m_v2_oct2018/1.0.0/default/default028mm/{z}/{y}/{x}.png',
    format: 'image/png',
    maxZoom: 7,
    category: 'Thermal',
    provenance: 'Arizona State University / NASA Mars Odyssey',
    legend: {
      type: 'gradient',
      colors: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
      labels: ['Very Cold (Loose Fine Dust / Sand)', 'Intermediate', 'Warm Night (Solid Bedrock / Boxwork)']
    }
  }
];

export function createTileFallback(col, row, zoom, layerId = 'viking-color') {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const numCols = 2 * Math.pow(2, zoom);
  const numRows = Math.pow(2, zoom);

  const lonMin = -180 + (col / numCols) * 360;
  const lonMax = -180 + ((col + 1) / numCols) * 360;
  const latMax = 90 - (row / numRows) * 180;
  const latMin = 90 - ((row + 1) / numRows) * 180;

  // Gale Crater: lon 137.44, lat -5.37; Mount Sharp: lon 137.85, lat -5.08
  const galeLon = 137.44;
  const galeLat = -5.37;
  const sharpLon = 137.85;
  const sharpLat = -5.08;

  const galePixelX = ((galeLon - lonMin) / (lonMax - lonMin)) * 256;
  const galePixelY = ((latMax - galeLat) / (latMax - latMin)) * 256;

  const sharpPixelX = ((sharpLon - lonMin) / (lonMax - lonMin)) * 256;
  const sharpPixelY = ((latMax - sharpLat) / (latMax - latMin)) * 256;

  if (layerId.includes('mola')) {
    const gradient = ctx.createRadialGradient(sharpPixelX, sharpPixelY, 10, galePixelX, galePixelY, 220);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.2, '#f59e0b');
    gradient.addColorStop(0.45, '#10b981');
    gradient.addColorStop(0.75, '#0ea5e9');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.arc(galePixelX, galePixelY, 140, 0, Math.PI * 2);
    ctx.stroke();
  } else if (layerId.includes('themis-night')) {
    const gradient = ctx.createRadialGradient(sharpPixelX, sharpPixelY, 15, galePixelX, galePixelY, 200);
    gradient.addColorStop(0, '#facc15');
    gradient.addColorStop(0.3, '#ec4899');
    gradient.addColorStop(0.65, '#6366f1');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  } else if (layerId.includes('themis-day')) {
    const gradient = ctx.createRadialGradient(galePixelX, galePixelY, 20, sharpPixelX, sharpPixelY, 200);
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(0.5, '#78350f');
    gradient.addColorStop(1, '#1c1917');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  } else {
    const baseGrad = ctx.createLinearGradient(0, 0, 256, 256);
    baseGrad.addColorStop(0, '#853e20');
    baseGrad.addColorStop(0.5, '#9e4b27');
    baseGrad.addColorStop(1, '#7a3618');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 256, 256);

    const floorGrad = ctx.createRadialGradient(galePixelX, galePixelY, 20, galePixelX, galePixelY, 130);
    floorGrad.addColorStop(0, 'rgba(66, 33, 21, 0.7)');
    floorGrad.addColorStop(0.7, 'rgba(85, 41, 24, 0.5)');
    floorGrad.addColorStop(0.95, 'rgba(168, 92, 58, 0.8)');
    floorGrad.addColorStop(1, 'rgba(120, 56, 32, 0.2)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.arc(galePixelX, galePixelY, 130, 0, Math.PI * 2);
    ctx.fill();

    const moundGrad = ctx.createRadialGradient(sharpPixelX, sharpPixelY, 5, sharpPixelX, sharpPixelY, 65);
    moundGrad.addColorStop(0, 'rgba(215, 145, 105, 0.9)');
    moundGrad.addColorStop(0.5, 'rgba(155, 85, 50, 0.7)');
    moundGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = moundGrad;
    ctx.beginPath();
    ctx.arc(sharpPixelX, sharpPixelY, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(30, 20, 15, 0.65)';
    ctx.beginPath();
    ctx.ellipse(sharpPixelX - 25, sharpPixelY - 10, 35, 12, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 40; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const rw = Math.random() * 4 + 1;
    ctx.fillRect(rx, ry, rw, rw);
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}
