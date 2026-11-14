import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Compass, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  RotateCcw,
  Activity,
  Mountain,
  Navigation,
  CheckCircle,
  BatteryCharging,
  Droplets,
  Wind,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets';
import { ROUTE_PROFILES } from '../algorithms/terrainCost';
import { formatMarsCoords } from '../utils/coordinates';
import { scoreRoute } from '../algorithms/routeScoring';

export default function RoutePlanner({
  startCoord,
  destCoord,
  onSelectStart,
  onSelectDest,
  selectedProfileId,
  onSelectProfile,
  isCalculating,
  plannedRoute,
  allRoutes = {},
  routeScore,
  onResetRoute,
  userPOIs = []
}) {
  const [expandedProfiles, setExpandedProfiles] = useState({ [selectedProfileId]: true });

  // Keep active profile expanded when it changes
  useEffect(() => {
    setExpandedProfiles((prev) => ({ ...prev, [selectedProfileId]: true }));
  }, [selectedProfileId]);

  const toggleExpandProfile = (e, profileId) => {
    e.stopPropagation();
    setExpandedProfiles((prev) => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  const allTargets = [...SCIENTIFIC_TARGETS, ...userPOIs];

  const dropdownTargets = allTargets.filter(
    (t) => t.isUserCreated || t.tier <= 2 || t.category === 'Landing Site' || t.category?.includes('Formation')
  );

  const matchedStartTarget = allTargets.find(
    (t) =>
      startCoord &&
      Math.abs(t.coordinates[0] - startCoord[0]) < 0.001 &&
      Math.abs(t.coordinates[1] - startCoord[1]) < 0.001
  );

  const matchedDestTarget = allTargets.find(
    (t) =>
      destCoord &&
      Math.abs(t.coordinates[0] - destCoord[0]) < 0.001 &&
      Math.abs(t.coordinates[1] - destCoord[1]) < 0.001
  );

  const profiles = [
    {
      id: 'safest',
      name: 'Safest Traverse',
      icon: <ShieldCheck className="w-4 h-4 text-ares-success" />,
      desc: 'Avoids steep slopes, crater scarps, and rough sand traps',
      badge: 'Recommended'
    },
    {
      id: 'shortest',
      name: 'Shortest Distance',
      icon: <Zap className="w-4 h-4 text-ares-warning" />,
      desc: 'Takes the most direct path between waypoints to save time',
      badge: 'Fastest'
    },
    {
      id: 'science',
      name: 'Science-Focused',
      icon: <Sparkles className="w-4 h-4 text-ares-cyan" />,
      desc: 'Directs the path through geological outcrops and sampling sites',
      badge: 'Max Science'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none font-sans">
      {/* 1. Navigation Waypoints Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-ares-accent" />
            <span>1. Mission Waypoints</span>
          </div>
          {plannedRoute && (
            <button
              onClick={onResetRoute}
              className="text-xs font-mono text-ares-text-muted hover:text-ares-danger flex items-center gap-1 transition-colors"
              title="Reset current route plan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Start Point Card */}
        <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Start Point (EVA Base)
            </span>
            <span className="text-[11px] font-mono text-ares-text-muted">
              {startCoord ? formatMarsCoords(startCoord[0], startCoord[1]) : 'Select on map'}
            </span>
          </div>

          <div className="relative">
            <select
              value={matchedStartTarget ? matchedStartTarget.id : startCoord ? 'custom_start' : ''}
              onChange={(e) => {
                if (e.target.value === 'custom_start') return;
                const target = allTargets.find((t) => t.id === e.target.value);
                if (target) onSelectStart(target.coordinates);
              }}
              className="w-full bg-ares-bg border border-ares-border hover:border-ares-accent/50 rounded-xl px-3 py-2 text-xs text-ares-text focus:outline-none focus:border-ares-accent transition-colors truncate"
            >
              <option value="">-- Choose Base Location or Click Map --</option>
              {startCoord && !matchedStartTarget && (
                <option value="custom_start">
                  Selected Map Location ({formatMarsCoords(startCoord[0], startCoord[1])})
                </option>
              )}
              {dropdownTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isUserCreated ? '(Custom Waypoint)' : `(${t.priority?.split(' ')[0] || t.category || 'Target'})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination Target Card */}
        <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ares-accent font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-ares-accent animate-pulse" />
              Destination Target
            </span>
            <span className="text-[11px] font-mono text-ares-text-muted">
              {destCoord ? formatMarsCoords(destCoord[0], destCoord[1]) : 'Select on map'}
            </span>
          </div>

          <div className="relative">
            <select
              value={matchedDestTarget ? matchedDestTarget.id : destCoord ? 'custom_dest' : ''}
              onChange={(e) => {
                if (e.target.value === 'custom_dest') return;
                const target = allTargets.find((t) => t.id === e.target.value);
                if (target) onSelectDest(target.coordinates);
              }}
              className="w-full bg-ares-bg border border-ares-border hover:border-ares-accent/50 rounded-xl px-3 py-2 text-xs text-ares-text focus:outline-none focus:border-ares-accent transition-colors truncate"
            >
              <option value="">-- Choose Scientific Target or Click Map --</option>
              {destCoord && !matchedDestTarget && (
                <option value="custom_dest">
                  Selected Map Location ({formatMarsCoords(destCoord[0], destCoord[1])})
                </option>
              )}
              {dropdownTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category || 'Target'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Route Optimization Options with Integrated Evaluation Dropdowns */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold">
            2. Routing Strategy & Evaluations
          </div>
          {isCalculating && (
            <div className="text-[11px] font-mono text-ares-accent flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-ares-accent" />
              <span>Computing paths...</span>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          {profiles.map((p) => {
            const isSelected = selectedProfileId === p.id;
            const profileRoute = allRoutes[p.id];
            const isExpanded = Boolean(expandedProfiles[p.id]);

            const pScore = profileRoute?.metrics
              ? scoreRoute(profileRoute.metrics, p.id === 'science' ? 95 : 75)
              : null;

            return (
              <div
                key={p.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-ares-surface-alt border-ares-accent shadow-panel ring-1 ring-ares-accent/50'
                    : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/70'
                }`}
              >
                {/* Profile Card Header (Click to Select) */}
                <div
                  onClick={() => onSelectProfile(p.id)}
                  className="p-3 cursor-pointer flex flex-col space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {p.icon}
                      <span className="text-xs font-bold text-ares-text">{p.name}</span>
                      {isSelected && (
                        <span className="text-[9px] font-mono text-ares-accent uppercase font-bold px-1.5 py-0.5 rounded bg-ares-accent/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {pScore && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${pScore.badgeClass}`}>
                          {pScore.score}/100
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleExpandProfile(e, p.id)}
                        className="p-1 rounded-lg text-ares-text-muted hover:text-white hover:bg-ares-bg transition-colors"
                        title={isExpanded ? 'Hide Evaluation' : 'Show Evaluation'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ares-text-muted leading-snug">
                    {p.desc}
                  </p>
                </div>

                {/* Pretty Integrated Evaluation Dropdown */}
                {isExpanded && profileRoute && profileRoute.metrics && (
                  <div className="p-3 bg-ares-bg/85 border-t border-ares-border/60 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-ares-text-muted uppercase tracking-wider text-[10px] font-bold">
                        {p.name} Evaluation
                      </span>
                      {pScore && (
                        <span className="text-[10px] font-mono text-ares-cyan font-semibold">
                          Grade {pScore.grade.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Distance</span>
                        <span className="font-bold text-ares-text font-mono">
                          {profileRoute.metrics.totalDistanceKm} km
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Est. Time</span>
                        <span className="font-bold text-ares-cyan font-mono">
                          {profileRoute.metrics.estimatedDurationHours} h
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Hazard</span>
                        <span className={`font-bold font-mono ${
                          profileRoute.metrics.hazardExposurePercent > 15 ? 'text-ares-danger' : 'text-ares-success'
                        }`}>
                          {profileRoute.metrics.hazardExposurePercent}%
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Max Slope</span>
                        <span className={`font-bold font-mono ${
                          profileRoute.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'
                        }`}>
                          {profileRoute.metrics.maxSlopeDeg}°
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Climb</span>
                        <span className="font-bold text-ares-text font-mono">
                          +{profileRoute.metrics.elevationGainM} m
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Base Datum</span>
                        <span className="font-bold text-ares-cyan font-mono">
                          {profileRoute.metrics.baseElevationM} m
                        </span>
                      </div>
                    </div>

                    {/* Mission Assessment & Root-Cause Diagnosis */}
                    {pScore && (
                      <div className="p-3 rounded-xl bg-ares-surface-alt/60 border border-ares-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ares-text">
                            {pScore.verdictTitle}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${pScore.badgeClass}`}>
                            {pScore.grade}
                          </span>
                        </div>

                        {/* Diagnostic Factor Breakdown */}
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          {pScore.diagnostics?.map((diag, i) => (
                            <div key={i} className="p-1.5 rounded-lg bg-ares-bg/85 border border-ares-border/60 text-[10px] font-mono">
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

                        {/* Actionable Mission Advice */}
                        <div className="text-xs text-ares-text leading-relaxed pt-1 border-t border-ares-border/50">
                          {pScore.recommendation}
                        </div>
                      </div>
                    )}

                    {/* PLSS Consumables Snapshot */}
                    {profileRoute.metrics.plssConsumables && (
                      <div className="p-2.5 rounded-lg bg-ares-surface-alt/60 border border-ares-border space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-ares-cyan uppercase">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Life Support (PLSS)
                          </span>
                          <span className="text-ares-success font-mono font-normal">
                            {profileRoute.metrics.plssConsumables.suitMobilityMargin}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div>
                            <span className="text-[10px] text-ares-text-muted block">Oxygen:</span>
                            <span className="text-ares-text">
                              {profileRoute.metrics.plssConsumables.oxygenLiters} L ({profileRoute.metrics.plssConsumables.oxygenKg} kg)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-ares-text-muted block">Power Draw:</span>
                            <span className="text-ares-warning">
                              {profileRoute.metrics.plssConsumables.batteryWh?.toLocaleString()} Wh
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-ares-text-muted block">Cooling Water:</span>
                            <span className="text-ares-cyan">
                              {profileRoute.metrics.plssConsumables.coolingWaterKg} kg H₂O
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-ares-text-muted block">Safe Return:</span>
                            <span className="text-emerald-400">
                              {profileRoute.metrics.plssConsumables.pointOfSafeReturnKm} km
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
