// Relative planning score formula: Score = 100 - (a*R + b*T + c*D) + ScienceBonus

export function scoreRoute(metrics, scienceValueCollected = 0) {
  const { totalDistanceKm, avgSlopeDeg, maxSlopeDeg, hazardExposurePercent } = metrics;

  const a = 0.45;
  const b = 2.2;
  const c = 1.1;

  const hazardPenalty = a * hazardExposurePercent;
  const terrainPenalty = b * (avgSlopeDeg + (maxSlopeDeg * 0.4));
  const distancePenalty = c * totalDistanceKm;

  const totalDeductions = hazardPenalty + terrainPenalty + distancePenalty;
  const rawScore = 100 - totalDeductions;

  const baseScore = Math.max(10, Math.min(95, Math.round(rawScore)));
  const scienceBonus = Math.min(15, Math.round((scienceValueCollected / 100) * 15));
  const finalCompositeScore = Math.min(99, baseScore + scienceBonus);

  let grade = 'A';
  let badgeClass = 'text-ares-success border-ares-success/40 bg-ares-success/10';
  let recommendation = 'Optimal balance for EVA traversal';

  if (finalCompositeScore >= 85) {
    grade = 'A (Optimal)';
    badgeClass = 'text-ares-success border-ares-success/40 bg-ares-success/10';
    recommendation = 'Strongly recommended: Low hazard exposure with manageable terrain grades.';
  } else if (finalCompositeScore >= 70) {
    grade = 'B (Acceptable)';
    badgeClass = 'text-ares-warning border-ares-warning/40 bg-ares-warning/10';
    recommendation = 'Viable route: Involves moderate slopes or minor obstacle proximity. Monitor crew fatigue.';
  } else if (finalCompositeScore >= 50) {
    grade = 'C (Challenging)';
    badgeClass = 'text-ares-accent border-ares-accent/40 bg-ares-accent/10';
    recommendation = 'Caution: Significant elevation changes or higher hazard proximity. Rest stops mandatory.';
  } else {
    grade = 'D (High Risk)';
    badgeClass = 'text-ares-danger border-ares-danger/40 bg-ares-danger/10';
    recommendation = 'High risk: Exceeds standard safety thresholds. Consider alternative bypass route.';
  }

  return {
    score: finalCompositeScore,
    baseScore,
    scienceBonus,
    grade,
    badgeClass,
    recommendation,
    breakdown: {
      hazardDeduction: Number(hazardPenalty.toFixed(1)),
      terrainDeduction: Number(terrainPenalty.toFixed(1)),
      distanceDeduction: Number(distancePenalty.toFixed(1)),
      totalDeductions: Number(totalDeductions.toFixed(1))
    },
    formulaText: `Score = 100 - (${a} × ${hazardExposurePercent}% Hazard + ${b} × ${avgSlopeDeg}° Slope + ${c} × ${totalDistanceKm}km Dist) + ${scienceBonus} Science Bonus`
  };
}
