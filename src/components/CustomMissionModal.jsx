import React, { useState } from 'react';
import ModalShell from './ui/ModalShell';
import { 
  Plus, 
  X, 
  Compass, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Target, 
  MapPin, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets.js';

export default function CustomMissionModal({
  isOpen,
  onClose,
  onSaveAndPlan,
  userPOIs = [],
  currentStartCoord,
  currentDestCoord
}) {
  const allTargets = [...SCIENTIFIC_TARGETS, ...userPOIs];
  const modalTargets = allTargets.filter(
    (t) => t.isUserCreated || t.tier <= 2 || t.category === 'Landing Site'
  );

  const [name, setName] = useState('Gediz Ridge Escarpment Recon');
  const [code, setCode] = useState(`EVA-MS-${Math.floor(Math.random() * 80 + 20)}`);
  const [objective, setObjective] = useState('Survey high-elevation boulder deposits and verify stratigraphy transition on Mount Sharp flank.');
  const [startId, setStartId] = useState('poi-alpha-base');
  const [destId, setDestId] = useState('poi-boxwork-alpha');
  const [difficulty, setDifficulty] = useState('Challenging (Class 3)');
  const [mode, setMode] = useState('Safest');
  const [checkpointsText, setCheckpointsText] = useState('1. Depart Base via northern saddle corridor\n2. Inspect boulder scree at waypoint marker\n3. Ascend to ridge summit and sample veins');


  const handleSubmit = (e) => {
    e.preventDefault();

    const startObj = allTargets.find((t) => t.id === startId) || allTargets[0];
    const destObj = allTargets.find((t) => t.id === destId) || allTargets[1];

    const checkpoints = checkpointsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newMission = {
      id: `mission-custom-${Date.now()}`,
      code: code.trim() || 'EVA-CUSTOM',
      name: name.trim() || 'Custom Martian Expedition',
      objective: objective.trim() || 'Surface reconnaissance traverse.',
      difficulty,
      recommendedMode: mode,
      startCoords: startObj.coordinates,
      destCoords: destObj.coordinates,
      targetWaypoints: [startObj.id, destObj.id],
      keyCheckpoints: checkpoints.length > 0 ? checkpoints : ['Traverse nominal path to destination.'],
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onSaveAndPlan(newMission);
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" label="Create Custom Marswalk Mission">
        <div className="px-5 py-4 border-b border-ares-border flex items-center justify-between bg-ares-surface-alt/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-ares-accent/40 p-1 flex items-center justify-center shadow-glow-accent overflow-hidden">
              <img 
                src="/recraft-svg-converter.svg" 
                alt="ARES Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ares-text uppercase tracking-wider">
                Create Custom Marswalk Mission
              </h2>
              <p className="text-[11px] font-mono text-ares-text-muted">
                Define an astronaut EVA trajectory and expedition protocol
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
                Mission Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mount Sharp Flank Survey"
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
                Mission ID Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="EVA-MS-04"
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-3 py-2 text-ares-cyan font-bold focus:outline-none focus:border-ares-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Expedition Objective
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Primary scientific and navigational objectives..."
              className="w-full bg-ares-bg border border-ares-border rounded-lg px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-ares-success" />
                Departure Base (Start)
              </label>
              <select
                value={startId}
                onChange={(e) => setStartId(e.target.value)}
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-2.5 py-2 text-ares-text focus:outline-none focus:border-ares-accent truncate"
              >
                {modalTargets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block flex items-center gap-1">
                <Target className="w-3 h-3 text-ares-accent" />
                Destination Target
              </label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-2.5 py-2 text-ares-text focus:outline-none focus:border-ares-accent truncate"
              >
                {modalTargets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
                Traverse Optimization Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-2.5 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
              >
                <option value="Safest">Safest Traverse (Avoid Hazards & Steep Slopes)</option>
                <option value="Shortest">Shortest Distance (Direct Line)</option>
                <option value="Science">High-Yield Science Recon</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
                Terrain Difficulty Rating
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-ares-bg border border-ares-border rounded-lg px-2.5 py-2 text-ares-text focus:outline-none focus:border-ares-accent"
              >
                <option value="Moderate (Class 2)">Moderate (Class 2)</option>
                <option value="Challenging (Class 3)">Challenging (Class 3)</option>
                <option value="Extreme Scarp (Class 4)">Extreme Scarp (Class 4)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase text-ares-text-muted font-bold block">
              Checkpoint Directives (One per line)
            </label>
            <textarea
              rows={3}
              value={checkpointsText}
              onChange={(e) => setCheckpointsText(e.target.value)}
              className="w-full bg-ares-bg border border-ares-border rounded-lg px-3 py-2 text-ares-text focus:outline-none focus:border-ares-accent text-[11px]"
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
              className="px-4 py-2 rounded-lg bg-ares-accent hover:bg-ares-accent-soft text-ares-bg font-bold transition-all shadow-glow-accent flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Launch Mission</span>
            </button>
          </div>
        </form>
      </ModalShell>
  );
}
