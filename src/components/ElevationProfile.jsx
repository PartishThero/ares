import React, { useState, useRef } from 'react';
import { Mountain, TrendingUp, AlertTriangle, ChevronRight, Activity } from 'lucide-react';

export default function ElevationProfile({ plannedRoute }) {
  const [hoverPoint, setHoverPoint] = useState(null);
  const containerRef = useRef(null);

  if (!plannedRoute?.elevationProfile || plannedRoute.elevationProfile.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ares-text-muted select-none">
        <div className="w-12 h-12 rounded-xl bg-ares-surface-alt border border-ares-border flex items-center justify-center mb-3">
          <Mountain className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="font-semibold text-ares-text text-sm">No Elevation Profile</h3>
        <p className="text-xs mt-1 text-ares-text-muted/80 max-w-xs">
          Plan an exploration route to view the high-resolution MOLA topographic cross-section and slope grades.
        </p>
      </div>
    );
  }

  const profile = plannedRoute.elevationProfile;
  const totalDist = plannedRoute.metrics.totalDistanceKm || 1;
  const minElev = plannedRoute.metrics.minElevationM;
  const maxElev = plannedRoute.metrics.maxElevationM;
  const elevRange = Math.max(50, maxElev - minElev);

  const width = 500;
  const height = 180;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 20;
  const padBottom = 30;

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

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none">
      <div className="space-y-1 pb-2 border-b border-ares-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mountain className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-ares-text">
              Topographic Cross-Section (MOLA)
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ares-surface-alt text-ares-cyan">
            {plannedRoute.profileName}
          </span>
        </div>
        <p className="text-xs text-ares-text-muted">
          Continuous elevation profile with localized slope gradients and hazard markers along the EVA path.
        </p>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPoint(null)}
        className="w-full bg-ares-bg/90 border border-ares-border rounded-xl p-3 relative cursor-crosshair shadow-inner"
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="topoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c47b50" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#8f624a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#17191c" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <line x1={padLeft} y1={padTop} x2={padLeft + chartW} y2={padTop} stroke="#2e343b" strokeDasharray="3,3" />
          <line x1={padLeft} y1={padTop + chartH / 2} x2={padLeft + chartW} y2={padTop + chartH / 2} stroke="#2e343b" strokeDasharray="3,3" />
          <line x1={padLeft} y1={padTop + chartH} x2={padLeft + chartW} y2={padTop + chartH} stroke="#383c41" />

          <text x={padLeft - 6} y={padTop + 4} fill="#9a9a95" fontSize="8" fontFamily="monospace" textAnchor="end">
            {maxElev}m
          </text>
          <text x={padLeft - 6} y={padTop + chartH / 2 + 3} fill="#9a9a95" fontSize="8" fontFamily="monospace" textAnchor="end">
            {Math.round(minElev + elevRange / 2)}m
          </text>
          <text x={padLeft - 6} y={padTop + chartH + 3} fill="#9a9a95" fontSize="8" fontFamily="monospace" textAnchor="end">
            {minElev}m
          </text>

          <text x={padLeft} y={padTop + chartH + 15} fill="#9a9a95" fontSize="8" fontFamily="monospace" textAnchor="start">
            0 km
          </text>
          <text x={padLeft + chartW / 2} y={padTop + chartH + 15} fill="#9a9a95" fontSize="8" fontFamily="monospace" textAnchor="middle">
            {(totalDist / 2).toFixed(1)} km
          </text>
          <text x={padLeft + chartW} y={padTop + chartH + 15} fill="#9a9a95" fontSize="8" fontFamily="monospace" textAnchor="end">
            {totalDist.toFixed(1)} km
          </text>

          <path d={areaD} fill="url(#topoGradient)" />

          <path d={pathD} fill="none" stroke="#c47b50" strokeWidth="2.5" />

          {svgPoints.map((pt, idx) => {
            if (idx % 2 !== 0 && idx !== svgPoints.length - 1) return null;
            let color = '#91a68b';
            if (pt.slopeDeg > 14) color = '#cf665d';
            else if (pt.slopeDeg > 8) color = '#e0a96d';

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

          {hoverPoint && (
            <g>
              <line
                x1={hoverPoint.x}
                y1={padTop}
                x2={hoverPoint.x}
                y2={padTop + chartH}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r="4.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {hoverPoint && (
          <div className="mt-2 p-2 rounded-lg bg-ares-surface-alt border border-ares-cyan/40 text-xs font-mono flex items-center justify-between text-ares-text">
            <div>
              <span className="text-ares-text-muted text-[10px]">DISTANCE:</span>{' '}
              <span className="text-ares-cyan font-bold">{hoverPoint.distanceKm} km</span>
            </div>
            <div>
              <span className="text-ares-text-muted text-[10px]">ELEV:</span>{' '}
              <span className="text-emerald-400 font-bold">{hoverPoint.elevationM} m</span>
            </div>
            <div>
              <span className="text-ares-text-muted text-[10px]">SLOPE:</span>{' '}
              <span className={`font-bold ${hoverPoint.slopeDeg > 14 ? 'text-ares-danger' : hoverPoint.slopeDeg > 8 ? 'text-ares-warning' : 'text-ares-success'}`}>
                {hoverPoint.slopeDeg}°
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div className="p-1.5 rounded bg-ares-surface-alt border border-ares-border flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-ares-success" />
          <span className="text-ares-text">Nominal (&lt; 8°)</span>
        </div>
        <div className="p-1.5 rounded bg-ares-surface-alt border border-ares-border flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-ares-warning" />
          <span className="text-ares-text">Moderate (8–14°)</span>
        </div>
        <div className="p-1.5 rounded bg-ares-surface-alt border border-ares-border flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-ares-danger" />
          <span className="text-ares-text">Steep (&gt; 14°)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
          <span className="text-[10px] text-ares-text-muted block">TOTAL CLIMB (GAIN)</span>
          <span className="font-bold text-ares-text">+{plannedRoute.metrics.elevationGainM} m</span>
        </div>
        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
          <span className="text-[10px] text-ares-text-muted block">TOTAL DESCENT (LOSS)</span>
          <span className="font-bold text-ares-text">-{plannedRoute.metrics.elevationLossM} m</span>
        </div>
        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
          <span className="text-[10px] text-ares-text-muted block">PEAK SLOPE GRADE</span>
          <span className={`font-bold ${plannedRoute.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'}`}>
            {plannedRoute.metrics.maxSlopeDeg}°
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
          <span className="text-[10px] text-ares-text-muted block">AVERAGE SLOPE</span>
          <span className="font-bold text-ares-text">{plannedRoute.metrics.avgSlopeDeg}°</span>
        </div>
      </div>
    </div>
  );
}

