/**
 * Advanced Multi-Factor Martian Traverse Scoring & Diagnostics Engine
 * Evaluates path distance, slope incline, sand hazards, and life support limits,
 * producing specific, constructive advisories rather than generic warnings.
 */
export function scoreRoute(metrics = {}, scienceValueCollected = 0) {
  const {
    totalDistanceKm = 0,
    estimatedDurationHours = 0,
    avgSlopeDeg = 0,
    maxSlopeDeg = 0,
    hazardExposurePercent = 0,
    elevationGainM = 0
  } = metrics;

  // 1. Distance & Endurance Evaluation
  let distancePenalty = 0;
  let distanceStatus = 'optimal';
  let distanceNote = '';

  if (totalDistanceKm <= 20) {
    distancePenalty = 0;
    distanceStatus = 'optimal';
    distanceNote = `${totalDistanceKm} km is well within standard single-sortie EVA range (≤ 25 km).`;
  } else if (totalDistanceKm <= 50) {
    distancePenalty = (totalDistanceKm - 20) * 0.8;
    distanceStatus = 'viable';
    distanceNote = `${totalDistanceKm} km is an extended regional traverse; nominal for unpressurized rovers.`;
  } else if (totalDistanceKm <= 120) {
    distancePenalty = 24 + (totalDistanceKm - 50) * 0.45;
    distanceStatus = 'challenging';
    distanceNote = `${totalDistanceKm} km requires pressurized rover life support or multi-hour battery top-ups.`;
  } else {
    // Extreme distance (> 120 km)
    distancePenalty = 55 + Math.min(25, Math.log10(totalDistanceKm / 120) * 20);
    distanceStatus = 'critical';
    distanceNote = `${totalDistanceKm.toLocaleString()} km is an expedition-scale transit exceeding single-sortie EVA limits by ${(totalDistanceKm / 25).toFixed(0)}x.`;
  }

  // 2. Slope & Traction Evaluation
  let slopePenalty = 0;
  let slopeStatus = 'optimal';
  let slopeNote = '';

  if (maxSlopeDeg <= 8) {
    slopePenalty = 0;
    slopeStatus = 'optimal';
    slopeNote = `Max slope of ${maxSlopeDeg}° is flat and stable for all rover wheel assemblies.`;
  } else if (maxSlopeDeg <= 14) {
    slopePenalty = (maxSlopeDeg - 8) * 2.2;
    slopeStatus = 'moderate';
    slopeNote = `Max slope of ${maxSlopeDeg}° involves moderate crater rims; requires low-gear switchbacks.`;
  } else if (maxSlopeDeg <= 18) {
    slopePenalty = 13 + (maxSlopeDeg - 14) * 4.0;
    slopeStatus = 'warning';
    slopeNote = `Steep incline of ${maxSlopeDeg}° approaches rover wheel-slip limit (18°). Risk of traction loss.`;
  } else {
    slopePenalty = 30 + Math.min(20, (maxSlopeDeg - 18) * 5.0);
    slopeStatus = 'critical';
    slopeNote = `Critical scarp grade of ${maxSlopeDeg}° exceeds vehicle static tip-over threshold.`;
  }

  // 3. Sand Trap & Regolith Hazard Evaluation
  let hazardPenalty = 0;
  let hazardStatus = 'optimal';
  let hazardNote = '';

  if (hazardExposurePercent === 0) {
    hazardPenalty = 0;
    hazardStatus = 'optimal';
    hazardNote = `0% hazard exposure; entire corridor traverses firm, consolidated bedrock.`;
  } else if (hazardExposurePercent <= 10) {
    hazardPenalty = hazardExposurePercent * 1.5;
    hazardStatus = 'moderate';
    hazardNote = `${hazardExposurePercent}% path brushes drift sand ripples; proceed with low wheel speed.`;
  } else if (hazardExposurePercent <= 25) {
    hazardPenalty = 15 + (hazardExposurePercent - 10) * 1.8;
    hazardStatus = 'warning';
    hazardNote = `${hazardExposurePercent}% of traverse cuts through active dune fields. Wheel sinkage risk.`;
  } else {
    hazardPenalty = 42 + (hazardExposurePercent - 25) * 1.2;
    hazardStatus = 'critical';
    hazardNote = `Heavy hazard exposure (${hazardExposurePercent}%) through deep dune fields; high entrapment danger.`;
  }

  // 4. Life Support & Duration Evaluation
  let durationNote = '';
  let durationStatus = 'optimal';
  if (estimatedDurationHours <= 8) {
    durationNote = `Estimated ${estimatedDurationHours} hrs fits within standard 8-hour PLSS suit consumables.`;
    durationStatus = 'optimal';
  } else if (estimatedDurationHours <= 16) {
    durationNote = `Estimated ${estimatedDurationHours} hrs exceeds single-EVA suit limits (8h); requires vehicle cabin life support.`;
    durationStatus = 'warning';
  } else {
    const sols = (estimatedDurationHours / 24.6).toFixed(1);
    durationNote = `Duration (${estimatedDurationHours} hrs / ~${sols} Sols) requires multi-sol expedition logistics and overnight shelter.`;
    durationStatus = 'critical';
  }

  // Calculate composite score
  const totalDeductions = distancePenalty + slopePenalty + hazardPenalty;
  const rawScore = 100 - totalDeductions;
  const baseScore = Math.max(12, Math.min(95, Math.round(rawScore)));
  const scienceBonus = Math.min(15, Math.round((scienceValueCollected / 100) * 15));
  const finalScore = Math.min(99, Math.max(10, baseScore + scienceBonus));

  // Determine Grade & Badge
  let grade = 'A';
  let gradeLabel = 'Optimal';
  let badgeClass = 'text-ares-success border-ares-success/40 bg-ares-success/10';

  if (finalScore >= 85) {
    grade = 'A';
    gradeLabel = 'Optimal';
    badgeClass = 'text-ares-success border-ares-success/40 bg-ares-success/10';
  } else if (finalScore >= 70) {
    grade = 'B';
    gradeLabel = 'Acceptable';
    badgeClass = 'text-ares-cyan border-ares-cyan/40 bg-ares-cyan/10';
  } else if (finalScore >= 50) {
    grade = 'C';
    gradeLabel = 'Challenging';
    badgeClass = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  } else {
    grade = 'D';
    gradeLabel = 'High Risk';
    badgeClass = 'text-ares-danger border-ares-danger/40 bg-ares-danger/10';
  }

  // Specific, constructive diagnosis headline & advice
  let verdictTitle = '';
  let actionableAdvice = '';

  const criticalIssues = [];
  if (distanceStatus === 'critical') criticalIssues.push('extreme transit distance');
  if (slopeStatus === 'critical' || slopeStatus === 'warning') criticalIssues.push('steep slope grades');
  if (hazardStatus === 'critical' || hazardStatus === 'warning') criticalIssues.push('sand trap hazards');
  if (durationStatus === 'critical') criticalIssues.push('multi-sol duration');

  if (criticalIssues.length === 0) {
    verdictTitle = 'Optimal & Safe Traverse Corridor';
    actionableAdvice = 'Low slope angles, zero sand trap exposure, and manageable distance make this route ideal for nominal exploration.';
  } else if (distanceStatus === 'critical') {
    const solsEst = (estimatedDurationHours / 24.6).toFixed(0);
    verdictTitle = `Expedition Transit: ${totalDistanceKm.toLocaleString()} km Multi-Sol Range`;
    actionableAdvice = `This route is ${totalDistanceKm.toLocaleString()} km across Martian terrain. The ${maxSlopeDeg}° slope is flat and hazard exposure is low (${hazardExposurePercent}%), but the ~${solsEst}-Sol duration cannot be undertaken as a single continuous sortie. To execute safely, break this journey into 25–40 km waypoint legs with intermediate resupply camps, or deploy a pressurized rover convoy.`;
  } else if (slopeStatus === 'critical' || slopeStatus === 'warning') {
    verdictTitle = `Steep Incline Alert: ${maxSlopeDeg}° Grade Incline`;
    actionableAdvice = `The path crosses an incline of ${maxSlopeDeg}°, which risks wheel slip and excessive motor thermal load. Switch to the 'Safest Traverse' profile to route around the rim, or place a waypoint through an adjacent saddle pass.`;
  } else if (hazardStatus === 'critical' || hazardStatus === 'warning') {
    verdictTitle = `Sand Trap Hazard: ${hazardExposurePercent}% Loose Regolith`;
    actionableAdvice = `Approximately ${hazardExposurePercent}% of the corridor traverses active ripple dunes with wheel sinkage risk. To avoid entrapment, bias pathfinding toward consolidated bedrock corridors using the 'Safest Traverse' strategy.`;
  } else {
    verdictTitle = 'Extended Traverse: Monitor Crew & Battery Margins';
    actionableAdvice = 'Route is viable but demands heightened power and fatigue monitoring. Ensure all battery reserves and suit sublimator margins are verified prior to departure.';
  }

  const diagnostics = [
    {
      factor: 'Distance & Range',
      status: distanceStatus,
      value: `${totalDistanceKm} km`,
      explanation: distanceNote
    },
    {
      factor: 'Slope & Traction',
      status: slopeStatus,
      value: `${maxSlopeDeg}° max`,
      explanation: slopeNote
    },
    {
      factor: 'Hazard Avoidance',
      status: hazardStatus,
      value: `${hazardExposurePercent}% hazard`,
      explanation: hazardNote
    },
    {
      factor: 'Consumables Window',
      status: durationStatus,
      value: `${estimatedDurationHours} hrs`,
      explanation: durationNote
    }
  ];

  return {
    score: finalScore,
    grade: `${grade} (${gradeLabel})`,
    letterGrade: grade,
    badgeClass,
    verdictTitle,
    recommendation: actionableAdvice,
    diagnostics,
    breakdown: {
      distancePenalty: Number(distancePenalty.toFixed(1)),
      slopePenalty: Number(slopePenalty.toFixed(1)),
      hazardPenalty: Number(hazardPenalty.toFixed(1)),
      scienceBonus
    }
  };
}
