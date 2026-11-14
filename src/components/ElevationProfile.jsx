import React, { useState, useRef } from 'react';
import { 
  Mountain, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Info, 
  HelpCircle,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Gauge
} from 'lucide-react';

export default function ElevationProfile({ plannedRoute }) {
  const [hoverPoint, setHoverPoint] = useState(null);
  const [elevationMode, setElevationMode] = useState('relative'); // 'relative' (default) or 'mola'
  const [showExplainer, setShowExplainer] = useState(false);
  const containerRef = useRef(null);

  if (!plannedRoute?.elevationProfile || plannedRoute.elevationProfile.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none font-sans">
        <div className="w-14 h-14 rounded-2xl bg-ares-surface-alt/80 border border-ares-border flex items-center justify-center mb-4 shadow-panel">
          <Mountain className="w-7 h-7 text-emerald-400 animate-pulse" />
        </div>
        <h3 className="font-bold text-ares-text text-sm uppercase tracking-wider font-mono">
          No Route Profile Available
        </h3>
        <p className="text-xs mt-2 text-ares-text-muted leading-relaxed max-w-xs font-mono">
          Configure waypoints in Route Planner to generate the high-resolution MOLA topographic cross-section and slope analysis.
        </p>
      </div>
    );
  }

  const profile = plannedRoute.elevationProfile;
  const totalDist = plannedRoute.metrics.totalDistanceKm || 1;
  const baseElev = plannedRoute.metrics.baseElevationM ?? profile[0].elevationM;
  const minElev = plannedRoute.metrics.minElevationM;
  const maxElev = plannedRoute.metrics.maxElevationM;
  const elevRange = Math.max(50, maxElev - minElev);

  const width = 500;
  const height = 185;
  const padLeft = 56;
  const padRight = 18;
  const padTop = 22;
  const padBottom = 32;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const svgPoints = profile.map((pt) => {
    const x = padLeft + (pt.distanceKm / totalDist) * chartW;
    const y = padTop + chartH - ((pt.elevationM - minElev) / elevRange) * chartH;
    return { ...pt, x, y };
  });

  const pathD = svgPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${padLeft + chartW} ${padTop + chartH} L ${padLeft} ${padTop + chartH} Z`;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;

    let closest = svgPoints[0];
    let minDist = Infinity;
    for (const pt of svgPoints) {
      const d = Math.abs(pt.x - relativeX);
      if (d < minDist) {
        minDist = d;
        closest = pt;
      }
    }
    setHoverPoint(closest);
  };

  const formatYLabel = (elev) => {
    if (elevationMode === 'relative') {
      const rel = Math.round(elev - baseElev);
      return `${rel >= 0 ? '+' : ''}${rel}m`;
    }
    return `${Math.round(elev)}m`;
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3.5 select-none font-sans">
      {/* 1. Header Card (Same Design Capsule as Inspector & Route) */}
      <div className="p-3.5 rounded-2xl bg-ares-surface-alt/70 border border-ares-border space-y-1.5 shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5" />
            Topographic Transect & Relief
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="text-[10px] font-mono text-ares-text-muted hover:text-ares-cyan flex items-center gap-1 px-2 py-0.5 rounded-lg border border-ares-border hover:border-ares-cyan/50 transition-colors"
              title="Why are Martian elevations negative?"
            >
              <HelpCircle className="w-3 h-3 text-ares-cyan" />
              <span>Datum FAQ</span>
            </button>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-ares-accent/20 border border-ares-accent/40 text-ares-accent">
              {plannedRoute.profileName || 'Active Route'}
            </span>
          </div>
        </div>

        <h2 className="text-sm font-bold text-ares-text leading-tight">
          Elevation Profile Cross-Section
        </h2>

        <p className="text-[11px] text-ares-text-muted leading-relaxed">
          Continuous in-situ MOLA laser altimetry along the active traverse corridor.
        </p>
      </div>

      {/* Educational Datum FAQ Drawer */}
      {showExplainer && (
        <div className="p-3.5 rounded-2xl bg-ares-cyan/10 border border-ares-cyan/30 text-xs text-ares-text space-y-2 leading-relaxed shadow-glow-sm">
          <div className="font-bold text-ares-cyan flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide">
            <Info className="w-3.5 h-3.5" />
            <span>Why are Martian elevations negative?</span>
          </div>
          <p className="text-[11px] text-ares-text-muted">
            Earth elevations reference <strong>sea level (0 m)</strong>. Because Mars has no open oceans, NASA and the IAU established the 0 m reference datum (the <em>planetary areoid</em>) at Mars's mean equatorial radius (3,396.19 km) where atmospheric pressure is 610.5 Pa (the triple point of water).
          </p>
          <p className="text-[11px] text-ares-text-muted">
            Large impact basins like <strong>Gale Crater (-4.5 km)</strong>, <strong>Jezero (-2.5 km)</strong>, and <strong>Hellas (-7.2 km)</strong> sit kilometers below this global datum, so raw laser altimetry registers negative values.
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            Toggle to <strong>"Ground Relief"</strong> below to view human climbing height (+m) relative to your departure base!
          </p>
        </div>
      )}

      {/* 2. Elevation Reference Switcher (Aerospace Capsule Toggle) */}
      <div className="p-2.5 rounded-xl bg-ares-surface-alt/60 border border-ares-border flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-ares-text block">Elevation Reference</span>
          <span className="text-[10px] text-ares-text-muted font-mono">Relative climb vs global MOLA</span>
        </div>
        <div className="flex items-center bg-ares-bg p-1 rounded-xl border border-ares-border/70 space-x-1">
          <button
            onClick={() => setElevationMode('relative')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              elevationMode === 'relative'
                ? 'bg-gradient-to-r from-ares-accent to-ares-accent-soft text-ares-bg shadow-glow-sm'
                : 'text-ares-text-muted hover:text-white'
            }`}
          >
            Ground Relief (0m)
          </button>
          <button
            onClick={() => setElevationMode('mola')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              elevationMode === 'mola'
                ? 'bg-gradient-to-r from-ares-accent to-ares-accent-soft text-ares-bg shadow-glow-sm'
                : 'text-ares-text-muted hover:text-white'
            }`}
          >
            MOLA Global
          </button>
        </div>
      </div>

      {/* 3. High-Resolution Altimetry Graph Card */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPoint(null)}
        className="w-full bg-ares-bg/95 border border-ares-border/80 rounded-2xl p-3 relative cursor-crosshair shadow-panel"
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="aresTopoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF7A45" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#FF7A45" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0d0d12" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={padLeft + chartW} y2={padTop} stroke="rgba(56, 60, 65, 0.4)" strokeDasharray="3,3" />
          <line x1={padLeft} y1={padTop + chartH / 2} x2={padLeft + chartW} y2={padTop + chartH / 2} stroke="rgba(56, 60, 65, 0.4)" strokeDasharray="3,3" />
          <line x1={padLeft} y1={padTop + chartH} x2={padLeft + chartW} y2={padTop + chartH} stroke="rgba(56, 60, 65, 0.7)" />

          {/* Y-axis altitude labels */}
          <text x={padLeft - 8} y={padTop + 4} fill="#8e929b" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="600">
            {formatYLabel(maxElev)}
          </text>
          <text x={padLeft - 8} y={padTop + chartH / 2 + 3} fill="#8e929b" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="600">
            {formatYLabel((maxElev + minElev) / 2)}
          </text>
          <text x={padLeft - 8} y={padTop + chartH + 3} fill="#8e929b" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="600">
            {formatYLabel(minElev)}
          </text>

          {/* X-axis distance labels */}
          <text x={padLeft} y={padTop + chartH + 16} fill="#8e929b" fontSize="9" fontFamily="monospace" textAnchor="start">
            0 km
          </text>
          <text x={padLeft + chartW / 2} y={padTop + chartH + 16} fill="#8e929b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            {(totalDist / 2).toFixed(1)} km
          </text>
          <text x={padLeft + chartW} y={padTop + chartH + 16} fill="#8e929b" fontSize="9" fontFamily="monospace" textAnchor="end">
            {totalDist.toFixed(1)} km
          </text>

          {/* Profile Area & Line */}
          <path d={areaD} fill="url(#aresTopoGradient)" />
          <path d={pathD} fill="none" stroke="#FF7A45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Slope Sample Markers */}
          {svgPoints.map((pt, idx) => {
            if (idx % 2 !== 0 && idx !== svgPoints.length - 1) return null;
            let color = '#10b981'; // nominal green
            if (pt.slopeDeg > 14) color = '#ef4444'; // steep red
            else if (pt.slopeDeg > 8) color = '#f59e0b'; // moderate amber

            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="2.5"
                fill={color}
              />
            );
          })}

          {/* Interactive Inspection Reticle */}
          {hoverPoint && (
            <g>
              <line
                x1={hoverPoint.x}
                y1={padTop}
                x2={hoverPoint.x}
                y2={padTop + chartH}
                stroke="#00F0FF"
                strokeWidth="1.2"
                strokeDasharray="2,2"
              />
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r="5"
                fill="#00F0FF"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Live Hover Tooltip Badge */}
        {hoverPoint && (
          <div className="mt-2.5 p-2 rounded-xl bg-ares-surface/95 border border-ares-cyan/50 text-xs font-mono flex items-center justify-between text-ares-text shadow-glow-cyan">
            <div>
              <span className="text-ares-text-muted text-[10px] block">DISTANCE</span>
              <span className="text-ares-cyan font-bold">{hoverPoint.distanceKm} km</span>
            </div>
            <div>
              <span className="text-ares-text-muted text-[10px] block">
                {elevationMode === 'relative' ? 'RELIEF (AGL)' : 'MOLA DATUM'}
              </span>
              <span className="text-emerald-400 font-bold">
                {elevationMode === 'relative'
                  ? `${Math.round(hoverPoint.elevationM - baseElev) >= 0 ? '+' : ''}${Math.round(hoverPoint.elevationM - baseElev)} m`
                  : `${hoverPoint.elevationM} m`}
              </span>
            </div>
            <div>
              <span className="text-ares-text-muted text-[10px] block">LOCAL SLOPE</span>
              <span className={`font-bold ${
                hoverPoint.slopeDeg > 14 ? 'text-ares-danger' : hoverPoint.slopeDeg > 8 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {hoverPoint.slopeDeg}° ({hoverPoint.slopeDeg > 14 ? 'Steep' : hoverPoint.slopeDeg > 8 ? 'Moderate' : 'Nominal'})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Slope Grade Legend */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div className="p-2 rounded-xl bg-ares-surface-alt/50 border border-ares-border flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
          <span className="text-ares-text">Nominal (&lt; 8°)</span>
        </div>
        <div className="p-2 rounded-xl bg-ares-surface-alt/50 border border-ares-border flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
          <span className="text-ares-text">Moderate (8–14°)</span>
        </div>
        <div className="p-2 rounded-xl bg-ares-surface-alt/50 border border-ares-border flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
          <span className="text-ares-text">Steep (&gt; 14°)</span>
        </div>
      </div>

      {/* 5. Four Core Elevation Metrics (Matching Design Capsule Grid) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Ascent */}
        <div className="p-3 rounded-xl bg-ares-surface-alt/60 border border-ares-border hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Vertical Climb</span>
          </div>
          <div className="text-base font-bold text-ares-text font-mono mt-1">
            +{plannedRoute.metrics.elevationGainM} m
          </div>
          <div className="text-[10px] text-ares-text-muted mt-0.5">
            Total cumulative ascent
          </div>
        </div>

        {/* Descent */}
        <div className="p-3 rounded-xl bg-ares-surface-alt/60 border border-ares-border hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center space-x-1 text-ares-cyan font-semibold text-[11px]">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Vertical Descent</span>
          </div>
          <div className="text-base font-bold text-ares-text font-mono mt-1">
            -{plannedRoute.metrics.elevationLossM} m
          </div>
          <div className="text-[10px] text-ares-text-muted mt-0.5">
            Total cumulative descent
          </div>
        </div>

        {/* Peak Slope Grade */}
        <div className="p-3 rounded-xl bg-ares-surface-alt/60 border border-ares-border hover:border-amber-500/40 transition-colors">
          <div className="flex items-center space-x-1 text-amber-400 font-semibold text-[11px]">
            <Gauge className="w-3.5 h-3.5" />
            <span>Steepest Slope</span>
          </div>
          <div className={`text-base font-bold font-mono mt-1 ${
            plannedRoute.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'
          }`}>
            {plannedRoute.metrics.maxSlopeDeg}° Grade
          </div>
          <div className="text-[10px] text-ares-text-muted mt-0.5">
            {plannedRoute.metrics.maxSlopeDeg <= 10 ? 'Safe for all rover models' : 'Requires terrain zig-zagging'}
          </div>
        </div>

        {/* Start Base Datum */}
        <div className="p-3 rounded-xl bg-ares-surface-alt/60 border border-ares-border hover:border-purple-500/40 transition-colors">
          <div className="flex items-center space-x-1 text-purple-400 font-semibold text-[11px]">
            <Compass className="w-3.5 h-3.5" />
            <span>Departure Datum</span>
          </div>
          <div className="text-base font-bold text-ares-cyan font-mono mt-1">
            {baseElev.toLocaleString()} m MOLA
          </div>
          <div className="text-[10px] text-ares-text-muted mt-0.5">
            {baseElev < 0 
              ? `${(Math.abs(baseElev) / 1000).toFixed(1)} km below datum areoid` 
              : `+${(baseElev / 1000).toFixed(1)} km above datum`}
          </div>
        </div>
      </div>
    </div>
  );
}
