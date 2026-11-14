// Cost formula: C = w_d * D + w_s * S + w_h * H

export const ROUTE_PROFILES = {
  SHORTEST: {
    id: 'shortest',
    name: 'Shortest Distance',
    weights: { distance: 1.0, slope: 0.05, hazard: 1.0 },
    description: 'Direct trajectory minimizing total distance traversed. Accepts steeper inclines and higher obstacle exposure.'
  },
  SAFEST: {
    id: 'safest',
    name: 'Safest & Low Risk',
    weights: { distance: 0.8, slope: 0.4, hazard: 14.0 },
    description: 'Prioritizes astronaut safety: strictly skirts steep escarpments and high-risk sand dunes.'
  },
  SCIENCE: {
    id: 'science',
    name: 'Science-Focused Traverse',
    weights: { distance: 1.0, slope: 0.15, hazard: 4.0 },
    description: 'Balances terrain safety with proximity to high-value geological formations and mineral contacts.'
  }
};

export function calculateEdgeCost(distKm, elev1, elev2, hazard1, hazard2, profile = ROUTE_PROFILES.SAFEST) {
  const { distance: wd, slope: ws, hazard: wh } = profile.weights;

  const distMeters = distKm * 1000;
  const deltaElev = elev2 - elev1;
  const absDeltaElev = Math.abs(deltaElev);
  const slopeDeg = (Math.atan(absDeltaElev / Math.max(1, distMeters)) * 180) / Math.PI;

  let slopePenalty = slopeDeg * 0.1;
  if (slopeDeg > 14) {
    slopePenalty += (slopeDeg - 14) * 0.6;
  }
  if (slopeDeg > 22) {
    slopePenalty += 40;
  }

  if (deltaElev > 0) {
    slopePenalty *= 1.2;
  }

  const avgHazard = (hazard1 + hazard2) / 2;
  const hazardPenalty = avgHazard * 10;

  return (distKm * wd) + (slopePenalty * ws) + (hazardPenalty * wh);
}
