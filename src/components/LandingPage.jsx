import React, { useState, useEffect, useRef } from 'react';
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
  Globe,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Gauge
} from 'lucide-react';
import { PRESET_MISSIONS } from '../data/missionData.js';
import Topography from './Topography';
import GooeyNav from './GooeyNav';

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
  const [activeSection, setActiveSection] = useState(0);
  const scrollContainerRef = useRef(null);

  const navItems = [
    { label: 'Overview', href: '#overview' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Expeditions', href: '#expeditions' }
  ];

  const handleNavChange = (index) => {
    setActiveSection(index);
    const targetId = ['overview', 'capabilities', 'expeditions'][index];
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollY = container.scrollTop;
      const capEl = document.getElementById('capabilities');
      const expEl = document.getElementById('expeditions');

      if (!capEl || !expEl) return;

      const capTop = capEl.offsetTop - 180;
      const expTop = expEl.offsetTop - 180;

      if (scrollY >= expTop) {
        setActiveSection(2);
      } else if (scrollY >= capTop) {
        setActiveSection(1);
      } else {
        setActiveSection(0);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="h-screen w-full bg-ares-bg text-ares-text overflow-y-auto overflow-x-hidden flex flex-col font-sans scroll-smooth"
    >
      {/* FLOATING POPPED-OUT NAVBAR: Floating Glass Island Capsule */}
      <header className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-6xl pointer-events-none">
        <nav className="w-full h-16 sm:h-18 px-4 sm:px-8 rounded-full border border-white/15 bg-[#12141a]/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] flex items-center justify-between pointer-events-auto transition-all">
          {/* Left: Clean Brand Logo & Name */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm">
              <img
                src="/recraft-svg-converter.svg"
                alt="ARES Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-light text-base sm:text-lg tracking-wide text-white">ARES</span>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">Marswalk</span>
            </div>
          </div>

          {/* Center: Functional Interactive ReactBits GooeyNav */}
          <div className="hidden md:flex items-center justify-center">
            <GooeyNav
              items={navItems}
              activeIndex={activeSection}
              onChange={handleNavChange}
              theme="dark"
              color="#ff5a1f"
              colors={['#ff5a1f', '#ff8a3a', '#ffb020']}
              particleCount={22}
              spread={74}
              gooeyness={0.35}
              wobble={0.65}
              frame={false}
              size="sm"
            />
          </div>

          {/* Right: Quick Action Pills */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            <button
              onClick={onLaunchGlobe || onLaunchApp}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/20 hover:border-white/50 text-white font-medium text-xs transition-all backdrop-blur-sm cursor-pointer hover:bg-white/5"
              title="Launch 3D Planetary Globe"
            >
              3D Globe
            </button>

            <button
              onClick={onLaunchApp}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center space-x-1.5 hover:scale-105 active:scale-95"
            >
              <span>Launch 2D Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </header>

      {/* SECTION 1: FULL-SCREEN CENTERED HERO SECTION (Overview) */}
      <div 
        id="overview" 
        className="relative w-full h-screen min-h-[680px] overflow-hidden shrink-0 flex flex-col justify-between items-center text-center pt-24 sm:pt-28"
      >
        {/* Centered 3D Topographic Martian Landscape Background (Dune Preset) */}
        <div className="absolute inset-0 pointer-events-auto z-0 overflow-hidden">
          <Topography
            preset="dunes"
            color="#ff7a30"
            speed={0.10}
            tilt={28}
            glow={1.2}
            mouseInteraction={true}
            hoverEffect="lift"
            clickEffect="pulse"
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
        <div className="h-6" />

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center my-auto">
          {/* High-Contrast Apple-Style Typography (Light + Bold) */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.08] text-center font-sans">
            <span className="font-light block text-white/90">Navigate the</span>
            <span className="font-extrabold block text-white">Martian Surface</span>
          </h1>

          {/* Centered Subtitle */}
          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto text-center mt-6 font-normal leading-relaxed">
            Autonomous decision-support platform for Gale Crater & Mount Sharp astronaut expeditions.
          </p>

          {/* Centered Action Pills: Strictly Two CTAs (2D and 3D) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
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
          </div>
        </div>

        {/* Bottom Centered Star Emblem */}
        <div className="relative z-10 pb-8 select-none text-center">
          <span className="text-white/40 text-xs">✦</span>
        </div>
      </div>

      {/* SECTION 2: FULL-SCREEN CORE CAPABILITIES */}
      <section 
        id="capabilities" 
        className="min-h-screen w-full py-24 px-6 sm:px-12 bg-[#0d0e11] border-t border-white/10 flex flex-col justify-center relative overflow-hidden shrink-0"
      >
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-[#ff7a30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full space-y-12 relative z-10">
          {/* Header & Comprehensive Mission Statement */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#ff7a30]">
              <span>✦</span>
              <span>MISSION CAPABILITIES & AUTONOMOUS ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              What ARES Does: Autonomous Mars Surface Operations
            </h2>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light">
              ARES (Autonomous Route Exploration System) eliminates traversal uncertainty for crewed EVAs and robotic sorties across Gale Crater and the slopes of Mount Sharp. We fuse real USGS/MOLA orbital elevation data, 12+ years of Curiosity MSL radiation physics, and live physiological astronaut constraints into a single operational decision engine.
            </p>
          </div>

          {/* Live In-Situ Telemetry Console Widget (Moved from Hero) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-panel space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-[#ff7a30] animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                  Gale Crater In-Situ Environmental Telemetry
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                  MSL Feed Active
                </span>
              </div>
              <span className="text-[11px] font-mono text-white/50">
                Aerospace In-Situ Sensor Array
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Operational Coordinates</span>
                <p className="text-sm sm:text-base font-bold text-white font-mono">4.6°S, 137.4°E</p>
                <span className="text-[11px] text-white/50 block font-sans">Mount Sharp / Aeolis Mons</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Atmospheric Pressure</span>
                <p className="text-sm sm:text-base font-bold text-white font-mono">{liveTelemetry?.atmosphericPressurePa || 842} Pa</p>
                <span className="text-[11px] text-white/50 block font-sans">~0.83% Earth sea level</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Surface Radiation Flux</span>
                <p className="text-sm sm:text-base font-bold text-[#ff7a30] font-mono">{liveTelemetry?.radiationRateUsvPerHour || 27.3} μSv/h</p>
                <span className="text-[11px] text-white/50 block font-sans">MSL RAD Nominal Baseline</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Ground Temperature</span>
                <p className="text-sm sm:text-base font-bold text-white font-mono">{liveTelemetry?.groundTemperatureC || -61}°C</p>
                <span className="text-[11px] text-white/50 block font-sans">Diurnal swing: -75° to -15°C</span>
              </div>
            </div>
          </div>

          {/* Deep Capability Grid (6 High-Performance Modules) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Capability 1: Multi-Objective A* */}
            <div 
              onClick={onLaunchApp}
              className="p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-4 group shadow-panel backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff7a30]/15 border border-[#ff7a30]/30 flex items-center justify-center text-[#ff7a30]">
                  <Mountain className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                    &lt;15° Slope Grade
                  </span>
                  <span className="text-[10px] font-mono text-[#ff7a30]">MOLA 128 px/deg</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors">
                  Multi-Objective A* Pathfinding
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Evaluates prospective EVA corridors against real Mars Orbiter Laser Altimeter topography. Enforces strict physiological limits (&lt;15° nominal ascent, &lt;25° contingency cap) to safeguard astronaut mobility and rover hardware.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#ff7a30]">
                <span>Launch Pathfinding Engine</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Capability 2: Dune & Scarp Avoidance */}
            <div 
              onClick={onLaunchApp}
              className="p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-4 group shadow-panel backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                    Hazard Exclusion
                  </span>
                  <span className="text-[10px] font-mono text-[#ff7a30]">Bagnold Dunes</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors">
                  Active Sand Dune & Scarp Mitigation
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Basaltic barchan dunes pose fatal wheel-sinkage and astronaut entrapment hazards. ARES identifies active ripple complexes and automatically maps perimeter detours over consolidated interdune sandstone bedrock.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white">
                <span>Inspect Hazard Corridors</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Capability 3: MSL RAD Dosimetry */}
            <div 
              onClick={onLaunchRadiation || onLaunchApp}
              className="p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-4 group shadow-panel backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff7a30]/15 border border-[#ff7a30]/30 flex items-center justify-center text-[#ff7a30]">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                    MSL RAD Calibrated
                  </span>
                  <span className="text-[10px] font-mono text-[#ff7a30]">GCR + Solar Flare</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors">
                  In-Situ Radiation Dosimetry
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Calibrated directly with Curiosity's 12-year in-situ surface telemetry. Dynamically models astronaut cumulative microSievert (μSv) exposure under galactic cosmic background and projects emergency shelter windows during Solar Particle Events.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#ff7a30]">
                <span>Open Dosimetry Calculator</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Capability 4: NASA Mars Trek GIS Integration */}
            <div 
              onClick={onLaunchApp}
              className="p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-4 group shadow-panel backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                    NASA Mars Trek
                  </span>
                  <span className="text-[10px] font-mono text-[#ff7a30]">Multi-Spectral GIS</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors">
                  Orbital Multi-Spectral GIS Fusion
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Stream planetary-scale Viking MDIM 2.1 optical imagery, MOLA color-elevation hillshades, and THEMIS thermal inertia maps directly with continuous 2D canvas rotation and sub-meter coordinate fidelity.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white">
                <span>Explore Orbital Layers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Capability 5: Physiological Traversal Analytics */}
            <div 
              onClick={onLaunchApp}
              className="p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-4 group shadow-panel backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff7a30]/15 border border-[#ff7a30]/30 flex items-center justify-center text-[#ff7a30]">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                    Human Factors
                  </span>
                  <span className="text-[10px] font-mono text-[#ff7a30]">Caloric Burn (kcal)</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors">
                  Astronaut Metabolic & Sortie Analytics
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Projects astronaut energy expenditure and oxygen consumption across variable slope grades and terrain friction. Balances fast sprints against low-metabolic sustained traverses to prevent astronaut exhaustion.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#ff7a30]">
                <span>View Traversal Metrics</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Capability 6: 3D Globe & Scientific Intelligence */}
            <div 
              onClick={onLaunchGlobe || onLaunchApp}
              className="p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ff7a30]/60 transition-all cursor-pointer space-y-4 group shadow-panel backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">
                    Planetary 3D
                  </span>
                  <span className="text-[10px] font-mono text-[#ff7a30]">Solar Terminator</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors">
                  Interactive 3D Sphere & Target Intel
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Switch instantly between tactical 2D metric maps and an interactive 3D planetary sphere showing true solar altitude and Local True Solar Time (LTST). Includes a database of 30+ Gale Crater geological targets.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white">
                <span>Launch 3D Planetary Sphere</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Bottom Capabilities Banner */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center space-x-4">
              <span className="text-2xl text-[#ff7a30]">✦</span>
              <div>
                <p className="text-sm font-bold text-white">Ready to plan an astronaut traverse?</p>
                <p className="text-xs text-white/60 font-mono">Real-time A* pathfinding with MOLA elevation and hazard exclusions.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Open Tactical Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FULL-SCREEN PRE-FORMULATED EXPEDITIONS */}
      <section 
        id="expeditions" 
        className="min-h-screen w-full py-24 px-6 sm:px-12 bg-[#111317] border-t border-white/10 flex flex-col justify-center relative overflow-hidden shrink-0"
      >
        {/* Subtle background ambient glows */}
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#ff7a30]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full space-y-12 relative z-10">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#ff7a30]">
                <span>✦</span>
                <span>OPERATIONAL EVA BLUEPRINTS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Pre-Formulated Martian Expeditions
              </h2>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light">
                Scientifically calibrated traverses through Gale Crater's most significant paleohydrological formations. Each blueprint includes verified waypoints, slope grading, and hazard avoidance corridors.
              </p>
            </div>

            <button
              onClick={onLaunchCustomMission || onLaunchApp}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white flex items-center space-x-2 transition-all self-start md:self-auto cursor-pointer shadow-panel hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#ff7a30]" />
              <span>Create Custom Traversal</span>
            </button>
          </div>

          {/* Expedition Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESET_MISSIONS.map((mission) => (
              <div
                key={mission.id}
                onClick={() => onSelectMissionAndLaunch(mission)}
                className="p-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#ff7a30]/60 transition-all cursor-pointer shadow-panel flex flex-col justify-between space-y-5 group backdrop-blur-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#ff7a30]/15 text-[#ff7a30] border border-[#ff7a30]/30">
                      {mission.code}
                    </span>
                    <span className="text-[11px] font-mono text-white/50">
                      {mission.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors leading-snug">
                    {mission.name}
                  </h3>

                  <p className="text-xs text-white/60 leading-relaxed">
                    {mission.objective}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/40">RECOMMENDED MODE</span>
                    <span className="text-white font-semibold">{mission.recommendedMode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white/40">DUNE HAZARDS</span>
                    <span className="text-[#ff7a30] font-semibold">Excluded</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#ff7a30] font-bold">
                    <span>Launch Trajectory</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}

            {/* Custom Mission Feature Card */}
            <div
              onClick={onLaunchCustomMission || onLaunchApp}
              className="p-7 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] hover:from-[#ff7a30]/10 hover:to-white/[0.03] border border-dashed border-white/20 hover:border-[#ff7a30] transition-all cursor-pointer shadow-panel flex flex-col justify-between space-y-5 group backdrop-blur-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                    CUSTOM-EVA
                  </span>
                  <span className="text-[11px] font-mono text-[#ff7a30]">
                    User Defined
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[#ff7a30] transition-colors leading-snug">
                  Formulate Custom Astronaut Sortie
                </h3>

                <p className="text-xs text-white/60 leading-relaxed">
                  Design bespoke EVA traverses from any base coordinates in Gale Crater. Configure custom slope limits, toggle Bagnold dune exclusions, and define scientific target waypoints.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/40">A* OPTIMIZATION</span>
                  <span className="text-white font-semibold">Interactive</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/40">WAYPOINTS</span>
                  <span className="text-[#ff7a30] font-semibold">Unlimited</span>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-white group-hover:text-[#ff7a30] font-bold">
                  <span>Open Mission Builder</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Footer Strip */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
            <div>
              <span>Autonomous Route Exploration System (ARES v2.6)</span> • <span>Mars Surface Operations</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>NASA PDS • Mars Trek • USGS Astrogeology</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0a0b0d] px-6 sm:px-10 py-6 text-xs font-mono text-white/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div>
          <span>ARES Marswalk System</span> • <span>Aerospace Planetary Trajectory Engine</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white/60">Gale Crater 4.6°S, 137.4°E</span>
          <span>•</span>
          <span className="text-[#ff7a30]">Autonomous Operations</span>
        </div>
      </footer>
    </div>
  );
}
