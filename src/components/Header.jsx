import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  Activity, 
  FileText, 
  Plus, 
  Crosshair, 
  Clock, 
  Radio, 
  ChevronDown,
  X,
  ExternalLink,
  Home,
  Globe,
  Map as MapIcon
} from 'lucide-react';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets.js';

export default function Header({
  allTargets = [],
  onSelectTarget,
  marsTime,
  liveTelemetry,
  onOpenReport,
  onOpenRadiation,
  onResetView,
  onOpenAddPOI,
  onToggleUnchartedMode,
  interactionMode = 'default',
  onOpenDirections,
  onToggleLandingPage,
  isLandingPage = false,
  viewMode = 'map',
  onChangeViewMode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTargets = allTargets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const cat = (t.category || '').toLowerCase();
    const name = (t.name || '').toLowerCase();
    const matchesQuery = name.includes(q) || cat.includes(q);
    
    if (!matchesQuery) return false;
    if (activeFilter === 'landmarks') return t.tier === 1;
    if (activeFilter === 'user') return t.isUserCreated;
    if (activeFilter === 'science') return cat.includes('formation') || cat.includes('stratigraphic') || cat.includes('lakebed') || t.tier <= 2;
    if (activeFilter === 'drills') return cat.includes('drill');
    return true;
  }).slice(0, 30);

  return (
    <header className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none select-none">
      <div 
        ref={searchContainerRef}
        className="pointer-events-auto flex items-center gap-2 bg-ares-surface/95 backdrop-blur-md border border-ares-border rounded-2xl shadow-panel px-3 py-1.5 transition-all w-full sm:w-[420px] md:w-[460px] relative"
      >
        <button
          type="button"
          onClick={onToggleLandingPage || onResetView}
          title="ARES — Return to Mission Overview"
          className="flex items-center space-x-2 shrink-0 group focus:outline-none cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ares-accent to-ares-accent-soft p-0.5 flex items-center justify-center shadow-glow-accent group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center p-0.5 overflow-hidden">
              <img
                src="/recraft-svg-converter.svg"
                alt="ARES"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </button>

        <div className="relative flex-1 flex items-center">
          <Search className="w-3.5 h-3.5 text-ares-text-muted absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Search craters, ridges, drill sites..."
            className="w-full bg-ares-bg/80 border border-ares-border/70 rounded-xl pl-7 pr-7 py-1.5 text-xs text-ares-text font-mono placeholder:text-ares-text-muted/60 focus:outline-none focus:border-ares-accent"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2 text-ares-text-muted hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={onOpenDirections}
            className="p-1.5 rounded-lg bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-ares-accent hover:text-white transition-colors"
            title="Directions / Route Planner"
          >
            <Navigation className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleUnchartedMode}
            className={`p-1.5 rounded-lg border transition-all ${
              interactionMode === 'explore_uncharted'
                ? 'bg-ares-accent text-ares-bg border-ares-accent animate-pulse font-bold'
                : 'bg-ares-surface-alt hover:bg-ares-border border-ares-border text-ares-text-muted hover:text-ares-accent'
            }`}
            title="Explore Uncharted Sector (Click anywhere on terrain to compute traverse)"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenAddPOI && onOpenAddPOI()}
            className="p-1.5 rounded-lg bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-purple-400 hover:text-purple-300 transition-colors"
            title="Add Custom Astronaut Waypoint"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-ares-surface border border-ares-border rounded-xl shadow-panel overflow-hidden z-40 max-h-80 flex flex-col">
            <div className="px-3 py-2 bg-ares-surface-alt/70 border-b border-ares-border flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[10px] font-mono">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${activeFilter === 'all' ? 'bg-ares-accent text-ares-bg font-bold' : 'text-ares-text-muted hover:text-ares-text'}`}
              >
                All ({allTargets.length})
              </button>
              <button
                onClick={() => setActiveFilter('landmarks')}
                className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${activeFilter === 'landmarks' ? 'bg-ares-accent text-ares-bg font-bold' : 'text-ares-text-muted hover:text-ares-text'}`}
              >
                Landmarks
              </button>
              <button
                onClick={() => setActiveFilter('science')}
                className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${activeFilter === 'science' ? 'bg-ares-accent text-ares-bg font-bold' : 'text-ares-text-muted hover:text-ares-text'}`}
              >
                Science Formations
              </button>
              <button
                onClick={() => setActiveFilter('drills')}
                className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${activeFilter === 'drills' ? 'bg-ares-accent text-ares-bg font-bold' : 'text-ares-text-muted hover:text-ares-text'}`}
              >
                Drill Samples
              </button>
              <button
                onClick={() => setActiveFilter('user')}
                className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${activeFilter === 'user' ? 'bg-ares-accent text-ares-bg font-bold' : 'text-ares-text-muted hover:text-ares-text'}`}
              >
                My Waypoints
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-ares-border/50">
              {filteredTargets.length === 0 ? (
                <div className="p-4 text-center text-xs text-ares-text-muted font-mono">
                  No features match "{searchQuery}"
                </div>
              ) : (
                filteredTargets.map((target) => (
                  <div
                    key={target.id}
                    onClick={() => {
                      onSelectTarget(target);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2.5 px-3 hover:bg-ares-surface-alt flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="truncate">
                      <div className="text-xs font-semibold text-ares-text flex items-center gap-1.5 truncate">
                        <MapPin className={`w-3 h-3 shrink-0 ${target.isUserCreated ? 'text-purple-400' : target.tier === 1 ? 'text-ares-accent' : 'text-ares-cyan'}`} />
                        <span className="truncate">{target.name}</span>
                      </div>
                      <div className="text-[10px] text-ares-text-muted font-mono truncate pl-4.5">
                        {target.category || 'Surface Feature'} • {target.elevation != null ? `${target.elevation.toLocaleString()} m (MOLA)` : 'MOLA Datum'}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-ares-cyan shrink-0 ml-2">
                      Jump →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-auto flex items-center space-x-2">
        <div className="hidden lg:flex items-center space-x-3 bg-ares-surface/90 backdrop-blur-md border border-ares-border px-3.5 py-1.5 rounded-2xl text-xs font-mono shadow-panel">
          <div className="flex items-center space-x-1.5 text-ares-cyan font-semibold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>SOL {marsTime.sol}</span>
          </div>
          <span className="text-ares-border">|</span>
          <span className="text-ares-text">{marsTime.ltst}</span>
          <span className="text-ares-border">|</span>
          <div className="flex items-center space-x-1 text-ares-warning font-semibold">
            <Activity className="w-3 h-3" />
            <span>{liveTelemetry?.radiationRateUsvPerHour || 27.1} μSv/h</span>
          </div>
        </div>

        {/* Dual View Mode Switcher: 3D Globe vs 2D Tactical Map */}
        {onChangeViewMode && (
          <div className="flex items-center bg-ares-surface/90 backdrop-blur-md border border-ares-border rounded-xl p-0.5 shadow-panel">
            <button
              onClick={() => onChangeViewMode('globe')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'globe'
                  ? 'bg-gradient-to-r from-ares-accent to-ares-accent-soft text-ares-bg font-bold shadow-glow-accent'
                  : 'text-ares-text-muted hover:text-white'
              }`}
              title="Switch to 3D Planetary Globe (Esri Explore Mars Engine)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Globe</span>
            </button>
            <button
              onClick={() => onChangeViewMode('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-ares-accent to-ares-accent-soft text-ares-bg font-bold shadow-glow-accent'
                  : 'text-ares-text-muted hover:text-white'
              }`}
              title="Switch to 2D Tactical Surface Map (Google Maps for Mars)"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2D Tactical</span>
            </button>
          </div>
        )}

        <button
          onClick={onOpenRadiation}
          className="px-3 py-2 rounded-xl bg-ares-surface/90 backdrop-blur-md hover:bg-ares-surface-alt border border-ares-border text-xs text-ares-text transition-all hover:border-ares-warning/60 hover:text-ares-warning font-mono shadow-panel flex items-center space-x-1.5"
          title="MSL RAD In-Situ Dosimetry"
        >
          <Activity className="w-3.5 h-3.5 text-ares-warning" />
          <span className="hidden sm:inline font-medium">RAD Dosimetry</span>
        </button>

        <button
          onClick={onOpenReport}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-ares-accent to-ares-accent-soft hover:opacity-95 text-xs text-ares-bg font-bold font-mono tracking-wide transition-all shadow-glow-accent flex items-center space-x-1.5"
          title="Marswalk EVA Mission Briefing Directive"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Briefing</span>
        </button>

        <button
          onClick={onToggleLandingPage}
          className="px-3 py-2 rounded-xl bg-ares-surface/90 backdrop-blur-md hover:bg-ares-surface-alt border border-ares-border text-xs text-ares-text-muted hover:text-white transition-colors font-mono shadow-panel flex items-center space-x-1.5"
          title="Switch to Landing Overview"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-medium">Overview</span>
        </button>
      </div>
    </header>
  );
}
