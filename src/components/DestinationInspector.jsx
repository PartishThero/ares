import React from 'react';
import { 
  MapPin, 
  Mountain, 
  Layers, 
  Thermometer, 
  AlertTriangle, 
  Navigation, 
  ExternalLink, 
  Plus, 
  Crosshair,
  Wind,
  Activity,
  Check,
  ArrowRight
} from 'lucide-react';

export default function DestinationInspector({
  inspectionData,
  onSetAsStart,
  onSetAsDest,
  onCenterMap,
  onSelectPOI,
  onOpenAddPOI,
  onPlanUnchartedTraverse,
  startCoord = null,
  destCoord = null,
  onSwitchToPlanner = null
}) {
  if (!inspectionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none font-sans">
        <div className="w-14 h-14 rounded-2xl bg-ares-surface-alt/80 border border-ares-border flex items-center justify-center mb-4 shadow-panel">
          <Crosshair className="w-7 h-7 text-ares-accent animate-pulse" />
        </div>
        <h3 className="font-bold text-ares-text text-sm uppercase tracking-wider font-mono">
          Tactical Inspector Active
        </h3>
        <p className="text-xs mt-2 text-ares-text-muted leading-relaxed max-w-xs font-mono">
          Click anywhere on the Martian terrain or select any scientific site to inspect localized regional telemetry.
        </p>
      </div>
    );
  }

  const { 
    coordinates, 
    formattedCoords, 
    elevationMeters, 
    geology, 
    hazard, 
    thermal, 
    nearestPOI, 
    atmosphericPressurePa,
    historicalRadiation 
  } = inspectionData;

  const isCurrentStart = startCoord && 
    Math.abs(startCoord[0] - coordinates[0]) < 0.001 && 
    Math.abs(startCoord[1] - coordinates[1]) < 0.001;

  const isCurrentDest = destCoord && 
    Math.abs(destCoord[0] - coordinates[0]) < 0.001 && 
    Math.abs(destCoord[1] - coordinates[1]) < 0.001;

  const bothWaypointsSet = Boolean(startCoord && destCoord);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none font-mono">
      {/* 1. Traverse Waypoint Assignment Card */}
      <div className="p-3.5 rounded-2xl bg-ares-surface-alt/70 border border-ares-border space-y-3 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-ares-text">
            <span className="flex h-2 w-2 rounded-full bg-ares-accent" />
            <span className="font-bold font-mono text-sm tracking-tight">{formattedCoords}</span>
          </div>

          <button
            onClick={() => onCenterMap(coordinates)}
            className="text-[10px] font-mono text-ares-text-muted hover:text-ares-accent transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg border border-ares-border bg-ares-bg/50 hover:bg-ares-surface-alt"
            title="Center map on this sector"
          >
            <span>Center</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Guided Context Prompt */}
        <div className="p-2.5 rounded-xl bg-ares-bg/90 border border-ares-border/80 text-[11px] leading-relaxed">
          {isCurrentStart ? (
            <div className="text-ares-text flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span><strong>Configured as Start (EVA Base).</strong> Click map to choose Target.</span>
            </div>
          ) : isCurrentDest ? (
            <div className="text-ares-text flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-ares-neon shrink-0" />
              <span><strong>Configured as Destination Target.</strong> Click map to set EVA Base.</span>
            </div>
          ) : bothWaypointsSet ? (
            <div className="text-ares-text flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-ares-accent shrink-0" />
              <span><strong>Both waypoints set.</strong> Ready to formulate traverse corridor.</span>
            </div>
          ) : (
            <div className="text-ares-text-muted flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-ares-accent shrink-0" />
              <span>Assign sector as mission <strong>Start Base</strong> or <strong>Destination Target</strong>.</span>
            </div>
          )}
        </div>

        {/* Start / Target Action Pills */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSetAsStart(coordinates)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              isCurrentStart
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-glow-success'
                : 'bg-ares-bg/60 hover:bg-ares-surface-alt border-ares-border text-ares-text-muted hover:text-ares-text'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isCurrentStart ? 'text-emerald-400' : 'text-ares-text-muted'}`} />
            <span>{isCurrentStart ? '✓ Start Set' : 'Set As Start'}</span>
          </button>

          <button
            onClick={() => onSetAsDest(coordinates)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              isCurrentDest
                ? 'bg-ares-accent/20 border-ares-accent text-[#ff9d66] shadow-glow-accent'
                : 'bg-ares-bg/60 hover:bg-ares-surface-alt border-ares-border text-ares-text-muted hover:text-ares-text'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isCurrentDest ? 'text-ares-neon' : 'text-ares-text-muted'}`} />
            <span>{isCurrentDest ? '✓ Target Set' : 'Set As Target'}</span>
          </button>
        </div>

        {/* Primary Route Execution CTA */}
        {bothWaypointsSet && onSwitchToPlanner && (
          <button
            onClick={onSwitchToPlanner}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-ares-accent to-ares-neon text-ares-bg font-extrabold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-glow-accent cursor-pointer hover:opacity-95 active:scale-[0.99]"
          >
            <Navigation className="w-4 h-4" />
            <span>Start Plan • View Route</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. In-Situ Regional Telemetry Dashboard (Monochrome Details) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/50">
          <span className="font-bold flex items-center gap-1.5 text-white/70">
            <Activity className="w-3.5 h-3.5 text-white/60" />
            In-Situ Regional Telemetry
          </span>
          <span className="text-[9px] text-white/40 font-mono">MOLA · THEMIS · MSL RAD</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Elevation */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase text-white/70">
              <span className="flex items-center gap-1 font-semibold">
                <Mountain className="w-3.5 h-3.5 text-white/60" />
                Elevation
              </span>
              <span className="text-[9px] font-mono text-white/40">MOLA</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {elevationMeters.toLocaleString()} m
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              {elevationMeters < 0 
                ? `${(Math.abs(elevationMeters) / 1000).toFixed(1)} km below datum` 
                : `+${(elevationMeters / 1000).toFixed(1)} km above datum`}
            </div>
          </div>

          {/* Hazard Index */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase text-white/70">
              <span className="flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-white/60" />
                Hazard Index
              </span>
              <span className="text-[9px] font-mono text-white/40">{hazard.level}</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {(hazard.factor * 100).toFixed(0)}% Risk
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              {hazard.activeZone ? hazard.activeZone.name : 'Nominal bedrock corridor'}
            </div>
          </div>

          {/* Thermal Range */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase text-white/70">
              <span className="flex items-center gap-1 font-semibold">
                <Thermometer className="w-3.5 h-3.5 text-white/60" />
                Thermal Range
              </span>
              <span className="text-[9px] font-mono text-white/40">THEMIS</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {thermal.daytimeTempC}° / {thermal.nighttimeTempC}°C
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              Inertia: {thermal.thermalInertiaSI?.split(' ')[0]} SI
            </div>
          </div>

          {/* Atmospheric Pressure */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase text-white/70">
              <span className="flex items-center gap-1 font-semibold">
                <Wind className="w-3.5 h-3.5 text-white/60" />
                Atmosphere
              </span>
              <span className="text-[9px] font-mono text-white/40">REMS</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {atmosphericPressurePa} Pa
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              {((atmosphericPressurePa / 101325) * 100).toFixed(2)}% Earth standard
            </div>
          </div>

          {/* Radiation Dosimetry */}
          <div className="col-span-2 p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase text-white/70">
              <span className="flex items-center gap-1 font-semibold">
                <Activity className="w-3.5 h-3.5 text-white/60" />
                Radiation
              </span>
              <span className="text-[9px] font-mono text-white/40">MSL RAD</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {historicalRadiation?.doseRateMicroSvPerHour || 24.6} µSv/h
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              Environment: {historicalRadiation?.riskLevel || 'Nominal background baseline'}
            </div>
          </div>

          {/* Stratigraphic Formation */}
          <div className="col-span-2 p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase text-white/70">
              <span className="flex items-center gap-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-white/60" />
                Stratigraphy
              </span>
              <span className="text-[9px] font-mono text-white/40">{geology.era || 'Hesperian'}</span>
            </div>
            <div className="text-xs font-bold text-white font-mono mt-1 leading-snug">
              {geology.unit || 'Highland Consolidated Bedrock'}
            </div>
            <div className="text-[10px] text-white/50 mt-1 font-mono">
              Stability: {geology.stability} • Roughness: {geology.roughness}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Nearest Scientific Target */}
      {nearestPOI?.target && (
        <div 
          onClick={() => onSelectPOI && onSelectPOI(nearestPOI.target)}
          className="p-3 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-ares-accent/60 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
          title="Click to select this nearest scientific target"
        >
          <div className="truncate pr-2">
            <span className="telemetry-label block mb-0.5">
              Nearest Scientific Target
            </span>
            <div className="text-xs font-bold text-ares-text truncate font-sans group-hover:text-ares-accent transition-colors">
              {nearestPOI.target.name}
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold text-ares-text-muted group-hover:text-ares-accent shrink-0 bg-ares-bg px-2.5 py-1 rounded-lg border border-ares-border">
            {nearestPOI.distanceKm < 0.1 ? 'At site' : `${nearestPOI.distanceKm} km`}
          </div>
        </div>
      )}

      {/* 4. In-Situ Field Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onOpenAddPOI && onOpenAddPOI(coordinates)}
          className="px-3 py-2 rounded-xl bg-ares-bg/70 hover:bg-ares-surface-alt border border-ares-border hover:border-ares-accent/60 text-xs font-semibold font-mono text-ares-text transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-ares-accent" />
          <span>Log Waypoint</span>
        </button>

        <button
          onClick={() => onPlanUnchartedTraverse && onPlanUnchartedTraverse(coordinates)}
          className="px-3 py-2 rounded-xl bg-ares-bg/70 hover:bg-ares-surface-alt border border-ares-border hover:border-ares-accent/60 text-xs font-semibold font-mono text-ares-text transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5 text-ares-accent" />
          <span>Plan Traverse</span>
        </button>
      </div>
    </div>
  );
}
