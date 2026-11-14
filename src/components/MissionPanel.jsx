import React from 'react';
import { 
  Compass, 
  Target, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { PRESET_MISSIONS } from '../data/missionData';

export default function MissionPanel({
  activeMissionId,
  onSelectMission,
  onLoadAndPlanMission,
  isCalculating
}) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 select-none">
      <div className="space-y-1 pb-2 border-b border-ares-border">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-ares-accent" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-ares-text">
            Marswalk Exploration Missions
          </h2>
        </div>
        <p className="text-xs text-ares-text-muted">
          Pre-formulated scientific expedition profiles based on NASA Curiosity findings and Mount Sharp orbital reconnaissance.
        </p>
      </div>

      <div className="space-y-3">
        {PRESET_MISSIONS.map((mission) => {
          const isActive = mission.id === activeMissionId;
          const isPrimary = mission.id === 'mission-boxwork-primary';

          return (
            <div
              key={mission.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-ares-surface-alt border-ares-accent shadow-panel ring-1 ring-ares-accent/50'
                  : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-ares-accent/20 text-ares-accent border border-ares-accent/30">
                    {mission.code}
                  </span>
                  {isPrimary && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      Blueprint Primary
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-ares-text-muted">
                  {mission.difficulty}
                </span>
              </div>

              <h3 className="text-xs font-bold text-ares-text leading-tight mb-1.5">
                {mission.name}
              </h3>

              <p className="text-xs text-ares-text leading-relaxed mb-2.5">
                {mission.objective}
              </p>

              <div className="space-y-1 py-2 border-t border-ares-border/60 text-[11px] font-mono text-ares-text-muted">
                {mission.keyCheckpoints.map((cp, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ares-accent shrink-0 mt-0.5" />
                    <span className="text-ares-text/90 leading-tight">{cp}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-ares-border/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-ares-cyan flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Mode: {mission.recommendedMode}
                </span>

                <button
                  onClick={() => onLoadAndPlanMission(mission)}
                  disabled={isCalculating}
                  className="px-3 py-1.5 rounded-lg bg-ares-accent hover:bg-ares-accent-soft text-ares-bg font-mono text-xs font-bold transition-all flex items-center space-x-1.5 shadow-glow-accent cursor-pointer"
                >
                  <span>{isActive ? 'Re-Plan Route' : 'Load & Plan'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

