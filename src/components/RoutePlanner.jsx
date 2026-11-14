import React from 'react';
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
  Info
} from 'lucide-react';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets';
import { ROUTE_PROFILES } from '../algorithms/terrainCost';
import { formatMarsCoords } from '../utils/coordinates';

export default function RoutePlanner({
  startCoord,
  destCoord,
  onSelectStart,
  onSelectDest,
  selectedProfileId,
  onSelectProfile,
  isCalculating,
  plannedRoute,
  routeScore,
  onResetRoute,
  userPOIs = []
}) {
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

      {/* 2. Route Optimization Profile Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold">
            2. Optimization Strategy
          </div>
          {isCalculating && (
            <div className="text-[11px] font-mono text-ares-accent flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-ares-accent" />
              <span>Optimizing path...</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {profiles.map((p) => {
            const isSelected = selectedProfileId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-ares-surface-alt border-ares-accent shadow-glow-sm'
                    : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/80 hover:border-ares-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {p.icon}
                    <span className="text-xs font-bold text-ares-text">{p.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isSelected ? 'bg-ares-accent/20 border-ares-accent/50 text-ares-accent font-bold' : 'bg-ares-bg border-ares-border text-ares-text-muted'
                  }`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-xs text-ares-text-muted mt-1 leading-snug">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Route Evaluation & Metrics (Shown when a route is computed) */}
      {plannedRoute && (
        <div className="space-y-3 pt-3 border-t border-ares-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold">
              Traverse Evaluation
            </span>
            {routeScore && (
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${routeScore.badgeClass}`}>
                Score: {routeScore.score}/100 ({routeScore.grade.split(' ')[0]})
              </span>
            )}
          </div>

          {/* Primary Route Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[11px] text-ares-text-muted block font-sans">Total Distance</span>
              <span className="text-base font-bold text-ares-text mt-0.5 block font-mono">
                {plannedRoute.metrics.totalDistanceKm} km
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[11px] text-ares-text-muted block font-sans">Estimated Time</span>
              <span className="text-base font-bold text-ares-cyan mt-0.5 block font-mono">
                {plannedRoute.metrics.estimatedDurationHours} hours
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[11px] text-ares-text-muted block font-sans">Steepest Slope</span>
              <span className={`text-base font-bold mt-0.5 block font-mono ${
                plannedRoute.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'
              }`}>
                {plannedRoute.metrics.maxSlopeDeg}° Grade
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[11px] text-ares-text-muted block font-sans">Hazard Exposure</span>
              <span className={`text-base font-bold mt-0.5 block font-mono ${
                plannedRoute.metrics.hazardExposurePercent > 20 ? 'text-ares-danger' : 'text-ares-success'
              }`}>
                {plannedRoute.metrics.hazardExposurePercent}% Area
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[11px] text-ares-text-muted block font-sans">Elevation Change</span>
              <span className="text-base font-bold text-ares-text mt-0.5 block font-mono">
                +{plannedRoute.metrics.elevationGainM} m climb
              </span>
            </div>

            <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[11px] text-ares-text-muted block font-sans">Starting Elevation</span>
              <span className="text-base font-bold text-ares-cyan mt-0.5 block font-mono">
                {plannedRoute.metrics.baseElevationM} m MOLA
              </span>
            </div>
          </div>

          {/* Mission Safety Assessment */}
          {routeScore && (
            <div className="p-3 rounded-xl bg-ares-surface-alt/50 border border-ares-border space-y-1.5">
              <div className="text-[11px] font-mono text-ares-accent font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Mission Assessment</span>
              </div>
              <p className="text-xs text-ares-text leading-relaxed font-sans">
                {routeScore.recommendation}
              </p>
            </div>
          )}

          {/* Astronaut Life Support (PLSS) Consumables */}
          {plannedRoute.metrics.plssConsumables && (
            <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-ares-text">
                <div className="flex items-center space-x-1.5 text-ares-cyan">
                  <Activity className="w-4 h-4" />
                  <span>Astronaut Life Support Consumables (PLSS)</span>
                </div>
                <span className="text-[11px] font-mono text-ares-success">
                  {plannedRoute.metrics.plssConsumables.suitMobilityMargin}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border">
                  <span className="text-[10px] text-ares-text-muted flex items-center gap-1 font-sans">
                    <Wind className="w-3 h-3 text-ares-cyan" />
                    Oxygen Required
                  </span>
                  <span className="font-bold text-ares-text mt-0.5 block font-mono">
                    {plannedRoute.metrics.plssConsumables.oxygenLiters} L ({plannedRoute.metrics.plssConsumables.oxygenKg} kg)
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border">
                  <span className="text-[10px] text-ares-text-muted flex items-center gap-1 font-sans">
                    <Droplets className="w-3 h-3 text-ares-cyan" />
                    Cooling Water
                  </span>
                  <span className="font-bold text-ares-cyan mt-0.5 block font-mono">
                    {plannedRoute.metrics.plssConsumables.coolingWaterKg} kg H₂O
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border">
                  <span className="text-[10px] text-ares-text-muted flex items-center gap-1 font-sans">
                    <BatteryCharging className="w-3 h-3 text-ares-warning" />
                    Battery Power
                  </span>
                  <span className="font-bold text-ares-warning mt-0.5 block font-mono">
                    {plannedRoute.metrics.plssConsumables.batteryWh?.toLocaleString()} Wh
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border">
                  <span className="text-[10px] text-ares-text-muted flex items-center gap-1 font-sans">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Point of Safe Return
                  </span>
                  <span className="font-bold text-emerald-400 mt-0.5 block font-mono">
                    {plannedRoute.metrics.plssConsumables.pointOfSafeReturnKm} km from base
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
