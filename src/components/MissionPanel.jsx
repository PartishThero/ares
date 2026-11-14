import React from 'react';
import { 
  Compass, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Trash2, 
  ShieldCheck,
  Sparkles,
  Play
} from 'lucide-react';
import { PRESET_MISSIONS } from '../data/missionData';

export default function MissionPanel({
  activeMissionId,
  onSelectMission,
  onLoadAndPlanMission,
  isCalculating,
  customMissions = [],
  onOpenCreateMission,
  onDeleteCustomMission
}) {
  const allMissions = [...customMissions, ...PRESET_MISSIONS];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3.5 select-none font-sans">
      {/* 1. Header Card (Matching Design Capsule) */}
      <div className="p-3.5 rounded-2xl bg-ares-surface-alt/70 border border-ares-border space-y-1.5 shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-ares-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Planetary Field Expeditions
          </span>
          <button
            onClick={onOpenCreateMission}
            className="px-2.5 py-1 rounded-xl bg-ares-accent/20 hover:bg-ares-accent/30 border border-ares-accent/50 text-ares-accent text-[11px] font-mono font-bold flex items-center space-x-1 transition-all shadow-glow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Mission</span>
          </button>
        </div>

        <h2 className="text-sm font-bold text-ares-text leading-tight">
          NASA & Custom Marswalks
        </h2>

        <p className="text-[11px] text-ares-text-muted leading-relaxed">
          Pre-formulated scientific expedition traverses and custom astronaut EVA mission profiles.
        </p>
      </div>

      {/* 2. Mission Expeditions List */}
      <div className="space-y-3">
        {allMissions.map((mission) => {
          const isActive = mission.id === activeMissionId;
          const isPrimary = mission.id === 'mission-boxwork-primary';
          const isCustom = mission.isCustom;

          return (
            <div
              key={mission.id}
              onClick={() => onSelectMission(mission)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-ares-surface-alt border-ares-accent shadow-panel ring-1 ring-ares-accent/50'
                  : 'bg-ares-surface-alt/40 border-ares-border hover:bg-ares-surface-alt/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isCustom 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                      : 'bg-ares-accent/20 text-ares-accent border-ares-accent/40'
                  }`}>
                    {mission.code}
                  </span>
                  {isPrimary && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                      Primary
                    </span>
                  )}
                  {isCustom && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                      Custom
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-ares-text-muted">
                    {mission.difficulty}
                  </span>
                  {isCustom && onDeleteCustomMission && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomMission(mission.id);
                      }}
                      className="text-ares-danger hover:text-red-400 p-1"
                      title="Delete this custom mission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-xs font-bold text-ares-text font-sans mb-1">
                {mission.name}
              </h3>

              <p className="text-xs text-ares-text-muted leading-relaxed line-clamp-2 mb-3">
                {mission.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-ares-border/60">
                <div className="flex items-center space-x-3 text-[11px] font-mono text-ares-text-muted">
                  <span>Dist: <strong className="text-ares-text">{mission.estimatedDistanceKm} km</strong></span>
                  <span>Time: <strong className="text-ares-cyan">{mission.estimatedDurationHours} h</strong></span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadAndPlanMission(mission);
                  }}
                  disabled={isCalculating}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-ares-accent to-ares-accent-soft hover:opacity-95 text-ares-bg font-bold text-xs transition-all shadow-glow-sm flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Load</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
