import React from 'react';
import { 
  GitCompare, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Award,
  Clock,
  Navigation,
  CheckCircle2,
  Info
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
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none font-sans">
        <div className="w-14 h-14 rounded-2xl bg-ares-surface-alt/80 border border-ares-border flex items-center justify-center mb-4 shadow-panel">
          <GitCompare className="w-7 h-7 text-ares-accent animate-pulse" />
        </div>
        <h3 className="font-bold text-ares-text text-sm uppercase tracking-wider font-mono">
          No Route Trajectories Computed
        </h3>
        <p className="text-xs mt-2 text-ares-text-muted leading-relaxed max-w-xs font-mono">
          Select a start base and destination target in Route Planner or launch an automated expedition to view the side-by-side comparison matrix.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3.5 select-none font-sans">
      {/* 1. Header Card (Matching Design Capsule) */}
      <div className="p-3.5 rounded-2xl bg-ares-surface-alt/70 border border-ares-border space-y-1.5 shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-ares-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <GitCompare className="w-3.5 h-3.5" />
            Traverse Trade-Off Matrix
          </span>
          <span className="text-[10px] font-mono text-ares-text-muted">
            {routeEntries.length} Profiles Evaluated
          </span>
        </div>

        <h2 className="text-sm font-bold text-ares-text leading-tight">
          Multi-Objective Route Comparison
        </h2>

        <p className="text-[11px] text-ares-text-muted leading-relaxed">
          Detailed safety breakdown and trade-off analysis balancing distance, slope traction, hazard exposure, and life support.
        </p>
      </div>

      {/* 2. Side-by-Side Route Cards with Root-Cause Diagnostics */}
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
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                isActive
                  ? 'bg-ares-surface-alt border-ares-accent shadow-panel ring-1 ring-ares-accent/50'
                  : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {icon}
                  <h3 className="text-xs font-bold text-ares-text uppercase tracking-wide font-sans">
                    {route.profileName}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${scoreObj.badgeClass}`}>
                    Score: {scoreObj.score}/100 ({scoreObj.letterGrade})
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-ares-accent" title="Active on map" />
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs py-2 my-1 border-y border-ares-border/60 font-mono">
                <div>
                  <span className="text-[10px] text-ares-text-muted block font-sans">Distance</span>
                  <span className="font-bold text-ares-text">{route.metrics.totalDistanceKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block font-sans">Duration</span>
                  <span className="font-bold text-ares-cyan">{route.metrics.estimatedDurationHours} h</span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block font-sans">Hazard</span>
                  <span className={`font-bold ${route.metrics.hazardExposurePercent > 20 ? 'text-ares-danger' : 'text-ares-success'}`}>
                    {route.metrics.hazardExposurePercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block font-sans">Max Slope</span>
                  <span className={`font-bold ${route.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'}`}>
                    {route.metrics.maxSlopeDeg}°
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block font-sans">Climb</span>
                  <span className="font-bold text-ares-text">+{route.metrics.elevationGainM} m</span>
                </div>
                <div>
                  <span className="text-[10px] text-ares-text-muted block font-sans">Metabolic</span>
                  <span className="font-bold text-ares-warning">{route.metrics.estimatedCaloriesKcal || 2500} kcal</span>
                </div>
              </div>

              {/* Specific Root-Cause Diagnosis & Actionable Guidance */}
              <div className="p-3 rounded-xl bg-ares-bg/85 border border-ares-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ares-text">
                    {scoreObj.verdictTitle}
                  </span>
                  <span className="text-[10px] font-mono text-ares-text-muted">
                    {scoreObj.grade}
                  </span>
                </div>

                {/* Diagnostic Factors: Explicitly tells user what passed and what failed */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {scoreObj.diagnostics?.map((diag, i) => (
                    <div key={i} className="p-1.5 rounded-lg bg-ares-surface-alt/60 border border-ares-border/50 text-[10px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-ares-text-muted">{diag.factor}:</span>
                        <span className={`font-bold ${
                          diag.status === 'optimal' ? 'text-emerald-400' :
                          diag.status === 'viable' ? 'text-ares-cyan' :
                          diag.status === 'warning' || diag.status === 'moderate' ? 'text-amber-400' :
                          'text-rose-400'
                        }`}>
                          {diag.value}
                        </span>
                      </div>
                      <div className="text-[9px] text-ares-text-muted truncate mt-0.5" title={diag.explanation}>
                        {diag.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constructive Actionable Advisory */}
                <div className="text-xs text-ares-text leading-relaxed font-sans pt-1 border-t border-ares-border/50">
                  {scoreObj.recommendation}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Methodology Provenance Box */}
      <div className="p-3 rounded-2xl bg-ares-surface-alt/40 border border-ares-border text-[11px] text-ares-text-muted space-y-1">
        <div className="text-ares-accent font-bold uppercase tracking-wider text-[10px] font-mono flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>NASA Blueprint Methodological Provenance</span>
        </div>
        <p className="leading-relaxed font-sans">
          Planning scores evaluate relative trade-offs across distance, slope traction, hazard exposure, and consumables windows. Provides actionable decision support for planetary traverse routing.
        </p>
      </div>
    </div>
  );
}
