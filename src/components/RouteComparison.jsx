import React from 'react';
import { 
  GitCompare, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Flame, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { scoreRoute } from '../algorithms/routeScoring';

export default function RouteComparison({
  allRoutes = {},
  activeProfileId,
  onSelectProfile
}) {
  const routeEntries = Object.entries(allRoutes).filter(([_, r]) => r && r.metrics);

  if (routeEntries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none">
        <div className="w-12 h-12 rounded-xl bg-ares-surface-alt border border-ares-border flex items-center justify-center mb-3">
          <GitCompare className="w-6 h-6 text-ares-accent" />
        </div>
        <h3 className="font-semibold text-ares-text text-sm">No Routes Calculated Yet</h3>
        <p className="text-xs mt-1 text-ares-text-muted/80 max-w-xs">
          Select a start base and destination in Route Planner or launch an automated mission to compute and compare multi-objective trajectories.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none">
      <div className="space-y-1 pb-2 border-b border-ares-border">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-4 h-4 text-ares-accent" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-ares-text">
            Multi-Objective Route Comparison
          </h2>
        </div>
        <p className="text-xs text-ares-text-muted">
          Side-by-side trade-off matrix balancing path distance, terrain slope, hazard exposure, and scientific yield.
        </p>
      </div>

      <div className="space-y-3">
        {routeEntries.map(([profileId, route]) => {
          const isActive = profileId === activeProfileId;
          const scoreObj = scoreRoute(
            route.metrics,
            profileId === 'science' ? 95 : 60
          );

          let icon = <ShieldCheck className="w-4 h-4 text-ares-success" />;
          if (profileId === 'shortest') icon = <Zap className="w-4 h-4 text-ares-warning" />;
          if (profileId === 'science') icon = <Sparkles className="w-4 h-4 text-ares-cyan" />;

          return (
            <div
              key={profileId}
              onClick={() => onSelectProfile(profileId)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-ares-surface-alt border-ares-accent shadow-panel ring-1 ring-ares-accent/50'
                  : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {icon}
                  <h3 className="text-xs font-bold text-ares-text uppercase tracking-wide">
                    {route.profileName}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${scoreObj.badgeClass}`}>
                    Score: {scoreObj.score}/100
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-ares-accent" title="Active on map" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono py-2 my-1 border-y border-ares-border/60">
                <div>
                  <span className="text-[10px] text-ares-text-muted block">DISTANCE</span>
                  <span className="font-bold text-ares-text">{route.metrics.totalDistanceKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block">DURATION</span>
                  <span className="font-bold text-ares-cyan">{route.metrics.estimatedDurationHours} h</span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block">HAZARD %</span>
                  <span className={`font-bold ${route.metrics.hazardExposurePercent > 20 ? 'text-ares-danger' : 'text-ares-success'}`}>
                    {route.metrics.hazardExposurePercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block">MAX SLOPE</span>
                  <span className={`font-bold ${route.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'}`}>
                    {route.metrics.maxSlopeDeg}°
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block">ELEV GAIN</span>
                  <span className="font-bold text-ares-text">+{route.metrics.elevationGainM} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block">METABOLIC</span>
                  <span className="font-bold text-ares-warning">{route.metrics.estimatedCaloriesKcal} kcal</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-ares-text-muted flex items-start space-x-1.5">
                <span className="text-ares-accent font-mono shrink-0">►</span>
                <span className="leading-snug">{scoreObj.recommendation}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-ares-bg/80 border border-ares-border text-[10px] font-mono text-ares-text-muted space-y-1">
        <div className="text-ares-accent font-bold uppercase tracking-wider">
          NASA Blueprint Methodological Provenance
        </div>
        <p className="leading-relaxed">
          Planning scores evaluate relative trade-offs using weighted distance ($w_d$), slope grade ($w_s$), and hazard proximity ($w_h$). This tool provides decision support, not certified autonomous astronaut safety certification.
        </p>
      </div>
    </div>
  );
}

