import React from 'react';
import { 
  Play, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Compass, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  Clock, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets';
import { ROUTE_PROFILES } from '../algorithms/terrainCost';
import { formatDecimalCoords } from '../utils/coordinates';

export default function RoutePlanner({
  startCoord,
  destCoord,
  onSelectStart,
  onSelectDest,
  selectedProfileId,
  onSelectProfile,
  onCalculateRoute,
  isCalculating,
  plannedRoute,
  routeScore,
  onResetRoute
}) {
  const profiles = [
    {
      id: 'safest',
      name: 'Safest Traverse',
      icon: <ShieldCheck className="w-4 h-4 text-ares-success" />,
      desc: 'Skirts steep scarps & sand hazards',
      badge: 'Recommended'
    },
    {
      id: 'shortest',
      name: 'Shortest Distance',
      icon: <Zap className="w-4 h-4 text-ares-warning" />,
      desc: 'Minimizes distance directly',
      badge: 'Fastest'
    },
    {
      id: 'science',
      name: 'Science-Focused',
      icon: <Sparkles className="w-4 h-4 text-ares-cyan" />,
      desc: 'Traverses through key geological targets',
      badge: 'Max Return'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold">
            1. Navigation Waypoints
          </label>
          {plannedRoute && (
            <button
              onClick={onResetRoute}
              className="text-[11px] font-mono text-ares-text-muted hover:text-ares-danger flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-ares-success flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-ares-success animate-pulse" />
              START (EVA BASE)
            </span>
            <span className="text-[10px] font-mono text-ares-text-muted">
              {startCoord ? formatDecimalCoords(startCoord[0], startCoord[1]) : 'Select point'}
            </span>
          </div>
          <select
            value={
              SCIENTIFIC_TARGETS.find(
                (t) =>
                  startCoord &&
                  Math.abs(t.coordinates[0] - startCoord[0]) < 0.001 &&
                  Math.abs(t.coordinates[1] - startCoord[1]) < 0.001
              )?.id || ''
            }
            onChange={(e) => {
              const target = SCIENTIFIC_TARGETS.find((t) => t.id === e.target.value);
              if (target) onSelectStart(target.coordinates);
            }}
            className="w-full bg-ares-bg border border-ares-border rounded-md px-2.5 py-1.5 text-xs text-ares-text font-mono focus:outline-none focus:border-ares-accent"
          >
            <option value="">-- Choose Base Location or Click Map --</option>
            {SCIENTIFIC_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.priority.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-ares-accent flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-ares-accent animate-pulse" />
              TARGET (DESTINATION)
            </span>
            <span className="text-[10px] font-mono text-ares-text-muted">
              {destCoord ? formatDecimalCoords(destCoord[0], destCoord[1]) : 'Select point'}
            </span>
          </div>
          <select
            value={
              SCIENTIFIC_TARGETS.find(
                (t) =>
                  destCoord &&
                  Math.abs(t.coordinates[0] - destCoord[0]) < 0.001 &&
                  Math.abs(t.coordinates[1] - destCoord[1]) < 0.001
              )?.id || ''
            }
            onChange={(e) => {
              const target = SCIENTIFIC_TARGETS.find((t) => t.id === e.target.value);
              if (target) onSelectDest(target.coordinates);
            }}
            className="w-full bg-ares-bg border border-ares-border rounded-md px-2.5 py-1.5 text-xs text-ares-text font-mono focus:outline-none focus:border-ares-accent"
          >
            <option value="">-- Choose Scientific Target or Click Map --</option>
            {SCIENTIFIC_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Val: {t.scienceValue})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold">
          2. Optimization Profile
        </label>
        <div className="space-y-1.5">
          {profiles.map((p) => {
            const isSelected = selectedProfileId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`p-2.5 rounded-lg cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-ares-surface-alt border-ares-accent shadow-sm'
                    : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {p.icon}
                    <span className="text-xs font-bold text-ares-text">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ares-bg text-ares-text-muted border border-ares-border">
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] text-ares-text-muted mt-1 leading-snug">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onCalculateRoute}
        disabled={!startCoord || !destCoord || isCalculating}
        className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-panel ${
          !startCoord || !destCoord
            ? 'bg-ares-surface-alt border border-ares-border text-ares-text-muted/60 cursor-not-allowed'
            : isCalculating
            ? 'bg-ares-accent/80 text-ares-bg cursor-wait animate-pulse'
            : 'bg-gradient-to-r from-ares-accent to-ares-accent-soft hover:opacity-95 text-ares-bg shadow-glow-accent cursor-pointer'
        }`}
      >
        <Play className="w-4 h-4 fill-current" />
        <span>{isCalculating ? 'Computing A* Path...' : 'Calculate Optimized Route'}</span>
      </button>

      {plannedRoute && (
        <div className="space-y-3 pt-3 border-t border-ares-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold">
              Route Evaluation
            </span>
            {routeScore && (
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${routeScore.badgeClass}`}>
                Score: {routeScore.score}/100 ({routeScore.grade.split(' ')[0]})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[10px] text-ares-text-muted block">TRAVERSE DISTANCE</span>
              <span className="text-sm font-bold text-ares-text">{plannedRoute.metrics.totalDistanceKm} km</span>
            </div>

            <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[10px] text-ares-text-muted block">EST. EVA DURATION</span>
              <span className="text-sm font-bold text-ares-cyan">{plannedRoute.metrics.estimatedDurationHours} hrs</span>
            </div>

            <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[10px] text-ares-text-muted block">MAX SLOPE GRADE</span>
              <span className={`text-sm font-bold ${plannedRoute.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'}`}>
                {plannedRoute.metrics.maxSlopeDeg}°
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
              <span className="text-[10px] text-ares-text-muted block">HAZARD EXPOSURE</span>
              <span className={`text-sm font-bold ${plannedRoute.metrics.hazardExposurePercent > 20 ? 'text-ares-danger' : 'text-ares-success'}`}>
                {plannedRoute.metrics.hazardExposurePercent}%
              </span>
            </div>
          </div>

          {routeScore && (
            <div className="p-2.5 rounded-lg bg-ares-bg/80 border border-ares-border space-y-1">
              <div className="text-[10px] font-mono text-ares-text-muted font-semibold">
                PLANNING ASSESSMENT
              </div>
              <p className="text-xs text-ares-text leading-snug">
                {routeScore.recommendation}
              </p>
              <div className="text-[9px] font-mono text-ares-text-muted pt-1 border-t border-ares-border/50 truncate">
                {routeScore.formulaText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

