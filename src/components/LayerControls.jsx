import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  AlertTriangle, 
  Compass, 
  Grid, 
  Mountain, 
  Sun, 
  Moon,
  ChevronDown,
  ChevronUp
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
  const [isOpen, setIsOpen] = useState(true);
  const activeLayer = MARS_MAP_LAYERS.find((l) => l.id === activeLayerId) || MARS_MAP_LAYERS[0];

  const getLayerIcon = (id) => {
    if (id.includes('mola')) return <Mountain className="w-4 h-4 text-emerald-400" />;
    if (id.includes('themis-day')) return <Sun className="w-4 h-4 text-amber-400" />;
    if (id.includes('themis-night')) return <Moon className="w-4 h-4 text-purple-400" />;
    return <Eye className="w-4 h-4 text-ares-accent" />;
  };

  return (
    <div className="bg-ares-surface/95 backdrop-blur-md border border-ares-border rounded-xl shadow-panel overflow-hidden transition-all duration-200">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer border-b border-ares-border hover:bg-ares-surface-alt/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-ares-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-ares-text">
            Scientific Map Layers
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ares-surface-alt text-ares-text-muted">
            NASA Trek WMTS
          </span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-ares-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-ares-text-muted" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-3.5 space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-ares-text-muted">
              Active Dataset ({MARS_MAP_LAYERS.length} Available)
            </label>
            <div className="space-y-1">
              {MARS_MAP_LAYERS.map((layer) => {
                const isSelected = layer.id === activeLayerId;
                return (
                  <button
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-ares-accent/20 border border-ares-accent/50 text-ares-text font-semibold shadow-sm'
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

          <div className="space-y-1 pt-1 border-t border-ares-border">
            <div className="flex items-center justify-between text-[11px] font-mono text-ares-text-muted">
              <span>Layer Opacity</span>
              <span>{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              className="w-full accent-ares-accent h-1.5 bg-ares-surface-alt rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 pt-1 border-t border-ares-border">
            <label className="text-[11px] font-mono uppercase tracking-wider text-ares-text-muted">
              Display Overlays
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={onToggleHazards}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  showHazards
                    ? 'bg-ares-danger/15 border-ares-danger/40 text-ares-danger'
                    : 'bg-ares-surface-alt/40 border-ares-border text-ares-text-muted hover:text-ares-text'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-mono font-medium">Hazards</span>
              </button>

              <button
                onClick={onTogglePOIs}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  showPOIs
                    ? 'bg-ares-cyan/15 border-ares-cyan/40 text-ares-cyan'
                    : 'bg-ares-surface-alt/40 border-ares-border text-ares-text-muted hover:text-ares-text'
                }`}
              >
                <Compass className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-mono font-medium">POIs</span>
              </button>

              <button
                onClick={onToggleGrid}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  showGrid
                    ? 'bg-ares-accent/15 border-ares-accent/40 text-ares-accent'
                    : 'bg-ares-surface-alt/40 border-ares-border text-ares-text-muted hover:text-ares-text'
                }`}
              >
                <Grid className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-mono font-medium">Grid</span>
              </button>
            </div>
          </div>

          {activeLayer.legend && (
            <div className="p-2.5 rounded-lg bg-ares-bg/80 border border-ares-border space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-ares-text-muted">
                <span className="font-semibold text-ares-text">DATASET PALETTE</span>
                <span>{activeLayer.type}</span>
              </div>
              <div 
                className="h-2.5 rounded w-full shadow-inner"
                style={{
                  background: `linear-gradient(to right, ${activeLayer.legend.colors.join(', ')})`
                }}
              />
              <div className="flex items-center justify-between text-[9px] font-mono text-ares-text-muted">
                <span>{activeLayer.legend.labels[0]}</span>
                <span>{activeLayer.legend.labels[activeLayer.legend.labels.length - 1]}</span>
              </div>
              <div className="text-[9px] text-ares-text-muted/80 font-mono italic truncate pt-0.5 border-t border-ares-border/50">
                Source: {activeLayer.provenance}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
