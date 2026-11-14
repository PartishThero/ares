import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  AlertTriangle, 
  Compass, 
  Mountain, 
  Sun, 
  Moon,
  X,
  Sliders
} from 'lucide-react';
import { MARS_MAP_LAYERS } from '../services/marsTrek.js';

export default function LayerControls({
  activeLayerId,
  onSelectLayer,
  layerOpacity,
  onChangeOpacity,
  showHazards,
  onToggleHazards,
  showPOIs,
  onTogglePOIs,
  showGrid,
  onToggleGrid
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeLayer = MARS_MAP_LAYERS.find((l) => l.id === activeLayerId) || MARS_MAP_LAYERS[0];

  const getLayerIcon = (id) => {
    if (id.includes('mola')) return <Mountain className="w-4 h-4 text-emerald-400" />;
    if (id.includes('themis-day')) return <Sun className="w-4 h-4 text-amber-400" />;
    if (id.includes('themis-night')) return <Moon className="w-4 h-4 text-purple-400" />;
    return <Eye className="w-4 h-4 text-ares-accent" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-xl backdrop-blur-md border text-xs font-mono font-medium shadow-panel flex items-center space-x-2 transition-all ${
          isOpen
            ? 'bg-ares-accent text-ares-bg border-ares-accent shadow-glow-accent'
            : 'bg-ares-surface/90 hover:bg-ares-surface border-ares-border text-ares-text'
        }`}
        title="Scientific Map Layer Switcher"
      >
        <Layers className="w-4 h-4" />
        <span className="hidden sm:inline truncate max-w-[140px]">{activeLayer.name.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-ares-surface/95 backdrop-blur-md border border-ares-border rounded-2xl shadow-panel overflow-hidden z-40 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-ares-border pb-2.5">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-ares-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-ares-text">
                Scientific Map GIS
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-ares-text-muted hover:text-white rounded-lg hover:bg-ares-surface-alt transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ares-text-muted font-bold block">
              Active Dataset ({MARS_MAP_LAYERS.length} Available)
            </span>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {MARS_MAP_LAYERS.map((layer) => {
                const isSelected = layer.id === activeLayerId;
                return (
                  <button
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-ares-accent/20 border border-ares-accent/50 text-ares-text font-semibold'
                        : 'bg-ares-surface-alt/60 hover:bg-ares-surface-alt border border-transparent text-ares-text-muted hover:text-ares-text'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {getLayerIcon(layer.id)}
                      <div className="truncate">
                        <div className="text-xs truncate">{layer.name}</div>
                        <div className="text-[10px] text-ares-text-muted truncate font-mono">
                          {layer.instrument}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-ares-accent animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-ares-border font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-ares-text-muted">
              <span>Layer Opacity</span>
              <span className="text-ares-text font-bold">{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-ares-accent h-1.5 bg-ares-bg rounded-lg"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-ares-border font-mono text-xs">
            <span className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Feature Layers
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onToggleHazards}
                className={`p-2 rounded-lg border text-[11px] flex items-center justify-center space-x-1.5 transition-all ${
                  showHazards
                    ? 'bg-ares-danger/20 border-ares-danger text-ares-danger font-bold'
                    : 'bg-ares-surface-alt border-ares-border text-ares-text-muted'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Hazards {showHazards ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onTogglePOIs}
                className={`p-2 rounded-lg border text-[11px] flex items-center justify-center space-x-1.5 transition-all ${
                  showPOIs
                    ? 'bg-ares-cyan/20 border-ares-cyan text-ares-cyan font-bold'
                    : 'bg-ares-surface-alt border-ares-border text-ares-text-muted'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Targets {showPOIs ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
