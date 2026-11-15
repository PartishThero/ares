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
import Topography from './Topography';

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
      {/* NAVBAR: Ultra-Clean, Apple-Style Minimal Header */}
      <nav className="h-18 border-b border-white/10 bg-ares-bg/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 flex items-center justify-between shrink-0">
        {/* Left: Clean Brand Logo & Name (Zero Clutter) */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src="/recraft-svg-converter.svg"
              alt="ARES Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-light text-lg tracking-wide text-white">ARES</span>
            <span className="font-bold text-lg tracking-tight text-white">Marswalk</span>
          </div>
        </div>

        {/* Center: Minimal Navigation Anchors */}
        <div className="hidden md:flex items-center space-x-8 text-xs font-medium text-white/70">
          <a href="#overview" className="text-white border-b border-white pb-0.5 font-semibold">Overview</a>
          <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          <a href="#expeditions" className="hover:text-white transition-colors">Expeditions</a>
          <div className="flex items-center space-x-1.5 text-xs text-[#ff7a30] font-mono pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a30] animate-pulse" />
            <span>SOL {marsTime.sol}</span>
          </div>
        </div>

        {/* Right: Quick Action Pills */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onLaunchGlobe || onLaunchApp}
            className="px-5 py-2 rounded-full border border-white/20 hover:border-white/50 text-white font-medium text-xs transition-all backdrop-blur-sm cursor-pointer hover:bg-white/5"
            title="Launch 3D Planetary Globe"
          >
            3D Globe
          </button>

          <button
            onClick={onLaunchApp}
            className="px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center space-x-1.5 hover:scale-105 active:scale-95"
          >
            <span>Launch 2D Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* FULL-SCREEN CENTERED HERO SECTION (Apple Vision Pro Inspired) */}
      <div id="overview" className="relative w-full h-[calc(100vh-4.5rem)] min-h-[640px] overflow-hidden shrink-0 flex flex-col justify-between items-center text-center">
        {/* Centered 3D Topographic Martian Landscape Background */}
        <div className="absolute inset-0 pointer-events-auto z-0 overflow-hidden">
          <Topography
            color="#ff7a30"
            lineCount={26}
            lineWidth={1.3}
            elevation={1.4}
            speed={0.08}
            direction="forward"
            glow={1.4}
            mouseInteraction={true}
            hoverEffect="lift"
            clickEffect="pulse"
            majorLines={true}
            tilt={28}
            trail={0.6}
            dpr={1}
            className="w-full h-full"
          />

          {/* Upward Conical Light Ray Projection toward Centered Headline */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 92%, rgba(255, 122, 48, 0.22) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 75%)'
            }}
          />

          {/* Vignette gradients to keep centered typography razor-sharp */}
          <div className="absolute inset-0 bg-gradient-to-t from-ares-bg via-transparent to-ares-bg/40 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-ares-bg/20 to-ares-bg/70 pointer-events-none" />
        </div>

        {/* Top Spacer */}
        <div className="h-4" />

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center my-auto">
          {/* Centered Kicker Tag */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#ff7a30] mb-5 backdrop-blur-md shadow-sm">
            <span>✦</span>
            <span>NASA Space Apps 2026 • Martian GIS Engine</span>
          </div>

          {/* High-Contrast Apple-Style Typography (Light + Bold) */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.08] text-center font-sans">
            <span className="font-light block text-white/90">Navigate the</span>
            <span className="font-extrabold block text-white">Martian Surface</span>
          </h1>

          {/* Centered Subtitle */}
          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto text-center mt-5 font-normal leading-relaxed">
            Autonomous decision-support platform for Gale Crater & Mount Sharp astronaut expeditions.
          </p>

          {/* Centered Action Pills: Strictly Orange & White Fills */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-7">
            {/* White Fill Pill */}
            <button
              onClick={onLaunchApp}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2"
            >
              <span>Launch 2D Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Orange Fill Pill */}
            <button
              onClick={onLaunchGlobe || onLaunchApp}
              className="px-8 py-3.5 rounded-full bg-[#ff7a30] hover:bg-[#ff7a30]/90 text-black font-bold text-sm transition-all shadow-glow-accent hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Explore 3D Globe</span>
            </button>

            {/* Subtle Translucent Outline Pill */}
            <button
              onClick={() => {
                const primary = PRESET_MISSIONS[0];
                if (primary) onSelectMissionAndLaunch(primary);
              }}
              className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-all backdrop-blur-md cursor-pointer flex items-center space-x-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-[#ff7a30]" />
              <span>Boxwork Expedition</span>
            </button>
          </div>
        </div>

        {/* Bottom Centered Minimal Telemetry Strip */}
        <div className="relative z-10 pb-6 w-full px-6 flex flex-col items-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-2 rounded-full bg-ares-bg/75 border border-white/10 backdrop-blur-md text-xs font-mono text-white/80 shadow-panel">
            <div className="flex items-center space-x-1.5">
              <span className="text-white/40">SITE</span>
              <span className="font-bold text-white">Gale Crater 4.6°S, 137.4°E</span>
            </div>
            <span className="text-white/20 hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-white/40">PRESSURE</span>
              <span className="font-bold text-white">{liveTelemetry?.atmosphericPressurePa || 840} Pa</span>
            </div>
            <span className="text-white/20 hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-white/40">RADIATION</span>
              <span className="font-bold text-[#ff7a30]">{liveTelemetry?.radiationRateUsvPerHour || 27.1} μSv/h</span>
            </div>
            <span className="text-white/20 hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-white/40">TEMP</span>
              <span className="font-bold text-white">{liveTelemetry?.groundTemperatureC || -48}°C</span>
            </div>
          </div>

          {/* Centered Star Emblem */}
          <div className="text-white/40 text-xs mt-3 select-none flex items-center gap-1.5">
            <span>✦</span>
          </div>
        </div>
      </div>

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
              className="p-6 rounded-2xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-3 group shadow-panel"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ff7a30]/15 border border-[#ff7a30]/30 flex items-center justify-center">
                <Mountain className="w-5 h-5 text-[#ff7a30]" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#ff7a30] transition-colors">Multi-Objective A* Pathfinding</h3>
              <p className="text-xs text-ares-text-muted leading-relaxed">
                Dynamically balances traversal distance, slope grade limits (&lt;15° nominal, &lt;25° maximum), and proximity to loose active sand dunes and steep scarps using real MOLA topography.
              </p>
              <span className="text-[11px] font-mono text-[#ff7a30] flex items-center gap-1 font-semibold pt-1">
                <span>Launch Route Engine</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              onClick={onLaunchApp}
              className="p-6 rounded-2xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-3 group shadow-panel"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#ff7a30] transition-colors">NASA Mars Trek GIS Integration</h3>
              <p className="text-xs text-ares-text-muted leading-relaxed">
                Stream global Viking MDIM2.1 optical imagery, MOLA topographic color hillshades, and THEMIS daytime/nighttime thermal inertia directly with native 2D continuous canvas rotation.
              </p>
              <span className="text-[11px] font-mono text-[#ff7a30] flex items-center gap-1 font-semibold pt-1">
                <span>Open GIS Layers</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div 
              onClick={onLaunchRadiation || onLaunchApp}
              className="p-6 rounded-2xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-3 group shadow-panel"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ff7a30]/15 border border-[#ff7a30]/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#ff7a30]" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#ff7a30] transition-colors">MSL RAD Dosimetry Modeling</h3>
              <p className="text-xs text-ares-text-muted leading-relaxed">
                In-situ radiation assessment based on Curiosity’s continuous measurements along Gale Crater. Simulates EVA cumulative microSievert doses under both nominal GCR and solar flare events.
              </p>
              <span className="text-[11px] font-mono text-[#ff7a30] flex items-center gap-1 font-semibold pt-1">
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
                <span className="text-white/70">{mission.recommendedMode} Mode</span>
                <span className="text-[#ff7a30] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
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
