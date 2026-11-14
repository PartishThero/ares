import React from 'react';
import { 
  Compass, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Mountain, 
  Sparkles, 
  Clock, 
  Radio, 
  ChevronRight,
  Crosshair,
  Plus,
  Navigation,
  FileText,
  Globe
} from 'lucide-react';
import { PRESET_MISSIONS } from '../data/missionData.js';

export default function LandingPage({
  marsTime,
  liveTelemetry,
  onLaunchApp,
  onLaunchGlobe,
  onSelectMissionAndLaunch,
  onLaunchUncharted,
  onLaunchRadiation,
  onLaunchCustomMission
}) {
  return (
    <div className="h-screen w-full bg-ares-bg text-ares-text overflow-y-auto overflow-x-hidden flex flex-col font-sans">
      <nav className="h-20 border-b border-ares-border/70 bg-ares-surface/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ares-accent to-ares-accent-soft p-0.5 flex items-center justify-center shadow-glow-accent">
            <div className="w-full h-full bg-ares-bg rounded-[9px] flex items-center justify-center">
              <span className="font-mono font-black text-ares-accent text-xl tracking-wider">A</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-wider text-ares-text">ARES</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-ares-accent/20 text-ares-accent border border-ares-accent/30 uppercase tracking-wider">
                NASA Space Apps 2026
              </span>
            </div>
            <p className="text-xs text-ares-text-muted font-mono hidden sm:block">
              Autonomous Route Exploration System • Mars Surface Operations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-3 bg-ares-bg/90 border border-ares-border px-3.5 py-1.5 rounded-lg text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-ares-cyan font-semibold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>SOL {marsTime.sol}</span>
            </div>
            <span className="text-ares-border">|</span>
            <span>{marsTime.ltst}</span>
            <span className="text-ares-border">|</span>
            <span className="text-ares-text-muted">Ls {marsTime.solarLongitudeLs}</span>
          </div>

          <button
            onClick={onLaunchGlobe || onLaunchApp}
            className="px-4 py-2.5 rounded-xl bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-ares-cyan font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-panel flex items-center space-x-2 cursor-pointer"
            title="Launch 3D Planetary Globe (Esri Explore Mars Replica)"
          >
            <Globe className="w-4 h-4 text-ares-cyan" />
            <span className="hidden sm:inline">3D Globe</span>
          </button>

          <button
            onClick={onLaunchApp}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-ares-accent to-ares-accent-soft hover:opacity-95 text-ares-bg font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-glow-accent flex items-center space-x-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Launch 2D Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <section className="relative px-6 sm:px-10 py-12 sm:py-20 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-ares-surface-alt border border-ares-border text-xs font-mono text-ares-accent">
            <Radio className="w-3.5 h-3.5 animate-pulse text-ares-success" />
            <span>Operational GIS & Astronaut Trajectory Optimization Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Navigate the Martian Surface with Aerospace Precision.
          </h1>

          <p className="text-base sm:text-lg text-ares-text-muted leading-relaxed max-w-2xl">
            ARES is an operational decision support platform built for astronauts exploring Gale Crater and the rugged flanks of Mount Sharp. Compute optimal, hazard-evasive EVA traverses, evaluate high-resolution NASA GIS orbital layers, and monitor in-situ radiation dosimetry in real time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onLaunchGlobe || onLaunchApp}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-ares-cyan to-blue-500 hover:opacity-95 text-ares-bg font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-glow-cyan flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Globe className="w-4 h-4" />
              <span>Explore 3D Globe</span>
            </button>

            <button
              onClick={onLaunchApp}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-ares-accent to-ares-accent-soft hover:opacity-95 text-ares-bg font-mono text-sm font-bold uppercase tracking-wider transition-all shadow-glow-accent flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span>2D Tactical Map</span>
            </button>

            <button
              onClick={() => {
                const primary = PRESET_MISSIONS[0];
                if (primary) onSelectMissionAndLaunch(primary);
              }}
              className="px-5 py-3.5 rounded-xl bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-ares-text font-mono text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Navigation className="w-4 h-4 text-ares-accent" />
              <span>Load Blueprint Boxwork Expedition</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchUncharted || onLaunchApp}
              className="px-5 py-3.5 rounded-xl bg-ares-accent/15 hover:bg-ares-accent/25 border border-ares-accent/40 text-ares-accent font-mono text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Crosshair className="w-4 h-4" />
              <span>Explore Uncharted Sector</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-12 mt-12 border-t border-ares-border/60">
          <div 
            onClick={onLaunchApp}
            className="p-4 rounded-xl bg-ares-surface/70 hover:bg-ares-surface border border-ares-border hover:border-ares-accent/60 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono uppercase text-ares-text-muted block">GALE CRATER LOCATION</span>
            <span className="text-base font-mono font-bold text-ares-text block mt-1 group-hover:text-ares-accent transition-colors">4.6°S, 137.4°E</span>
            <span className="text-[11px] text-ares-cyan font-mono">Mount Sharp (Aeolis Mons)</span>
          </div>

          <div 
            onClick={onLaunchApp}
            className="p-4 rounded-xl bg-ares-surface/70 hover:bg-ares-surface border border-ares-border hover:border-ares-accent/60 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono uppercase text-ares-text-muted block">SURFACE PRESSURE</span>
            <span className="text-base font-mono font-bold text-ares-text block mt-1 group-hover:text-ares-accent transition-colors">
              {liveTelemetry?.atmosphericPressurePa || 840} Pa
            </span>
            <span className="text-[11px] text-ares-text-muted font-mono">0.83% Earth sea level</span>
          </div>

          <div 
            onClick={onLaunchRadiation || onLaunchApp}
            className="p-4 rounded-xl bg-ares-surface/70 hover:bg-ares-surface border border-ares-border hover:border-ares-warning/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-ares-text-muted block">GCR RADIATION FLUX</span>
              <Activity className="w-3.5 h-3.5 text-ares-warning" />
            </div>
            <span className="text-base font-mono font-bold text-ares-warning block mt-1">
              {liveTelemetry?.radiationRateUsvPerHour || 27.1} μSv/h
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Click for Dosimetry →</span>
          </div>

          <div 
            onClick={onLaunchApp}
            className="p-4 rounded-xl bg-ares-surface/70 hover:bg-ares-surface border border-ares-border hover:border-ares-accent/60 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-mono uppercase text-ares-text-muted block">GROUND TEMPERATURE</span>
            <span className="text-base font-mono font-bold text-ares-text block mt-1 group-hover:text-ares-accent transition-colors">
              {liveTelemetry?.groundTemperatureC || -48}°C
            </span>
            <span className="text-[11px] text-ares-cyan font-mono">Diurnal swing -65° to -5°</span>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 py-16 bg-ares-surface/40 border-y border-ares-border/60 shrink-0">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ares-accent">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Engineered for Martian Expeditions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div 
              onClick={onLaunchApp}
              className="p-6 rounded-2xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-ares-accent/60 transition-all cursor-pointer space-y-3 group shadow-panel"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Mountain className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-ares-accent transition-colors">Multi-Objective A* Pathfinding</h3>
              <p className="text-xs text-ares-text-muted leading-relaxed">
                Dynamically balances traversal distance, slope grade limits (&lt;15° nominal, &lt;25° maximum), and proximity to loose active sand dunes and steep scarps using real MOLA topography.
              </p>
              <span className="text-[11px] font-mono text-ares-accent flex items-center gap-1 font-semibold pt-1">
                <span>Launch Route Engine</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              onClick={onLaunchApp}
              className="p-6 rounded-2xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-ares-accent/60 transition-all cursor-pointer space-y-3 group shadow-panel"
            >
              <div className="w-10 h-10 rounded-xl bg-ares-accent/20 border border-ares-accent/40 flex items-center justify-center">
                <Layers className="w-5 h-5 text-ares-accent" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-ares-accent transition-colors">NASA Mars Trek GIS Integration</h3>
              <p className="text-xs text-ares-text-muted leading-relaxed">
                Stream global Viking MDIM2.1 optical imagery, MOLA topographic color hillshades, and THEMIS daytime/nighttime thermal inertia directly with native 2D continuous canvas rotation.
              </p>
              <span className="text-[11px] font-mono text-ares-accent flex items-center gap-1 font-semibold pt-1">
                <span>Open GIS Layers</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              onClick={onLaunchRadiation || onLaunchApp}
              className="p-6 rounded-2xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-amber-500/60 transition-all cursor-pointer space-y-3 group shadow-panel"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">MSL RAD Dosimetry Modeling</h3>
              <p className="text-xs text-ares-text-muted leading-relaxed">
                In-situ radiation assessment based on Curiosity’s continuous measurements along Gale Crater. Simulates EVA cumulative microSievert doses under both nominal GCR and solar flare events.
              </p>
              <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 font-semibold pt-1">
                <span>Open Dosimetry Calculator</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10 py-16 max-w-7xl mx-auto w-full space-y-8 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ares-accent">
              Pre-Formulated Expeditions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Select an Expedition & Begin Navigation
            </h2>
          </div>

          <button
            onClick={onLaunchCustomMission || onLaunchApp}
            className="px-4 py-2 rounded-xl bg-ares-surface border border-ares-border hover:border-ares-accent text-xs font-mono text-ares-accent hover:text-white flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-panel"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Mission</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRESET_MISSIONS.map((mission) => (
            <div
              key={mission.id}
              onClick={() => onSelectMissionAndLaunch(mission)}
              className="p-5 rounded-2xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-ares-accent/60 transition-all cursor-pointer shadow-panel flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ares-accent/20 text-ares-accent border border-ares-accent/30">
                    {mission.code}
                  </span>
                  <span className="text-[10px] font-mono text-ares-text-muted">
                    {mission.difficulty}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-ares-accent transition-colors">
                  {mission.name}
                </h3>
                <p className="text-xs text-ares-text-muted leading-relaxed">
                  {mission.objective}
                </p>
              </div>

              <div className="pt-3 border-t border-ares-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-ares-cyan">{mission.recommendedMode} Mode</span>
                <span className="text-ares-accent group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                  <span>Launch Trajectory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-ares-border bg-ares-surface/90 px-6 sm:px-10 py-6 text-xs font-mono text-ares-text-muted flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div>
          <span>Autonomous Route Exploration System (ARES v2.6)</span> • <span>NASA Space Apps Challenge</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Data Sources: NASA PDS • Mars Trek • USGS Astrogeology</span>
        </div>
      </footer>
    </div>
  );
}
