import React, { useState } from 'react';
import ModalShell from './ui/ModalShell';
import { 
  Activity, 
  ShieldAlert, 
  Sun, 
  AlertTriangle, 
  Info, 
  X, 
  Clock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { MSL_RAD_OBSERVATIONS, RAD_STANDARDS, calculateEvaRadiationDose } from '../data/radiationData';

export default function RadiationPanel({ isOpen, onClose, plannedRouteDurationHours = 3.5 }) {
  const [durationHours, setDurationHours] = useState(plannedRouteDurationHours || 3.5);
  const [isSpeActive, setIsSpeActive] = useState(false);


  const evaDosimetry = calculateEvaRadiationDose(durationHours, isSpeActive);

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" label="MSL RAD Dosimetry and Surface Radiation">
        <div className="px-5 py-4 border-b border-ares-border flex items-center justify-between bg-ares-surface-alt/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-ares-warning/20 border border-ares-warning/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-ares-warning" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ares-text uppercase tracking-wider">
                MSL RAD Dosimetry & Surface Radiation
              </h2>
              <p className="text-[11px] font-mono text-ares-text-muted">
                NASA Mars Science Laboratory Radiation Assessment Detector Archive
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

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed font-mono">
              <strong>NASA Data Provenance Note:</strong> Measurements below represent historical in-situ dosimetry gathered along Curiosity's traverse across Gale Crater. Martian radiation is driven by Galactic Cosmic Rays (GCR) and episodic Solar Particle Events (SPE). These are historical benchmark observations, not real-time active forecasts.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ares-surface-alt border border-ares-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ares-text">
                Astronaut EVA Dosage Calculator
              </span>
              <button
                onClick={() => setIsSpeActive(!isSpeActive)}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded border transition-all flex items-center gap-1.5 ${
                  isSpeActive
                    ? 'bg-ares-danger/20 border-ares-danger text-ares-danger animate-pulse'
                    : 'bg-ares-bg border-ares-border text-ares-text-muted hover:text-ares-text'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>SPE Solar Flare Mode: {isSpeActive ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-ares-text-muted">EVA Duration:</span>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                className="range-tactical flex-1"
                style={{ '--fill': `${((durationHours - 0.5) / 11.5) * 100}%` }}
              />
              <span className="font-bold text-ares-text w-16 text-right">
                {durationHours} hrs
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-lg bg-ares-bg/80 border border-ares-border text-center">
                <span className="text-[10px] font-mono text-ares-text-muted block">ACCUMULATED DOSE</span>
                <span className="text-lg font-mono font-bold text-ares-warning block mt-0.5">
                  {evaDosimetry.totalDoseUsv} μSv
                </span>
                <span className="text-[10px] text-ares-text-muted/80 font-mono">
                  ({evaDosimetry.totalDoseMsv} mSv)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-ares-bg/80 border border-ares-border text-center">
                <span className="text-[10px] font-mono text-ares-text-muted block">EARTH COMPARISON</span>
                <span className="text-lg font-mono font-bold text-ares-text block mt-0.5">
                  {evaDosimetry.earthDaysEquiv} Days
                </span>
                <span className="text-[10px] text-ares-text-muted/80 font-mono">
                  of natural background
                </span>
              </div>

              <div className="p-3 rounded-lg bg-ares-bg/80 border border-ares-border text-center">
                <span className="text-[10px] font-mono text-ares-text-muted block">CHEST X-RAYS</span>
                <span className="text-lg font-mono font-bold text-ares-cyan block mt-0.5">
                  {evaDosimetry.chestXrayEquiv}×
                </span>
                <span className="text-[10px] text-ares-text-muted/80 font-mono">
                  medical equivalent
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ares-text-muted">
              Curiosity Ground Readings (Historical MSL Dataset)
            </span>
            <div className="border border-ares-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-ares-surface-alt text-ares-text-muted text-[10px] uppercase border-b border-ares-border">
                  <tr>
                    <th className="py-2 px-3">Mission Sol</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3">Dose Rate</th>
                    <th className="py-2 px-3">Solar Event Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ares-border/60">
                  {MSL_RAD_OBSERVATIONS.map((obs) => (
                    <tr key={obs.sol} className="hover:bg-ares-surface-alt/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-ares-cyan">
                        Sol {obs.sol}
                      </td>
                      <td className="py-2.5 px-3 text-ares-text">
                        {obs.location}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-ares-warning">
                        {obs.doseEquivalentUsvDay} μSv/day
                      </td>
                      <td className="py-2.5 px-3 text-ares-text-muted text-[11px]">
                        {obs.solarActivity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-ares-border bg-ares-surface-alt/50 flex items-center justify-between text-xs font-mono">
          <span className="text-ares-text-muted">
            Standard GCR Rate: ~27.1 μSv/hour (0.65 mSv/day)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ares-accent text-ares-bg font-bold hover:bg-ares-accent-soft transition-colors"
          >
            Close Panel
          </button>
        </div>
      </ModalShell>
  );
}
