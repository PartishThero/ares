import React, { useState, useRef, useEffect, useMemo } from 'react';
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

let headerStaticGazetteerCache = null;

function Header({
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
  onChangeViewMode,
  onPrefetchGlobe
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [remoteResults, setRemoteResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag=(e.target?.tagName||'').toLowerCase();
      const typing=tag==='input'||tag==='textarea'||e.target?.isContentEditable;
      if(e.key==='/'&&!typing){e.preventDefault();searchInputRef.current?.focus();setIsSearchOpen(true);}
      else if(e.key==='Escape'){setIsSearchOpen(false);searchInputRef.current?.blur();}
    };
    window.addEventListener('keydown',onKey); return ()=>window.removeEventListener('keydown',onKey);
  }, []);

  // Dynamically query USGS Gazetteer API with debouncing and request cancellation
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setRemoteResults([]);
      setIsLoadingSearch(false);
      return;
    }

    setIsLoadingSearch(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        let data = null;
        try {
          const res = await fetch(`/api/features/search?q=${encodeURIComponent(query)}&limit=35`, {
            signal: controller.signal
          });
          if (res.ok) {
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              data = await res.json();
            }
          }
        } catch (fetchErr) {
          if (fetchErr.name === 'AbortError') throw fetchErr;
        }

        // Seamless fallback to static CDN dataset on Vercel deployments
        if (!data || !Array.isArray(data.features)) {
          if (!headerStaticGazetteerCache) {
            try {
              const sRes = await fetch('/data/usgs_mars_nomenclature.json', { signal: controller.signal });
              if (sRes.ok) {
                const sJson = await sRes.json();
                headerStaticGazetteerCache = sJson.features || [];
              }
            } catch (sErr) {
              if (sErr.name === 'AbortError') throw sErr;
            }
          }

          if (headerStaticGazetteerCache) {
            const qLower = query.toLowerCase();
            const matched = headerStaticGazetteerCache.filter((f) => {
              const p = f.properties;
              return (p.name || '').toLowerCase().includes(qLower) ||
                     (p.clean_name || '').toLowerCase().includes(qLower) ||
                     (p.quad_name || '').toLowerCase().includes(qLower);
            }).slice(0, 35);

            data = { features: matched };
          }
        }

        if (data && Array.isArray(data.features)) {
          const formatted = data.features.map((f) => ({
            id: f.properties.usgs_id || `usgs-${f.id}`,
            name: f.properties.name || f.properties.clean_name,
            category: f.properties.category || f.properties.type,
            coordinates: f.geometry.coordinates,
            tier: f.properties.tier,
            diameter: f.properties.diameter_km,
            origin: f.properties.origin,
            link: f.properties.link,
            quadName: f.properties.quad_name,
            isUSGS: true
          }));
          setRemoteResults(formatted);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('USGS Gazetteer search error:', err);
        }
      } finally {
        setIsLoadingSearch(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const combinedSearchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const localMatches = allTargets.filter((t) => {
      if (!q) return true;
      const cat = (t.category || '').toLowerCase();
      const name = (t.name || '').toLowerCase();
      return name.includes(q) || cat.includes(q);
    });

    const localNames = new Set(localMatches.map((t) => (t.name || '').toLowerCase()));
    const nonDupeRemote = remoteResults.filter(
      (r) => !localNames.has((r.name || '').toLowerCase())
    );

    const merged = [...localMatches, ...nonDupeRemote];

    return merged.filter((t) => {
      if (activeFilter === 'landmarks') return t.tier === 1;
      if (activeFilter === 'user') return t.isUserCreated;
      if (activeFilter === 'science') {
        const cat = (t.category || '').toLowerCase();
        return cat.includes('formation') || cat.includes('stratigraphic') || cat.includes('lakebed') || cat.includes('channel') || cat.includes('vallis') || t.tier <= 2;
      }
      if (activeFilter === 'drills') return (t.category || '').toLowerCase().includes('drill');
      return true;
    }).slice(0, 40);
  }, [allTargets, remoteResults, searchQuery, activeFilter]);

  return (
    <header className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none select-none">
      <div 
        ref={searchContainerRef}
        className="pointer-events-auto flex items-center bg-ares-surface/95 backdrop-blur-xl border border-ares-border hover:border-ares-border/90 focus-within:border-ares-accent/70 focus-within:shadow-glow-accent rounded-2xl shadow-panel px-3 py-1.5 transition-all w-full sm:w-[420px] md:w-[460px] relative"
      >
        <button
          type="button"
          onClick={onToggleLandingPage || onResetView}
          title="ARES — Return to Mission Overview"
          className="flex items-center space-x-2 shrink-0 group focus:outline-none cursor-pointer mr-1.5"
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
          <Search className="w-3.5 h-3.5 text-ares-text-muted shrink-0 mr-1.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Search craters, ridges, drill sites..."
            className="w-full bg-transparent border-0 p-0 text-xs text-ares-text font-mono placeholder:text-ares-text-muted/60 focus:outline-none focus:ring-0"
          />
          {!searchQuery && (<span className="kbd-chip pointer-events-none absolute right-1 hidden sm:inline-flex" aria-hidden="true">/</span>)}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-1 text-ares-text-muted hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-ares-border/70 mx-1.5 shrink-0" />

        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={onOpenDirections}
            className="p-1.5 rounded-lg text-ares-text-muted hover:text-white hover:bg-ares-surface-alt transition-colors"
            title="Directions / Route Planner"
          >
            <Navigation className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleUnchartedMode}
            className={`p-1.5 rounded-lg border transition-all ${
              interactionMode === 'explore_uncharted'
                ? 'bg-ares-accent text-ares-bg border-ares-accent animate-pulse font-bold'
                : 'border-transparent text-ares-text-muted hover:text-white hover:bg-ares-surface-alt'
            }`}
            title="Explore Uncharted Sector (Click anywhere on terrain to compute traverse)"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenAddPOI && onOpenAddPOI()}
            className="p-1.5 rounded-lg text-ares-text-muted hover:text-white hover:bg-ares-surface-alt transition-colors"
            title="Add Custom Astronaut Waypoint"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-ares-surface/98 backdrop-blur-2xl border border-ares-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 flex flex-col animate-pop-in origin-top">
            <div className="px-3 py-2 bg-ares-surface-alt/70 border-b border-ares-border/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[11px] font-mono">
              {[
                { id: 'all', label: `All (${combinedSearchResults.length})` },
                { id: 'landmarks', label: 'Landmarks' },
                { id: 'science', label: 'Science' },
                { id: 'drills', label: 'Drill Sites' },
                { id: 'user', label: 'My Waypoints' }
              ].map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 text-[11px] font-mono whitespace-nowrap ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold border border-white/20'
                        : 'text-ares-text-muted hover:text-ares-text hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-y-auto divide-y divide-ares-border/30 max-h-64">
              {isLoadingSearch && (
                <div className="p-2.5 px-3 bg-ares-surface-alt/40 flex items-center justify-between text-xs text-white/70 font-mono">
                  <span>Searching USGS Gazetteer & planetary databases...</span>
                  <span className="animate-spin text-sm">⟳</span>
                </div>
              )}
              {combinedSearchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-ares-text-muted font-mono">
                  {isLoadingSearch ? 'Querying USGS Gazetteer...' : `No features match "${searchQuery}"`}
                </div>
              ) : (
                combinedSearchResults.map((target) => (
                  <div
                    key={target.id}
                    onClick={() => {
                      onSelectTarget(target);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-2.5 px-3.5 hover:bg-ares-surface-alt/80 flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="truncate flex-1 min-w-0 pr-3">
                      <div className="text-xs font-medium text-ares-text group-hover:text-white flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-ares-text-muted shrink-0 group-hover:text-ares-accent transition-colors" />
                        <span className="truncate">{target.name}</span>
                        {target.isUSGS && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-ares-border/60 text-ares-text-muted font-mono shrink-0">
                            USGS
                          </span>
                        )}
                        {target.isUserCreated && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-ares-accent/20 text-ares-accent font-mono shrink-0">
                            User
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-ares-text-muted font-mono truncate pl-5 mt-0.5">
                        {target.category || 'Surface Feature'}
                        {target.diameter ? ` • ${Math.round(target.diameter)} km Ø` : ''}
                        {target.quadName ? ` • ${target.quadName} Quad` : ''}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 text-[11px] font-mono text-ares-text-muted group-hover:text-ares-accent transition-colors">
                      <span>{target.elevation != null ? `${target.elevation.toLocaleString()}m` : 'Target'}</span>
                      <span className="text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
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
              onMouseEnter={() => onPrefetchGlobe?.()}
              onFocus={() => onPrefetchGlobe?.()}
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

export default React.memo(Header);
