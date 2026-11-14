import React, { useState } from 'react';
import { 
  MapPin, 
  Mountain, 
  Layers, 
  Thermometer, 
  AlertTriangle, 
  Navigation, 
  CheckCircle, 
  Compass, 
  Image as ImageIcon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatMarsCoords } from '../utils/coordinates';

export default function DestinationInspector({
  inspectionData,
  onSetAsStart,
  onSetAsDest,
  onCenterMap,
  onSelectPOI
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!inspectionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none">
        <div className="w-12 h-12 rounded-xl bg-ares-surface-alt border border-ares-border flex items-center justify-center mb-3">
          <Compass className="w-6 h-6 text-ares-accent animate-spin-slow" />
        </div>
        <h3 className="font-semibold text-ares-text text-sm">No Location Selected</h3>
        <p className="text-xs mt-1 text-ares-text-muted/80 max-w-xs">
          Click anywhere on the Mars surface map or select a scientific point of interest to inspect topography, stratigraphy, and hazards.
        </p>
      </div>
    );
  }

  const { coordinates, formattedCoords, elevationMeters, geology, hazard, thermal, nearestPOI, atmosphericPressurePa } = inspectionData;
  const isTargetPOI = nearestPOI?.distanceKm < 0.2 && nearestPOI.target;
  const targetObj = isTargetPOI ? nearestPOI.target : null;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none">
      <div className="space-y-1.5 pb-3 border-b border-ares-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ares-accent font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {isTargetPOI ? 'Verified Scientific Target' : 'Martian Surface Target'}
          </span>
          <button
            onClick={() => onCenterMap(coordinates)}
            className="text-[11px] font-mono text-ares-text-muted hover:text-ares-accent transition-colors flex items-center gap-1"
          >
            <span>Center</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <h2 className="text-base font-bold text-ares-text leading-tight">
          {targetObj ? targetObj.name : 'Surface Location'}
        </h2>
        <div className="text-xs font-mono text-ares-cyan font-medium">
          {formattedCoords}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
          <div className="flex items-center space-x-1.5 text-ares-text-muted text-[10px] font-mono uppercase">
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Elevation (MOLA)</span>
          </div>
          <div className="text-sm font-mono font-bold text-ares-text mt-1">
            {elevationMeters.toLocaleString()} m
          </div>
          <div className="text-[10px] text-ares-text-muted/80 mt-0.5">
            {elevationMeters < -4000 ? 'Crater floor' : 'Mount Sharp slope'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
          <div className="flex items-center space-x-1.5 text-ares-text-muted text-[10px] font-mono uppercase">
            <AlertTriangle className={`w-3.5 h-3.5 ${hazard.factor > 0.4 ? 'text-ares-danger' : 'text-ares-success'}`} />
            <span>Hazard Index</span>
          </div>
          <div className="text-sm font-mono font-bold text-ares-text mt-1">
            {(hazard.factor * 100).toFixed(0)}% ({hazard.level})
          </div>
          <div className="text-[10px] text-ares-text-muted/80 mt-0.5 truncate">
            {hazard.activeZone ? hazard.activeZone.name : 'Nominal bedrock'}
          </div>
        </div>
      </div>

      {targetObj && (
        <div className="p-3 rounded-xl bg-ares-accent/10 border border-ares-accent/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-ares-accent text-ares-bg uppercase">
              {targetObj.priority}
            </span>
            <span className="text-xs font-mono font-bold text-ares-accent">
              Science Value: {targetObj.scienceValue}/100
            </span>
          </div>
          <p className="text-xs text-ares-text leading-relaxed">
            {targetObj.description}
          </p>
          <div className="text-[11px] font-mono space-y-1 pt-1 border-t border-ares-accent/20">
            <div><span className="text-ares-text-muted">Mineralogy:</span> <span className="text-ares-text">{targetObj.mineralogy}</span></div>
            <div><span className="text-ares-text-muted">Instruments:</span> <span className="text-ares-cyan">{targetObj.instruments.join(', ')}</span></div>
          </div>
        </div>
      )}

      <div className="p-3 rounded-lg bg-ares-surface-alt/50 border border-ares-border space-y-2">
        <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-ares-text-muted">
          <Layers className="w-3.5 h-3.5 text-ares-accent" />
          <span>Stratigraphic Unit</span>
        </div>
        <div className="text-xs font-semibold text-ares-text">
          {geology.unit}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-ares-text-muted">
          <div>Era: <span className="text-ares-text">{geology.era}</span></div>
          <div>Stability: <span className="text-ares-text">{geology.stability}</span></div>
          <div className="col-span-2">Roughness: <span className="text-ares-text">{geology.roughness}</span></div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-ares-surface-alt/50 border border-ares-border space-y-2">
        <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-ares-text-muted">
          <Thermometer className="w-3.5 h-3.5 text-purple-400" />
          <span>Thermal & Environment (THEMIS / REMS)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-ares-bg/80 border border-ares-border">
            <span className="text-[10px] text-ares-text-muted block">Day Thermal</span>
            <span className="text-amber-400 font-bold">{thermal.daytimeTempC}°C</span>
          </div>
          <div className="p-2 rounded bg-ares-bg/80 border border-ares-border">
            <span className="text-[10px] text-ares-text-muted block">Night Thermal</span>
            <span className="text-purple-400 font-bold">{thermal.nighttimeTempC}°C</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-ares-text-muted space-y-0.5 pt-1">
          <div>Atmospheric Pressure: <span className="text-ares-text">{atmosphericPressurePa} Pa (0.84% Earth)</span></div>
          <div>Thermal Inertia: <span className="text-ares-text">{thermal.thermalInertiaSI}</span></div>
        </div>
      </div>

      {targetObj?.images && targetObj.images.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-ares-border">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-ares-text-muted flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-ares-cyan" />
              Target Imagery ({targetObj.images.length})
            </span>
          </div>
          <div className="rounded-lg overflow-hidden border border-ares-border bg-black aspect-video relative group">
            <img 
              src={targetObj.images[activeImageIndex].url}
              alt={targetObj.images[activeImageIndex].title}
              onError={(e) => {
                e.target.src = targetObj.images[activeImageIndex].fallback;
              }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
              <div className="text-xs font-semibold text-white truncate">
                {targetObj.images[activeImageIndex].title}
              </div>
              <div className="text-[10px] text-gray-300 font-mono truncate">
                {targetObj.images[activeImageIndex].instrument}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-ares-text-muted italic">
            {targetObj.images[activeImageIndex].caption}
          </p>
        </div>
      )}

      {!isTargetPOI && nearestPOI?.target && (
        <div 
          onClick={() => onSelectPOI(nearestPOI.target)}
          className="p-2.5 rounded-lg bg-ares-surface-alt/40 hover:bg-ares-surface-alt border border-ares-border cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="truncate">
            <div className="text-[10px] font-mono text-ares-cyan">NEAREST SCIENTIFIC FEATURE</div>
            <div className="text-xs font-semibold text-ares-text truncate">{nearestPOI.target.name}</div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-mono text-ares-accent shrink-0 ml-2">
            <span>{nearestPOI.distanceKm} km</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={() => onSetAsStart(coordinates)}
          className="px-3 py-2 rounded-lg bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-xs font-mono font-medium text-ares-text hover:text-white transition-all flex items-center justify-center space-x-1.5"
        >
          <Navigation className="w-3.5 h-3.5 text-ares-success" />
          <span>Set As Start</span>
        </button>

        <button
          onClick={() => onSetAsDest(coordinates)}
          className="px-3 py-2 rounded-lg bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-xs font-mono font-medium text-ares-text hover:text-white transition-all flex items-center justify-center space-x-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-ares-accent" />
          <span>Set As Target</span>
        </button>
      </div>
    </div>
  );
}

