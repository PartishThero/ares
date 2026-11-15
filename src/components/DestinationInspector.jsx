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
  Trash2, 
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
  onDeleteUserPOI,
  onPlanUnchartedTraverse,
  startCoord = null,
  destCoord = null,
  routePrompt = null,
  onClearRoutePrompt = null,
  onSwitchToPlanner = null
}) {
  if (!inspectionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none font-sans">
        <div className="w-14 h-14 rounded-2xl bg-ares-surface-alt/80 border border-ares-border flex items-center justify-center mb-4 shadow-panel">
          <Crosshair className="w-7 h-7 text-white/70 animate-pulse" />
        </div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono">
          Tactical Inspector Active
        </h3>
        <p className="text-xs mt-2 text-white/60 leading-relaxed max-w-xs font-mono">
          Aim cursor active on map. Click anywhere on the Martian terrain or select any scientific site to inspect localized regional telemetry.
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
    <div className="h-full overflow-y-auto p-4 space-y-3.5 select-none font-mono">
      {/* 1. Traverse Waypoint Assignment (At the Top) */}
      <div className="p-3.5 rounded-2xl bg-ares-surface-alt/70 border border-ares-border space-y-2.5 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-white">
            <MapPin className="w-3.5 h-3.5 text-ares-accent shrink-0" />
            <span className="font-bold font-mono">{formattedCoords}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onCenterMap(coordinates)}
              className="text-[10px] font-mono text-white/60 hover:text-white transition-colors flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/10 hover:border-white/30"
              title="Center map on this sector"
            >
              <span>Center</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Guided Context Prompt */}
        <div className="p-2.5 rounded-xl bg-[#12141a]/90 border border-white/10 text-[11px] leading-relaxed">
          {isCurrentStart ? (
            <div className="text-white/90 flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Configured as Start (EVA Base).</strong> Click on the map to set your Destination Target.</span>
            </div>
          ) : isCurrentDest ? (
            <div className="text-white/90 flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#ff7a30] shrink-0 mt-0.5" />
              <span><strong>Configured as Destination Target.</strong> Click on the map to set your EVA Base / Start location.</span>
            </div>
          ) : bothWaypointsSet ? (
            <div className="text-white/90 flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#ff7a30] shrink-0 mt-0.5" />
              <span><strong>Both waypoints set.</strong> Click "Start Plan" below to view the computed route corridor.</span>
            </div>
          ) : (
            <div className="text-white/60 flex items-start gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
              <span>Assign this location as your mission <strong>Start (EVA Base)</strong> or <strong>Destination Target</strong>.</span>
            </div>
          )}
        </div>

        {/* Start / Target CTA Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSetAsStart(coordinates)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              isCurrentStart
                ? 'bg-white text-black border-white shadow-sm'
                : 'bg-ares-surface-alt/60 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isCurrentStart ? 'text-black' : 'text-white/70'}`} />
            <span>{isCurrentStart ? '✓ Start Set' : 'Set As Start'}</span>
          </button>

          <button
            onClick={() => onSetAsDest(coordinates)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              isCurrentDest
                ? 'bg-[#ff7a30] text-black border-[#ff7a30] shadow-sm font-extrabold'
                : 'bg-ares-surface-alt/60 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isCurrentDest ? 'text-black' : 'text-white/70'}`} />
            <span>{isCurrentDest ? '✓ Target Set' : 'Set As Target'}</span>
          </button>
        </div>

        {/* Normal Button: Start Plan (replaces slide-to-unlock, stays until clicked) */}
        {bothWaypointsSet && onSwitchToPlanner && (
          <button
            onClick={onSwitchToPlanner}
            className="w-full py-2.5 px-4 rounded-xl bg-[#ff7a30] hover:bg-[#ff8c4a] text-black font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-glow-accent cursor-pointer active:scale-[0.99] mt-1"
          >
            <Navigation className="w-4 h-4 text-black" />
            <span>Start Plan • View Route</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        )}
      </div>

      {/* 2. In-Situ Regional Telemetry (Middle - Monotonous & Readable) */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-white/50 font-bold flex items-center justify-between">
          <span>In-Situ Regional Telemetry</span>
          <span className="text-[9px] text-white/40 font-mono">MOLA / THEMIS / MSL RAD</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Elevation */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[10px] text-white/70 uppercase">
              <span className="flex items-center gap-1 font-semibold">
                <Mountain className="w-3.5 h-3.5 text-white/80" />
                Elevation
              </span>
              <span className="text-[9px] text-white/40 font-mono">MOLA</span>
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
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[10px] text-white/70 uppercase">
              <span className="flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-white/80" />
                Hazard Index
              </span>
              <span className="text-[9px] text-white/40 font-mono">{hazard.level}</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {(hazard.factor * 100).toFixed(0)}% Risk
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              {hazard.activeZone ? hazard.activeZone.name : 'Nominal bedrock • Low slope'}
            </div>
          </div>

          {/* Thermal Range */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[10px] text-white/70 uppercase">
              <span className="flex items-center gap-1 font-semibold">
                <Thermometer className="w-3.5 h-3.5 text-white/80" />
                Thermal Range
              </span>
              <span className="text-[9px] text-white/40 font-mono">THEMIS</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {thermal.daytimeTempC}°C / {thermal.nighttimeTempC}°C
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              Inertia: {thermal.thermalInertiaSI?.split(' ')[0]} SI
            </div>
          </div>

          {/* Atmospheric Pressure */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[10px] text-white/70 uppercase">
              <span className="flex items-center gap-1 font-semibold">
                <Wind className="w-3.5 h-3.5 text-white/80" />
                Atmosphere
              </span>
              <span className="text-[9px] text-white/40 font-mono">REMS</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {atmosphericPressurePa} Pa
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              {((atmosphericPressurePa / 101325) * 100).toFixed(2)}% Earth std
            </div>
          </div>

          {/* Radiation Dosimetry */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[10px] text-white/70 uppercase">
              <span className="flex items-center gap-1 font-semibold">
                <Activity className="w-3.5 h-3.5 text-white/80" />
                Radiation
              </span>
              <span className="text-[9px] text-white/40 font-mono">MSL RAD</span>
            </div>
            <div className="text-base font-bold text-white font-mono mt-1">
              {historicalRadiation?.doseRateMicroSvPerHour || 24.6} µSv/h
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              {historicalRadiation?.riskLevel || 'Nominal background'}
            </div>
          </div>

          {/* Stratigraphic Formation */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[10px] text-white/70 uppercase">
              <span className="flex items-center gap-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-white/80" />
                Stratigraphy
              </span>
              <span className="text-[9px] text-white/40 font-mono">{geology.era?.split(' ')[0]}</span>
            </div>
            <div className="text-xs font-bold text-white font-mono mt-1 truncate">
              {geology.unit?.split('(')[0] || 'Highland Crust'}
            </div>
            <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
              Stability: {geology.stability} • {geology.roughness?.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Nearest Scientific Target (At the Bottom - No Other Text) */}
      {nearestPOI?.target && (
        <div 
          onClick={() => onSelectPOI && onSelectPOI(nearestPOI.target)}
          className="p-3 rounded-xl bg-ares-surface-alt/50 border border-ares-border/80 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer group"
          title="Click to select this nearest scientific target"
        >
          <div className="truncate">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold font-mono block mb-0.5">
              Nearest Scientific Target
            </span>
            <div className="text-xs font-bold text-white truncate font-sans group-hover:text-ares-accent transition-colors">
              {nearestPOI.target.name}
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-white/80 shrink-0 ml-3 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {nearestPOI.distanceKm < 0.1 ? 'At site' : `${nearestPOI.distanceKm} km away`}
          </div>
        </div>
      )}

      {/* 4. In-Situ Field Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onOpenAddPOI && onOpenAddPOI(coordinates)}
          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium font-mono text-white/80 hover:text-white transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Waypoint</span>
        </button>

        <button
          onClick={() => onPlanUnchartedTraverse && onPlanUnchartedTraverse(coordinates)}
          className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium font-mono text-white/80 hover:text-white transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Plan Traverse Here</span>
        </button>
      </div>
    </div>
  );
}
