import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  X, 
  AlertTriangle, 
  Compass, 
  ShieldCheck, 
  Mountain,
  Activity
} from 'lucide-react';
import { formatMarsCoords } from '../utils/coordinates';

export default function MissionReportModal({
  isOpen,
  onClose,
  activeMission,
  plannedRoute,
  routeScore,
  startCoord,
  destCoord
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const distKm = plannedRoute?.metrics?.totalDistanceKm || 5.2;
  const durationH = plannedRoute?.metrics?.estimatedDurationHours || 4.2;
  const maxSlope = plannedRoute?.metrics?.maxSlopeDeg || 14.5;
  const avgSlope = plannedRoute?.metrics?.avgSlopeDeg || 7.2;
  const calories = plannedRoute?.metrics?.estimatedCaloriesKcal || 1450;
  const hazardPercent = plannedRoute?.metrics?.hazardExposurePercent || 8;
  const score = routeScore?.score || 88;
  const missionCode = activeMission?.code || 'EVA-MARS-ALPHA';
  const missionName = activeMission?.name || 'Mount Sharp Boxwork Exploration';

  const reportMarkdown = `# ARES MARSWALK EVA MISSION BRIEFING DIRECTIVE
**Mission ID:** ${missionCode}
**Operation:** ${missionName}
**Target Body:** Mars (Gale Crater — Mount Sharp Sector)
**Planning Platform:** Autonomous Route Exploration System (ARES v2.6)
**Operational Status:** APPROVED FOR FLIGHT PLANNING

---

## 1. TRAVERSE SPECIFICATIONS & SUMMARY
* **Start Point (EVA Base):** ${startCoord ? formatMarsCoords(startCoord[0], startCoord[1]) : 'Glen Torridon Base'}
* **Destination Target:** ${destCoord ? formatMarsCoords(destCoord[0], destCoord[1]) : 'Mount Sharp Boxwork Formations (Alpha)'}
* **Total Traverse Distance:** ${distKm} km
* **Estimated EVA Walk Duration:** ${durationH} hours (nominal walking rate @ 0.38g)
* **Average Slope Grade:** ${avgSlope}°
* **Peak Slope Encountered:** ${maxSlope}°
* **Estimated Metabolic Consumption:** ${calories} kcal
* **ARES Route Planning Score:** ${score} / 100 (${routeScore?.grade || 'A - Optimal'})

---

## 2. TERRAIN HAZARDS & OBSTACLE MITIGATION
* **Identified Hazard Exposure:** ${hazardPercent}% of total traverse
* **Bagnold Active Dunes Mitigation:** Traversal route detours around loose basaltic sand slip-faces. Crew must remain on consolidated interdune sandstone.
* **Escarpment Slope Protocol:** Incline grades exceed 14° on final approach. Crew to utilize switchback footpaths and dual trekking stabilizers.
* **Surface Roughness:** High fracture-density boxwork mineral blades. Step into shadowed interior pockets strictly prohibited.

---

## 3. ENVIRONMENTAL RADIATION ASSESSMENT (MSL RAD PROVENANCE)
* **Galactic Cosmic Ray (GCR) Background:** ~27.1 μSv / hour
* **Projected Crew EVA Dose Equivalent:** ~${Math.round(durationH * 27.1)} μSv (${(durationH * 0.0271).toFixed(3)} mSv)
* **Solar Particle Event (SPE) Protocol:** If REMS/RAD detects dose rate surge > 80 μSv/hour, initiate IMMEDIATE abort to pressurized habitat shelter.

---

## 4. SCIENTIFIC SAMPLING CHECKPOINTS
1. **Checkpoint Alpha (Station 1):** Ascend through clay-to-sulfate stratigraphic transition boundary. Document ripple crest orientations.
2. **Checkpoint Bravo (Station 2):** Drill core sample into polyhydrated sulfate bedrock.
3. **Primary Station (Boxwork Alpha):** High-resolution macroscopic imaging of intersecting mineral veins. Collect 3x float fragments for XRD spectrometry.

---

## 5. CONTINGENCY ABORT CRITERIA
* Continuous slope incline > 22°
* Suit pressure drop or bio-metabolic heart rate > 165 bpm
* Dust storm opacity (Tau) > 1.8 with visibility < 50 meters
* Communication loss with surface relay rover > 15 minutes

*ARES Decision-Support System • NASA Space Apps Challenge 2026*
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([reportMarkdown], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${missionCode}_Mission_Briefing.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-3xl bg-ares-surface border border-ares-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[92vh]">
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
                Marswalk Operational EVA Briefing Directive
              </h2>
              <p className="text-[11px] font-mono text-ares-text-muted">
                Mission Directive: {missionCode} • Gale Crater Exploration
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

        <div className="p-6 overflow-y-auto font-mono text-xs text-ares-text space-y-5 bg-ares-bg/50">
          <div className="p-4 rounded-xl bg-ares-surface-alt border border-ares-border space-y-2">
            <div className="flex items-center justify-between border-b border-ares-border/60 pb-2">
              <span className="text-ares-accent font-bold text-sm">
                ARES TACTICAL EVA DIRECTIVE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-ares-success/20 text-ares-success border border-ares-success/40">
                STATUS: FLIGHT READY
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div><span className="text-ares-text-muted">Distance:</span> <span className="font-bold text-ares-text">{distKm} km</span></div>
              <div><span className="text-ares-text-muted">Duration:</span> <span className="font-bold text-ares-cyan">{durationH} h</span></div>
              <div><span className="text-ares-text-muted">Max Slope:</span> <span className="font-bold text-ares-warning">{maxSlope}°</span></div>
              <div><span className="text-ares-text-muted">Score:</span> <span className="font-bold text-ares-success">{score}/100</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-ares-cyan font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                1. Navigation Plan & Checkpoints
              </h3>
              <p className="text-ares-text-muted leading-relaxed">
                Traverse follows the optimal terrain-weighted corridor avoiding active slip-faces of the Bagnold Dune complex. The path ascends gently along the sulfate-bearing unit bench before accessing the boxwork ridge structures.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-ares-danger font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                2. Hazard Mitigation & Crew Safety
              </h3>
              <p className="text-ares-text-muted leading-relaxed">
                Max recorded slope is {maxSlope}°. Crew shall maintain 3-point contact on slopes exceeding 12°. Boot sinkage risk in eolian dust pockets requires maintaining transit on exposed sedimentary bedrock.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-ares-warning font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                3. Radiation Dosimetry Protocol
              </h3>
              <p className="text-ares-text-muted leading-relaxed">
                Projected cumulative EVA dose is ~{Math.round(durationH * 27.1)} μSv. In the event of an unscheduled SPE solar energetic proton alert, crew shall seek immediate shelter in the nearest geological overhang or return to EVA Base.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-ares-border bg-ares-surface-alt/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-ares-text transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ares-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-ares-surface-alt hover:bg-ares-border border border-ares-border text-ares-text transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ares-accent hover:bg-ares-accent-soft text-ares-bg font-bold transition-all shadow-glow-accent cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

