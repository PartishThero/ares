export const HAZARD_ZONES = [
  {
    id: 'hazard-bagnold-dunes',
    name: 'Bagnold Active Dune Corridor',
    type: 'Eolian Soft Sand / Entrapment Hazard',
    severity: 'High',
    penaltyMultiplier: 12.0,
    center: [137.3750, -4.7550],
    radiusKm: 1.8,
    maxSlope: 32,
    description: 'Active barchan dunes with loose, uncompacted basaltic sand. Extremely high risk of astronaut boot sinkage or rover wheel trenching.',
    recommendedAction: 'Mandatory detour around perimeter or traversal only via consolidated interdune corridors.'
  },
  {
    id: 'hazard-vera-escarpment',
    name: 'Vera Rubin Ridge Northern Escarpment',
    type: 'Steep Rocky Cliff / Fall Hazard',
    severity: 'Severe',
    penaltyMultiplier: 15.0,
    center: [137.3520, -4.7380],
    radiusKm: 1.2,
    maxSlope: 26,
    description: 'Near-vertical fractured cliff face capped by hard hematite bedrock. Traversal impossible without climbing anchors.',
    recommendedAction: 'Navigate through gently sloping natural ramps at eastern gap.'
  },
  {
    id: 'hazard-gediz-talus',
    name: 'Upper Gediz Vallis Debris Boulder Field',
    type: 'Unstable Boulder Field / Rockfall',
    severity: 'High',
    penaltyMultiplier: 10.0,
    center: [137.3420, -4.8480],
    radiusKm: 1.5,
    maxSlope: 24,
    description: 'Chaotic jumble of megaboulders (> 2m diameter) deposited on steep slope. High risk of rock shifting underfoot.',
    recommendedAction: 'Reduce travel speed by 60%, avoid crossing during thermal expansion periods (afternoon).'
  },
  {
    id: 'hazard-boxwork-crevasses',
    name: 'Boxwork Fracture Voids',
    type: 'Fractured Crevasses / Blade-like Veins',
    severity: 'Medium',
    penaltyMultiplier: 7.5,
    center: [137.4080, -4.9520],
    radiusKm: 1.4,
    maxSlope: 19,
    description: 'Complex maze of intersecting mineral blades up to 2m high with hollowed interior soil pockets.',
    recommendedAction: 'Follow crests of major boxwork ridges; avoid stepping into shadowed sediment hollows.'
  },
  {
    id: 'hazard-sharp-upper-gullies',
    name: 'Upper Mount Sharp Talus Slope',
    type: 'Extreme Slope / Scree Slide',
    severity: 'Critical',
    penaltyMultiplier: 25.0,
    center: [137.4350, -4.9950],
    radiusKm: 2.2,
    maxSlope: 35,
    description: 'Steep scree-covered flank of central mountain exceeding 25° incline. Beyond certified EVA suit walking limits.',
    recommendedAction: 'Strict EVA exclusion zone for unassisted foot travel.'
  },
  {
    id: 'hazard-eastern-crater-rim',
    name: 'Eastern Rim Escarpment & Talus',
    type: 'Steep Impact Crater Rim / Fall Hazard',
    severity: 'Severe',
    penaltyMultiplier: 18.0,
    center: [138.8000, -4.5000],
    radiusKm: 14.0,
    maxSlope: 44,
    description: 'Prominent 28-km impact crater with steep inner scarp walls and boulder talus. Traversing over the rim crest is impassable.',
    recommendedAction: 'Mandatory detour around perimeter via northern low-elevation saddle pass at Lat -4.1°.'
  }
];

export function getCoordinateHazardFactor(lon, lat) {
  let totalHazard = 0;

  for (const zone of HAZARD_ZONES) {
    const dLon = lon - zone.center[0];
    const dLat = lat - zone.center[1];
    const distDeg = Math.sqrt(dLon * dLon + dLat * dLat);
    const radiusDeg = zone.radiusKm / 59.1; // ~59.1 km per degree at Mars equator

    if (distDeg < radiusDeg) {
      const falloff = 1 - (distDeg / radiusDeg);
      const intensity = zone.penaltyMultiplier / 25.0;
      totalHazard = Math.max(totalHazard, intensity * falloff);
    }
  }

  return Math.min(1.0, totalHazard);
}
