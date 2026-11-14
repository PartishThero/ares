import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Clock, 
  FileText, 
  Activity, 
  MapPin, 
  Radio
} from 'lucide-react';
import { getMarsSolTime } from '../utils/coordinates.js';

export default function Header({ 
  onResetView, 
  onOpenReport, 
  onOpenRadiation, 
  activeMission
}) {
  const [marsTime, setMarsTime] = useState(getMarsSolTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setMarsTime(getMarsSolTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-ares-surface border-b border-ares-border px-4 flex items-center justify-between select-none relative z-20 shadow-panel">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ares-accent to-ares-accent-soft p-0.5 flex items-center justify-center shadow-glow-accent">
            <div className="w-full h-full bg-ares-bg rounded-[7px] flex items-center justify-center">
              <span className="font-mono font-black text-ares-accent text-lg tracking-wider">A</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-wider text-ares-text leading-tight">ARES</h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-ares-accent/20 text-ares-accent border border-ares-accent/30 uppercase tracking-wider">
                v2.6 Mars
              </span>
            </div>
            <p className="text-[11px] text-ares-text-muted hidden sm:block">
              Autonomous Route Exploration System • NASA Space Apps
            </p>
          </div>
        </div>

        <div className="h-7 w-[1px] bg-ares-border mx-2 hidden md:block" />
        <div className="hidden lg:flex items-center space-x-2 bg-ares-bg/80 border border-ares-border px-3 py-1.5 rounded-md">
          <MapPin className="w-3.5 h-3.5 text-ares-accent" />
          <span className="text-xs font-mono text-ares-text font-medium">Gale Crater — Mount Sharp</span>
          <span className="text-[10px] font-mono text-ares-text-muted">(4.6°S, 137.4°E)</span>
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-4 bg-ares-bg/90 border border-ares-border/80 px-4 py-1.5 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-ares-cyan animate-pulse" />
          <span className="text-xs font-mono font-semibold text-ares-cyan tracking-wide">
            SOL {marsTime.sol}
          </span>
        </div>
        <span className="text-ares-border">|</span>
        <div className="text-xs font-mono text-ares-text font-medium">
          {marsTime.ltst}
        </div>
        <span className="text-ares-border">|</span>
        <div className="text-[11px] font-mono text-ares-text-muted hidden xl:inline">
          Ls {marsTime.solarLongitudeLs}
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {activeMission && (
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-ares-surface-alt border border-ares-border text-xs">
            <Radio className="w-3 h-3 text-ares-success animate-pulse" />
            <span className="font-mono text-[11px] text-ares-success font-medium">
              {activeMission.code}
            </span>
          </div>
        )}

        <button
          onClick={onOpenRadiation}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-xs text-ares-text transition-all hover:border-ares-warning/60 hover:text-ares-warning"
          title="Open Curiosity RAD Historical Dosimetry Panel"
        >
          <Activity className="w-3.5 h-3.5 text-ares-warning" />
          <span className="hidden sm:inline font-mono font-medium">RAD Dosimetry</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-ares-accent to-ares-accent-soft hover:opacity-95 text-xs text-ares-bg font-bold tracking-wide transition-all shadow-glow-accent"
          title="Generate Marswalk Mission Briefing Report"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Mission Briefing</span>
        </button>

        <button
          onClick={onResetView}
          className="p-1.5 rounded-md bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-ares-text-muted hover:text-ares-text transition-colors"
          title="Recenter Map on Gale Crater"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
