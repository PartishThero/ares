import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Compass, 
  MapPin, 
  RotateCcw,
  Navigation,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Crosshair,
  Search,
  Check
} from 'lucide-react';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets';
import { formatMarsCoords, parseMarsCoords } from '../utils/coordinates';
import { scoreRoute } from '../algorithms/routeScoring';

function getRouteRationale(metrics, profileId, pScore) {
  if (!metrics) return '';
  const { totalDistanceKm, maxSlopeDeg, hazardExposurePercent, estimatedDurationHours } = metrics;
  
  if (hazardExposurePercent > 20) {
    return `High risk: Exceeds standard safety thresholds with ${hazardExposurePercent}% loose sand exposure. Consider alternative bypass.`;
  }
  if (hazardExposurePercent > 10) {
    return `Caution: ${hazardExposurePercent}% of traverse crosses active ripple fields with moderate wheel sinkage risk.`;
  }
  if (maxSlopeDeg > 18) {
    return `Steep grade: Maximum incline of ${maxSlopeDeg}° exceeds vehicle static traction limits. Use switchback corridor.`;
  }
  if (maxSlopeDeg > 14) {
    return `Challenging incline: Max slope of ${maxSlopeDeg}° requires low-gear switchbacks along crater scarps.`;
  }
  if (totalDistanceKm > 100) {
    const sols = (estimatedDurationHours / 24.6).toFixed(0);
    return `Expedition scale: ${totalDistanceKm.toLocaleString()} km traverse (~${sols} Sols) requires intermediate camps and logistics support.`;
  }
  if (profileId === 'safest') {
    return `Grade A safety: 0% dune hazard exposure and gentle ${maxSlopeDeg}° max slope ensure safe, consolidated bedrock transit.`;
  }
  if (profileId === 'shortest') {
    return `Fastest corridor: Direct line navigation minimizes distance (${totalDistanceKm} km) and saves traversal time.`;
  }
  if (profileId === 'science') {
    return `High scientific yield: Corridor maximizes sampling time along high-priority sulfate-bearing bedrock and alluvial fans.`;
  }
  return pScore?.actionableAdvice || 'Nominal traverse corridor within standard operational tolerances.';
}

export default function RoutePlanner({
  startCoord,
  destCoord,
  onSelectStart,
  onSelectDest,
  selectedProfileId,
  onSelectProfile,
  isCalculating,
  plannedRoute,
  allRoutes = {},
  routeScore,
  onResetRoute,
  userPOIs = [],
  mapPickingMode = null,
  onSetPickingMode,
  onFocusStart,
  onFocusRoute
}) {
  const [expandedProfiles, setExpandedProfiles] = useState({ [selectedProfileId]: true });
  const [startInputText, setStartInputText] = useState('');
  const [destInputText, setDestInputText] = useState('');
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [isEditingDest, setIsEditingDest] = useState(false);
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  const startContainerRef = useRef(null);
  const destContainerRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startContainerRef.current && !startContainerRef.current.contains(e.target)) {
        setStartDropdownOpen(false);
      }
      if (destContainerRef.current && !destContainerRef.current.contains(e.target)) {
        setDestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync inputs with coordinates when not typing
  const allTargets = [...SCIENTIFIC_TARGETS, ...userPOIs];

  const matchedStartTarget = allTargets.find(
    (t) =>
      startCoord &&
      Math.abs(t.coordinates[0] - startCoord[0]) < 0.001 &&
      Math.abs(t.coordinates[1] - startCoord[1]) < 0.001
  );

  const matchedDestTarget = allTargets.find(
    (t) =>
      destCoord &&
      Math.abs(t.coordinates[0] - destCoord[0]) < 0.001 &&
      Math.abs(t.coordinates[1] - destCoord[1]) < 0.001
  );

  useEffect(() => {
    if (!isEditingStart) {
      if (matchedStartTarget) {
        setStartInputText(matchedStartTarget.name);
      } else if (startCoord) {
        setStartInputText(formatMarsCoords(startCoord[0], startCoord[1]));
      } else {
        setStartInputText('');
      }
    }
  }, [startCoord, matchedStartTarget, isEditingStart]);

  useEffect(() => {
    if (!isEditingDest) {
      if (matchedDestTarget) {
        setDestInputText(matchedDestTarget.name);
      } else if (destCoord) {
        setDestInputText(formatMarsCoords(destCoord[0], destCoord[1]));
      } else {
        setDestInputText('');
      }
    }
  }, [destCoord, matchedDestTarget, isEditingDest]);

  // Keep active profile expanded when it changes
  useEffect(() => {
    setExpandedProfiles((prev) => ({ ...prev, [selectedProfileId]: true }));
  }, [selectedProfileId]);

  const toggleExpandProfile = (e, profileId) => {
    e.stopPropagation();
    setExpandedProfiles((prev) => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  const handleSwapWaypoints = () => {
    if (!startCoord && !destCoord) return;
    const oldStart = startCoord;
    const oldDest = destCoord;
    if (oldDest) onSelectStart(oldDest);
    if (oldStart) onSelectDest(oldStart);
  };

  const handleStartInputChange = (val) => {
    setStartInputText(val);
    const parsed = parseMarsCoords(val);
    if (parsed) {
      onSelectStart(parsed);
      if (onFocusStart) onFocusStart(parsed);
    }
  };

  const handleDestInputChange = (val) => {
    setDestInputText(val);
    const parsed = parseMarsCoords(val);
    if (parsed) {
      onSelectDest(parsed);
      if (onFocusRoute) {
        onFocusRoute(startCoord || parsed, parsed);
      }
    }
  };

  const filteredCatalog = allTargets.filter((t) => {
    if (!catalogSearch) return t.tier <= 2 || t.isUserCreated || t.category === 'Landing Site';
    const q = catalogSearch.toLowerCase();
    return (t.name || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q);
  });

  const profiles = [
    {
      id: 'safest',
      name: 'Safest Traverse',
      icon: <ShieldCheck className="w-4 h-4 text-ares-success" />,
      desc: 'Avoids steep slopes, crater scarps, and rough sand traps',
      badge: 'Recommended'
    },
    {
      id: 'shortest',
      name: 'Shortest Distance',
      icon: <Zap className="w-4 h-4 text-ares-warning" />,
      desc: 'Takes the most direct path between waypoints to save time',
      badge: 'Fastest'
    },
    {
      id: 'science',
      name: 'Science-Focused',
      icon: <Sparkles className="w-4 h-4 text-ares-cyan" />,
      desc: 'Directs the path through geological outcrops and sampling sites',
      badge: 'Max Science'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none font-sans">
      {/* Navigation Waypoints Section (No numbering) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-ares-accent" />
            <span>Mission Waypoints</span>
          </div>
          {plannedRoute && (
            <button
              onClick={onResetRoute}
              className="text-xs font-mono text-ares-text-muted hover:text-ares-danger flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset current route plan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Start & End Points Container (Google Maps Inspired) */}
        <div className="p-3.5 rounded-2xl bg-ares-surface-alt/80 border border-ares-border shadow-panel space-y-3 relative">
          <div className="flex items-center space-x-3">
            {/* Left Track Line Visual */}
            <div className="flex flex-col items-center justify-between self-stretch py-2 shrink-0">
              <div 
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  mapPickingMode === 'start' 
                    ? 'border-[#ff7a30] bg-[#ff7a30]/30 shadow-glow-accent animate-pulse scale-110' 
                    : 'border-emerald-400 bg-emerald-400/20'
                }`}
                title="Start Point (EVA Base)"
              />
              <div className="w-0.5 flex-1 bg-white/20 my-1 rounded-full" />
              <div 
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  mapPickingMode === 'dest' 
                    ? 'text-[#ff7a30] animate-bounce scale-110' 
                    : 'text-[#ff7a30]'
                }`}
                title="Destination Target"
              >
                <MapPin className="w-4 h-4 fill-[#ff7a30]" />
              </div>
            </div>

            {/* Middle: Interactive Input Fields */}
            <div className="flex-1 space-y-2.5">
              {/* Start Point Input Field */}
              <div ref={startContainerRef} className="relative">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>Start Point</span>
                    {mapPickingMode === 'start' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff7a30]/20 text-[#ff7a30] animate-pulse">
                        Click Map
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDropdownOpen(!startDropdownOpen);
                      setDestDropdownOpen(false);
                    }}
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-0.5 cursor-pointer text-[10px] font-mono"
                  >
                    <span>Choose from Catalog</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={startInputText}
                    placeholder="Click to type coords or pick on map..."
                    onFocus={() => {
                      setIsEditingStart(true);
                      onSetPickingMode?.('start');
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsEditingStart(false), 200);
                    }}
                    onChange={(e) => handleStartInputChange(e.target.value)}
                    className={`w-full bg-ares-bg border rounded-xl pl-3 pr-8 py-2 text-xs font-mono text-ares-text placeholder:text-ares-text-muted/60 focus:outline-none transition-all truncate ${
                      mapPickingMode === 'start' 
                        ? 'border-[#ff7a30] ring-1 ring-[#ff7a30]/50 shadow-glow-accent' 
                        : 'border-ares-border hover:border-ares-border/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => onSetPickingMode?.(mapPickingMode === 'start' ? null : 'start')}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors cursor-pointer ${
                      mapPickingMode === 'start' ? 'text-[#ff7a30] bg-[#ff7a30]/10' : 'text-ares-text-muted hover:text-white'
                    }`}
                    title="Click to toggle map selection crosshair"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtle Catalog Dropdown for Start */}
                {startDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-ares-surface border border-ares-border rounded-xl shadow-2xl p-2 space-y-2 backdrop-blur-xl max-h-56 overflow-y-auto">
                    <div className="relative">
                      <Search className="w-3 h-3 text-ares-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Filter scientific points..."
                        className="w-full bg-ares-bg border border-ares-border rounded-lg pl-7 pr-3 py-1 text-[11px] font-mono text-ares-text focus:outline-none focus:border-ares-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredCatalog.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            onSelectStart(t.coordinates);
                            setStartDropdownOpen(false);
                            setCatalogSearch('');
                            if (onFocusStart) onFocusStart(t.coordinates);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-ares-surface-alt transition-colors cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="truncate text-white font-medium">{t.name}</span>
                          <span className="text-[10px] font-mono text-ares-text-muted shrink-0 ml-2">
                            {t.category || 'Target'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Destination Point Input Field */}
              <div ref={destContainerRef} className="relative">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-[#ff7a30] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>Destination Target</span>
                    {mapPickingMode === 'dest' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff7a30]/20 text-[#ff7a30] animate-pulse">
                        Click Map
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDestDropdownOpen(!destDropdownOpen);
                      setStartDropdownOpen(false);
                    }}
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-0.5 cursor-pointer text-[10px] font-mono"
                  >
                    <span>Choose from Catalog</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={destInputText}
                    placeholder="Click to type coords or pick on map..."
                    onFocus={() => {
                      setIsEditingDest(true);
                      onSetPickingMode?.('dest');
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsEditingDest(false), 200);
                    }}
                    onChange={(e) => handleDestInputChange(e.target.value)}
                    className={`w-full bg-ares-bg border rounded-xl pl-3 pr-8 py-2 text-xs font-mono text-ares-text placeholder:text-ares-text-muted/60 focus:outline-none transition-all truncate ${
                      mapPickingMode === 'dest' 
                        ? 'border-[#ff7a30] ring-1 ring-[#ff7a30]/50 shadow-glow-accent' 
                        : 'border-ares-border hover:border-ares-border/80'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => onSetPickingMode?.(mapPickingMode === 'dest' ? null : 'dest')}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors cursor-pointer ${
                      mapPickingMode === 'dest' ? 'text-[#ff7a30] bg-[#ff7a30]/10' : 'text-ares-text-muted hover:text-white'
                    }`}
                    title="Click to toggle map selection crosshair"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtle Catalog Dropdown for Destination */}
                {destDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-ares-surface border border-ares-border rounded-xl shadow-2xl p-2 space-y-2 backdrop-blur-xl max-h-56 overflow-y-auto">
                    <div className="relative">
                      <Search className="w-3 h-3 text-ares-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Filter scientific targets..."
                        className="w-full bg-ares-bg border border-ares-border rounded-lg pl-7 pr-3 py-1 text-[11px] font-mono text-ares-text focus:outline-none focus:border-ares-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredCatalog.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            onSelectDest(t.coordinates);
                            setDestDropdownOpen(false);
                            setCatalogSearch('');
                            if (onFocusRoute) {
                              onFocusRoute(startCoord || t.coordinates, t.coordinates);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-ares-surface-alt transition-colors cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="truncate text-white font-medium">{t.name}</span>
                          <span className="text-[10px] font-mono text-ares-text-muted shrink-0 ml-2">
                            {t.category || 'Target'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Swap Waypoints Button */}
            <div className="self-center pl-1">
              <button
                type="button"
                onClick={handleSwapWaypoints}
                className="w-9 h-9 rounded-xl bg-ares-surface hover:bg-ares-surface-alt border border-ares-border hover:border-ares-accent text-ares-text-muted hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-panel hover:scale-105 active:scale-95"
                title="Reverse Start & Destination"
              >
                <ArrowUpDown className="w-4 h-4 text-[#ff7a30]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Routing Strategies Section (No numbering) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-ares-text-muted font-bold">
            Routing Strategies
          </div>
          {isCalculating && (
            <div className="text-[11px] font-mono text-ares-accent flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-ares-accent" />
              <span>Computing paths...</span>
            </div>
          )}
        </div>

        {/* 3 Strategy Profiles Cards */}
        <div className="space-y-2.5">
          {profiles.map((p) => {
            const isSelected = selectedProfileId === p.id;
            const profileRoute = allRoutes[p.id];
            const isExpanded = Boolean(expandedProfiles[p.id]);

            const pScore = profileRoute?.metrics
              ? scoreRoute(profileRoute.metrics, p.id === 'science' ? 95 : 75)
              : null;

            return (
              <div
                key={p.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-ares-surface-alt border-ares-accent shadow-panel ring-1 ring-ares-accent/50'
                    : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/70'
                }`}
              >
                {/* Profile Card Header */}
                <div
                  onClick={() => onSelectProfile(p.id)}
                  className="p-3 cursor-pointer flex flex-col space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {p.icon}
                      <span className="text-xs font-bold text-ares-text">{p.name}</span>
                      {isSelected && (
                        <span className="text-[9px] font-mono text-ares-accent uppercase font-bold px-1.5 py-0.5 rounded bg-ares-accent/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {pScore && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${pScore.badgeClass}`}>
                          {pScore.score}/100
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleExpandProfile(e, p.id)}
                        className="p-1 rounded-lg text-ares-text-muted hover:text-white hover:bg-ares-bg transition-colors"
                        title={isExpanded ? 'Hide Details' : 'Show Details'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ares-text-muted leading-snug">
                    {p.desc}
                  </p>
                </div>

                {/* Clean Metrics Grid + One-Liner Asterisk Rationale (Clutter Removed) */}
                {isExpanded && profileRoute && profileRoute.metrics && (
                  <div className="p-3 bg-ares-bg/85 border-t border-ares-border/60 space-y-2.5">
                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Distance</span>
                        <span className="font-bold text-ares-text font-mono">
                          {profileRoute.metrics.totalDistanceKm} km
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Est. Time</span>
                        <span className="font-bold text-ares-cyan font-mono">
                          {profileRoute.metrics.estimatedDurationHours} h
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Hazard</span>
                        <span className={`font-bold font-mono ${
                          profileRoute.metrics.hazardExposurePercent > 15 ? 'text-ares-danger' : 'text-ares-success'
                        }`}>
                          {profileRoute.metrics.hazardExposurePercent}%
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Max Slope</span>
                        <span className={`font-bold font-mono ${
                          profileRoute.metrics.maxSlopeDeg > 15 ? 'text-ares-danger' : 'text-emerald-400'
                        }`}>
                          {profileRoute.metrics.maxSlopeDeg}°
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Climb</span>
                        <span className="font-bold text-ares-text font-mono">
                          +{profileRoute.metrics.elevationGainM} m
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-ares-surface-alt/70 border border-ares-border">
                        <span className="text-[10px] text-ares-text-muted block">Base Datum</span>
                        <span className="font-bold text-ares-cyan font-mono">
                          {profileRoute.metrics.baseElevationM} m
                        </span>
                      </div>
                    </div>

                    {/* Asterisk One-Liner (Why this route is good or bad) */}
                    <div className="pt-2 border-t border-ares-border/50 text-xs font-mono flex items-start space-x-2 text-white/90">
                      <span className="text-[#ff7a30] font-bold text-sm leading-none shrink-0">*</span>
                      <span className="leading-snug">
                        {getRouteRationale(profileRoute.metrics, p.id, pScore)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
