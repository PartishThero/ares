import React, { useState, useEffect } from 'react';
import ModalShell from './ui/ModalShell';
import { 
  MapPin, 
  X, 
  Sparkles, 
  Check, 
  Mountain, 
  Layers,
  AlertTriangle,
  Thermometer,
  Compass
} from 'lucide-react';
import { formatMarsCoords } from '../utils/coordinates.js';
import { estimateGaleElevation } from '../utils/calculations.js';

const QUICK_MINERALS = [
  'Hydrated Sulfates',
  'Hematite Spherules',
  'Clay Phyllosilicates',
  'Olivine-Rich Basalt',
  'Silica-Rich Sinter'
];

export default function AddPOIModal({
  isOpen,
  onClose,
  initialCoords = [137.3880, -4.7310],
  inspectionData = null,
  onSavePOI
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geological Sample');
  const [priority, setPriority] = useState('High Scientific Priority');
  const [scienceValue, setScienceValue] = useState(85);
  const [description, setDescription] = useState('');
  const [mineralogy, setMineralogy] = useState('');
  const [lon, setLon] = useState(initialCoords[0]);
  const [lat, setLat] = useState(initialCoords[1]);

  useEffect(() => {
    if (initialCoords) {
      setLon(initialCoords[0]);
      setLat(initialCoords[1]);
      setName(`Astronaut Waypoint (${initialCoords[0].toFixed(3)}°E, ${Math.abs(initialCoords[1]).toFixed(3)}°S)`);
    }
  }, [initialCoords]);


  const elevation = inspectionData?.elevationMeters != null 
    ? inspectionData.elevationMeters 
    : estimateGaleElevation(lon, lat);

  const geologyUnit = inspectionData?.geology?.unit?.split('(')[0] || 'Highland Impact Regolith';
  const hazardLevel = inspectionData?.hazard?.level || 'Low';
  const dayTemp = inspectionData?.thermal?.daytimeTempC ?? -14;
  const nightTemp = inspectionData?.thermal?.nighttimeTempC ?? -84;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPOI = {
      id: `poi-user-${Date.now()}`,
      name: name.trim(),
      category,
      priority,
      scienceValue: parseInt(scienceValue, 10),
      coordinates: [parseFloat(lon), parseFloat(lat)],
      elevation,
      description: description.trim() || 'Astronaut in-situ field survey waypoint.',
      mineralogy: mineralogy.trim() || 'Unclassified surface sample.',
      instruments: ['Astronaut Field Kit', 'Handheld XRF Spectrometer'],
      tier: 1,
      isUserCreated: true,
      createdAt: new Date().toISOString()
    };

    onSavePOI(newPOI);
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" label="Log Astronaut Field Waypoint">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-ares-border flex items-center justify-between bg-ares-surface-alt/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-ares-accent/20 border border-ares-accent/40 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-ares-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ares-text uppercase tracking-wider font-sans">
                Log Astronaut Field Waypoint
              </h2>
              <p className="text-[11px] text-ares-text-muted">
                Catalog in-situ surface science, rock sample, or terrain feature
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ares-text-muted hover:text-white hover:bg-ares-surface-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Region Telemetry Summary Banner (All Data Together) */}
        <div className="px-5 py-3 bg-ares-surface-alt/40 border-b border-ares-border space-y-1.5">
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Selected Region Context: {formatMarsCoords(lon, lat)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border">
              <span className="text-ares-text-muted block text-[9px] uppercase">Elevation (MOLA)</span>
              <span className="font-bold text-emerald-400">{elevation.toLocaleString()} m</span>
            </div>

            <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border">
              <span className="text-ares-text-muted block text-[9px] uppercase">Thermal Regime</span>
              <span className="font-bold text-amber-400">{dayTemp}°C / {nightTemp}°C</span>
            </div>

            <div className="p-2 rounded-lg bg-ares-bg/80 border border-ares-border">
              <span className="text-ares-text-muted block text-[9px] uppercase">Hazard & Risk</span>
              <span className="font-bold text-ares-cyan">{hazardLevel} Risk</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Waypoint Name */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Waypoint Feature Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ridge Fracture Outcrop Bravo"
              className="w-full bg-ares-bg border border-ares-border rounded-xl px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent transition-colors"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-ares-bg border border-ares-border rounded-xl px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent transition-colors"
              >
                <option value="Geological Sample">Geological Sample</option>
                <option value="Rock Outcrop">Rock Outcrop</option>
                <option value="Shelter / Overhang">Shelter / Overhang</option>
                <option value="Water Ice Prospect">Water Ice Prospect</option>
                <option value="Equipment Cache">Equipment Cache</option>
                <option value="Hazardous Zone">Hazardous Zone</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-ares-bg border border-ares-border rounded-xl px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent transition-colors"
              >
                <option value="Critical Primary Target">Critical Primary</option>
                <option value="High Scientific Priority">High Priority</option>
                <option value="Standard Observation">Standard Observation</option>
                <option value="Low Priority">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Scientific Valuation Slider */}
          <div className="p-3 rounded-xl bg-ares-surface-alt/40 border border-ares-border space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold">
                Scientific Valuation Score
              </label>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                scienceValue >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                scienceValue >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {scienceValue} / 100
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={scienceValue}
              onChange={(e) => setScienceValue(e.target.value)}
              className="w-full accent-ares-accent h-1.5 bg-ares-bg rounded-lg cursor-pointer"
            />
          </div>

          {/* Description & Field Notes */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Field Notes / Stratigraphy Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Visual observations, bedding planes, fracture orientation, roughness..."
              className="w-full bg-ares-bg border border-ares-border rounded-xl px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent transition-colors font-sans"
            />
          </div>

          {/* Mineralogy with Clickable Quick Fill Chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Estimated Mineralogy
            </label>
            <input
              type="text"
              value={mineralogy}
              onChange={(e) => setMineralogy(e.target.value)}
              placeholder="e.g. Sulfate veins, iron-bearing basalt float"
              className="w-full bg-ares-bg border border-ares-border rounded-xl px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_MINERALS.map((mineral) => (
                <button
                  type="button"
                  key={mineral}
                  onClick={() => {
                    setMineralogy((prev) => prev ? `${prev}, ${mineral}` : mineral);
                  }}
                  className="px-2 py-0.5 rounded-md bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-[10px] text-ares-text-muted hover:text-white transition-all"
                >
                  + {mineral}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-ares-border flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ares-surface-alt hover:bg-ares-border text-ares-text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-ares-accent to-ares-accent-soft hover:opacity-95 text-ares-bg font-bold transition-all shadow-glow-sm flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Waypoint to Map</span>
            </button>
          </div>
        </form>
      </ModalShell>
  );
}
