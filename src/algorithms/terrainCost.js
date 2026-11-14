// Cost formula: C = w_d * D + w_s * S + w_h * H + w_c * ΔElev
// Calibrated to NASA EVA biomechanical metabolic constraints in 0.38g gravity

export const ROUTE_PROFILES = {
  SHORTEST: {
    id: 'shortest',
    name: 'Shortest Distance',
    weights: { distance: 1.0, slope: 0.15, hazard: 1.5, climb: 0.005 },
    description: 'Direct trajectory minimizing total distance traversed. Skirts strictly impassable cliffs (> 22°) while maintaining the shortest possible corridor.'
  },
  SAFEST: {
    id: 'safest',
    name: 'Safest & Low Risk',
    weights: { distance: 0.6, slope: 1.2, hazard: 10.0, climb: 0.04 },
    description: 'Prioritizes astronaut safety: strictly skirts steep crater rims, avoids vertical climbs, and seeks natural valley passes.'
  },
  SCIENCE: {
    id: 'science',
    name: 'Science-Focused Traverse',
    weights: { distance: 0.8, slope: 0.6, hazard: 4.0, climb: 0.02 },
    description: 'Balances terrain safety with proximity to high-value geological formations and mineral contacts.'
  }
};

export function calculateEdgeCost(distKm, elev1, elev2, hazard1, hazard2, profile = ROUTE_PROFILES.SAFEST) {
  const { distance: wd, slope: ws, hazard: wh, climb: wc = 0.02 } = profile.weights;

  const distMeters = distKm * 1000;
  const deltaElev = elev2 - elev1;
  const absDeltaElev = Math.abs(deltaElev);
  const slopeDeg = (Math.atan(absDeltaElev / Math.max(1, distMeters)) * 180) / Math.PI;

  // NASA EVA Biomechanical Slope Penalty:
  // Slopes <= 10°: Nominal walking grade on Martian regolith
  // Slopes 10° - 16°: Moderate slope fatigue (requires zig-zagging or speed reduction)
  // Slopes 16° - 22°: Severe scree slide & rockfall danger
  // Slopes > 22°: Impassable obstacle threshold (exceeds suit mobility & friction limit)
  let slopePenalty = slopeDeg * 0.4;
  if (slopeDeg > 10) {
    slopePenalty += Math.pow(slopeDeg - 10, 1.8) * 6;
  }
  if (slopeDeg > 16) {
    slopePenalty += Math.pow(slopeDeg - 16, 2.4) * 35;
  }
  if (slopeDeg > 22) {
    slopePenalty += 25000; // Strictly impassable! Forces A* around mountains/crater walls
  }

  // Climbing uphill against gravity costs significantly more metabolic energy
  if (deltaElev > 0) {
    slopePenalty *= 1.3;
  }

  // Explicit elevation pattern optimization (least elevation gain / vertical climb)
  const verticalClimbCost = (deltaElev > 0 ? deltaElev : 0) * wc;

  const avgHazard = (hazard1 + hazard2) / 2;
  const hazardPenalty = avgHazard * 10;

  return (distKm * wd) + (slopePenalty * ws) + (hazardPenalty * wh) + verticalClimbCost;
}
