import React, { useState } from 'react';
import { 
  MapPin, 
  Mountain, 
  Layers, 
  Thermometer, 
  AlertTriangle, 
  Navigation, 
  Compass, 
  ExternalLink, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Crosshair,
  Wind,
  Activity,
  Check,
  ArrowRight,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { formatMarsCoords } from '../utils/coordinates';
import SlideCommit from './SlideCommit.jsx';

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!inspectionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none">
        <div className="w-14 h-14 rounded-2xl bg-ares-surface-alt/80 border border-ares-border flex items-center justify-center mb-4 shadow-panel">
          <Crosshair className="w-7 h-7 text-ares-accent animate-spin-slow" />
        </div>
        <h3 className="font-bold text-ares-text text-sm uppercase tracking-wider font-mono">
          Tactical Inspector Active
        </h3>
        <p className="text-xs mt-2 text-ares-text-muted leading-relaxed max-w-xs font-mono">
          Aim cursor active on map. Click anywhere on the Martian terrain or select any cataloged crater, ridge, or scientific site to inspect localized regional telemetry.
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

  const targetThresholdKm = nearestPOI?.target?.tier === 1 ? 30 : nearestPOI?.target?.isUserCreated ? 2 : 10;
  const isTargetPOI = Boolean(nearestPOI?.target && nearestPOI.distanceKm <= targetThresholdKm);
  const targetObj = isTargetPOI ? nearestPOI.target : null;
  const isUserPOI = targetObj?.isUserCreated;

  const isCurrentStart = startCoord && 
    Math.abs(startCoord[0] - coordinates[0]) < 0.001 && 
    Math.abs(startCoord[1] - coordinates[1]) < 0.001;

  const isCurrentDest = destCoord && 
    Math.abs(destCoord[0] - coordinates[0]) < 0.001 && 
    Math.abs(destCoord[1] - coordinates[1]) < 0.001;

  const bothWaypointsSet = Boolean(startCoord && destCoord);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3.5 select-none font-mono">
      {/* 1. Header & Location Identification Banner */}
      <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isUserPOI ? 'text-purple-400' : isTargetPOI ? 'text-ares-accent' : 'text-ares-cyan'
          }`}>
            <Crosshair className="w-3.5 h-3.5 animate-pulse" />
            <span>{isUserPOI ? 'Astronaut Field Waypoint' : isTargetPOI ? 'Cataloged Scientific Target' : 'Localized Surface Sector'}</span>
          </span>

          <div className="flex items-center space-x-2">
            {isUserPOI && onDeleteUserPOI && (
              <button
                onClick={() => onDeleteUserPOI(targetObj.id)}
                className="text-[10px] text-ares-danger hover:underline flex items-center gap-1"
                title="Delete this astronaut waypoint"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={() => onCenterMap(coordinates)}
              className="text-[10px] text-ares-text-muted hover:text-ares-accent transition-colors flex items-center gap-1"
              title="Center map on this sector"
            >
              <span>Center</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <h2 className="text-sm font-bold text-ares-text leading-tight font-sans">
          {targetObj ? targetObj.name : 'Uncharted Surface Location'}
        </h2>

        <div className="flex items-center space-x-2 text-[11px] text-ares-cyan">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">{formattedCoords}</span>
        </div>

        <div className="text-[10px] text-ares-text-muted pt-1 border-t border-ares-border/50 leading-relaxed font-sans">
          Displaying in-situ environmental, geological, and topographic telemetry for this selected region.
        </div>
      </div>

      {/* 2. Unified Regional Telemetry Dashboard (All Core Metrics Grouped Together) */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-ares-text-muted font-bold flex items-center justify-between">
          <span>In-Situ Regional Telemetry</span>
          <span className="text-[9px] text-ares-accent">MOLA / THEMIS / MSL RAD</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Elevation */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/60 border border-ares-border">
            <div className="flex items-center justify-between text-[10px] text-ares-text-muted uppercase">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Mountain className="w-3.5 h-3.5" />
                Elevation
              </span>
              <span className="text-[9px] text-ares-cyan">MOLA</span>
            </div>
            <div className="text-sm font-bold text-ares-text mt-1">
              {elevationMeters.toLocaleString()} m
            </div>
            <div className="text-[10px] text-ares-text-muted truncate mt-0.5">
              {elevationMeters < 0 
                ? `${(Math.abs(elevationMeters) / 1000).toFixed(1)} km below areoid` 
                : `+${(elevationMeters / 1000).toFixed(1)} km above areoid`}
            </div>
          </div>

          {/* Hazard Index */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/60 border border-ares-border">
            <div className="flex items-center justify-between text-[10px] text-ares-text-muted uppercase">
              <span className={`flex items-center gap-1 font-semibold ${hazard.factor > 0.4 ? 'text-ares-danger' : 'text-amber-400'}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Hazard Index
              </span>
              <span className="text-[9px] text-ares-text-muted">{hazard.level}</span>
            </div>
            <div className="text-sm font-bold text-ares-text mt-1">
              {(hazard.factor * 100).toFixed(0)}% Risk
            </div>
            <div className="text-[10px] text-ares-text-muted truncate mt-0.5">
              {hazard.activeZone ? hazard.activeZone.name : 'Nominal bedrock • Low slope'}
            </div>
          </div>

          {/* Thermal Regime */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/60 border border-ares-border">
            <div className="flex items-center justify-between text-[10px] text-ares-text-muted uppercase">
              <span className="flex items-center gap-1 text-purple-400 font-semibold">
                <Thermometer className="w-3.5 h-3.5" />
                Thermal Range
              </span>
              <span className="text-[9px] text-purple-300">THEMIS</span>
            </div>
            <div className="text-xs font-bold text-ares-text mt-1 flex items-center space-x-1.5">
              <span className="text-amber-400">{thermal.daytimeTempC}°C</span>
              <span className="text-ares-border">/</span>
              <span className="text-purple-400">{thermal.nighttimeTempC}°C</span>
            </div>
            <div className="text-[9px] text-ares-text-muted truncate mt-0.5">
              Inertia: {thermal.thermalInertiaSI?.split(' ')[0]} SI
            </div>
          </div>

          {/* Atmospheric Pressure */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/60 border border-ares-border">
            <div className="flex items-center justify-between text-[10px] text-ares-text-muted uppercase">
              <span className="flex items-center gap-1 text-ares-cyan font-semibold">
                <Wind className="w-3.5 h-3.5" />
                Atmosphere
              </span>
              <span className="text-[9px] text-ares-text-muted">REMS</span>
            </div>
            <div className="text-sm font-bold text-ares-text mt-1">
              {atmosphericPressurePa} Pa
            </div>
            <div className="text-[10px] text-ares-text-muted truncate mt-0.5">
              {((atmosphericPressurePa / 101325) * 100).toFixed(2)}% Earth standard
            </div>
          </div>

          {/* Radiation Dosimetry */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/60 border border-ares-border">
            <div className="flex items-center justify-between text-[10px] text-ares-text-muted uppercase">
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <Activity className="w-3.5 h-3.5" />
                Radiation
              </span>
              <span className="text-[9px] text-rose-300">MSL RAD</span>
            </div>
            <div className="text-sm font-bold text-ares-text mt-1">
              {historicalRadiation?.doseRateMicroSvPerHour || 24.6} µSv/h
            </div>
            <div className="text-[10px] text-ares-text-muted truncate mt-0.5">
              {historicalRadiation?.riskLevel || 'Nominal background'}
            </div>
          </div>

          {/* Stratigraphic Formation */}
          <div className="p-2.5 rounded-xl bg-ares-surface-alt/60 border border-ares-border">
            <div className="flex items-center justify-between text-[10px] text-ares-text-muted uppercase">
              <span className="flex items-center gap-1 text-ares-accent font-semibold">
                <Layers className="w-3.5 h-3.5" />
                Stratigraphy
              </span>
              <span className="text-[9px] text-ares-text-muted">{geology.era?.split(' ')[0]}</span>
            </div>
            <div className="text-xs font-bold text-ares-text mt-1 truncate">
              {geology.unit?.split('(')[0] || 'Highland Crust'}
            </div>
            <div className="text-[10px] text-ares-text-muted truncate mt-0.5">
              Stability: {geology.stability} • {geology.roughness?.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scientific Landmark Context (if POI is selected) */}
      {targetObj && (
        <div className="p-3 rounded-xl bg-ares-accent/10 border border-ares-accent/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-ares-accent text-ares-bg uppercase">
              {targetObj.priority}
            </span>
            <span className="text-xs font-bold text-ares-accent">
              Science Value: {targetObj.scienceValue}/100
            </span>
          </div>

          <div className="w-full bg-ares-bg/80 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-ares-cyan to-ares-accent transition-all duration-500" 
              style={{ width: `${targetObj.scienceValue}%` }}
            />
          </div>

          <p className="text-xs text-ares-text leading-relaxed font-sans">
            {targetObj.description}
          </p>

          <div className="text-[11px] space-y-1 pt-1.5 border-t border-ares-accent/20">
            {targetObj.category && (
              <div><span className="text-ares-text-muted">IAU Nomenclature:</span> <span className="text-ares-cyan">{targetObj.category}</span></div>
            )}
            {targetObj.mineralogy && (
              <div><span className="text-ares-text-muted">Mineralogy:</span> <span className="text-ares-text">{targetObj.mineralogy}</span></div>
            )}
            {targetObj.instruments && (
              <div><span className="text-ares-text-muted">Instruments:</span> <span className="text-ares-cyan">{targetObj.instruments.join(', ')}</span></div>
            )}
          </div>

          {targetObj.images && targetObj.images.length > 0 && (
            <div className="pt-2 border-t border-ares-accent/20 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-ares-text-muted">
                <span className="flex items-center gap-1 text-ares-cyan">
                  <ImageIcon className="w-3 h-3" />
                  HiRISE / Mastcam Target Imagery
                </span>
                <span>{activeImageIndex + 1}/{targetObj.images.length}</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-ares-border bg-black aspect-video relative">
                <img 
                  src={targetObj.images[activeImageIndex].url}
                  alt={targetObj.images[activeImageIndex].title}
                  onError={(e) => {
                    e.target.src = targetObj.images[activeImageIndex].fallback;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                  <div className="text-xs font-semibold text-white truncate font-sans">
                    {targetObj.images[activeImageIndex].title}
                  </div>
                  <div className="text-[10px] text-ares-cyan font-mono truncate">
                    {targetObj.images[activeImageIndex].instrument}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Nearest Scientific Feature (if uncataloged terrain) */}
      {!isTargetPOI && nearestPOI?.target && (
        <div 
          onClick={() => onSelectPOI(nearestPOI.target)}
          className="p-2.5 rounded-xl bg-ares-surface-alt/40 hover:bg-ares-surface-alt border border-ares-border cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="truncate">
            <div className="text-[10px] text-ares-cyan font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-ares-accent" />
              <span>NEAREST SCIENTIFIC FEATURE</span>
            </div>
            <div className="text-xs font-bold text-ares-text truncate font-sans group-hover:text-ares-accent transition-colors">
              {nearestPOI.target.name}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-ares-accent shrink-0 ml-2">
            <span>{nearestPOI.distanceKm} km</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* 5. Mission Traverse Workflow & Step-by-Step Guidance */}
      <div className="p-3 rounded-xl bg-ares-surface-alt/70 border border-ares-border space-y-2.5">
        <div className="text-[10px] uppercase tracking-wider text-ares-text-muted font-bold flex items-center justify-between">
          <span>Traverse Waypoint Assignment</span>
          {bothWaypointsSet && (
            <span className="text-[10px] text-ares-success flex items-center gap-1">
              <Check className="w-3 h-3" />
              Both Set
            </span>
          )}
        </div>

        {/* Guided Context Prompt */}
        <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border text-[11px] leading-relaxed">
          {isCurrentStart ? (
            <div className="text-ares-success flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span><strong>Configured as Start (EVA Base).</strong> Now click anywhere on the map or select a feature to set your Destination Target.</span>
            </div>
          ) : isCurrentDest ? (
            <div className="text-ares-cyan flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span><strong>Configured as Destination Target.</strong> Now click on the map to set your EVA Base / Start location.</span>
            </div>
          ) : routePrompt?.message ? (
            <div className="text-ares-text flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ares-accent shrink-0 mt-0.5" />
              <span>{routePrompt.message}</span>
            </div>
          ) : (
            <div className="text-ares-text-muted flex items-start gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-ares-accent shrink-0 mt-0.5" />
              <span>Assign this selected location as either your mission <strong>EVA Base (Start)</strong> or <strong>Destination Target</strong>.</span>
            </div>
          )}
        </div>

        {/* Start / Target CTAs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSetAsStart(coordinates)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              isCurrentStart
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-sm'
                : 'bg-ares-surface hover:bg-ares-border border-ares-border text-ares-text hover:text-white'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isCurrentStart ? 'text-emerald-400' : 'text-ares-success'}`} />
            <span>{isCurrentStart ? '✓ Start Set' : 'Set As Start'}</span>
          </button>

          <button
            onClick={() => onSetAsDest(coordinates)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              isCurrentDest
                ? 'bg-ares-accent/20 border-ares-accent text-ares-accent shadow-glow-sm'
                : 'bg-ares-surface hover:bg-ares-border border-ares-border text-ares-text hover:text-white'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isCurrentDest ? 'text-ares-accent' : 'text-ares-accent'}`} />
            <span>{isCurrentDest ? '✓ Target Set' : 'Set As Target'}</span>
          </button>
        </div>

        {/* ReactBits SlideCommit Micro-Component: Slide to Proceed to Route Planner */}
        {bothWaypointsSet && onSwitchToPlanner && (
          <div className="w-full pt-1.5">
            <SlideCommit
              label="Slide to Route Planner"
              doneLabel="Route Initialized"
              width="100%"
              height={44}
              radius={12}
              trackColor="rgba(23, 25, 28, 0.95)"
              handleColor="#ff7a30"
              successColor="#10b981"
              holdMs={1000}
              onConfirm={() => {
                return new Promise((resolve) => {
                  setTimeout(resolve, 400);
                });
              }}
              onDone={() => {
                setTimeout(() => {
                  onSwitchToPlanner();
                }, 350);
              }}
            />
          </div>
        )}
      </div>

      {/* 6. In-Situ Field Actions (Waypoint Logging & Plan Traverse) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onOpenAddPOI && onOpenAddPOI(coordinates)}
          className="px-3 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-300 transition-all flex items-center justify-center space-x-1.5 shadow-panel"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Waypoint</span>
        </button>

        {/* Plan Traverse Here: Preserved exactly as requested */}
        <button
          onClick={() => onPlanUnchartedTraverse && onPlanUnchartedTraverse(coordinates)}
          className="px-3 py-2.5 rounded-xl bg-ares-accent/20 hover:bg-ares-accent/30 border border-ares-accent/40 text-xs font-bold text-ares-accent transition-all flex items-center justify-center space-x-1.5 shadow-panel"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Plan Traverse Here</span>
        </button>
      </div>
    </div>
  );
}
