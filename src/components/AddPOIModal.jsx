import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  X, 
  Sparkles, 
  Check, 
  Mountain, 
  Layers 
} from 'lucide-react';
import { formatMarsCoords } from '../utils/coordinates.js';
import { estimateGaleElevation } from '../utils/calculations.js';

export default function AddPOIModal({
  isOpen,
  onClose,
  initialCoords = [137.3880, -4.7310],
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

  if (!isOpen) return null;

  const elevation = estimateGaleElevation(lon, lat);

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
      description: description.trim() || 'Astronaut field survey waypoint.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-ares-surface border border-ares-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-5 py-4 border-b border-ares-border flex items-center justify-between bg-ares-surface-alt/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ares-text uppercase tracking-wider">
                Log New Astronaut Waypoint
              </h2>
              <p className="text-[11px] font-mono text-ares-text-muted">
                Add an in-situ geological feature or field point of interest
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ares-text-muted hover:text-ares-text hover:bg-ares-surface-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Feature Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ridge Fracture Outcrop Bravo"
              className="w-full bg-ares-bg border border-ares-border rounded-lg px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-ares-bg/80 border border-ares-border text-[11px]">
            <div>
              <span className="text-ares-text-muted text-[10px] block">COORDINATES</span>
              <span className="font-bold text-ares-cyan">{formatMarsCoords(lon, lat)}</span>
            </div>
            <div>
              <span className="text-ares-text-muted text-[10px] block">ESTIMATED ELEVATION</span>
              <span className="font-bold text-emerald-400">{elevation.toLocaleString()} m (MOLA)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-2.5 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
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
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-2.5 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
              >
                <option value="Critical Primary Target">Critical Primary</option>
                <option value="High Scientific Priority">High Priority</option>
                <option value="Standard Observation">Standard Observation</option>
                <option value="Low Priority">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold">
                Scientific Valuation
              </label>
              <span className="font-bold text-ares-accent">{scienceValue} / 100</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={scienceValue}
              onChange={(e) => setScienceValue(e.target.value)}
              className="w-full accent-ares-accent h-1.5 bg-ares-bg rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Field Notes / Stratigraphy Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Visual observations, fracture orientation, roughness..."
              className="w-full bg-ares-bg border border-ares-border rounded-lg px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Estimated Mineralogy
            </label>
            <input
              type="text"
              value={mineralogy}
              onChange={(e) => setMineralogy(e.target.value)}
              placeholder="e.g. Sulfate veins, iron-bearing basalt float"
              className="w-full bg-ares-bg border border-ares-border rounded-lg px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
            />
          </div>

          <div className="pt-3 border-t border-ares-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-ares-surface-alt hover:bg-ares-border text-ares-text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-glow flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Waypoint to Map</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

