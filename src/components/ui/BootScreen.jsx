import React from 'react';
import { motion } from 'framer-motion';
export default function BootScreen({ title='ARES // MARSWALK', subtitle='Initializing planetary module', detail='Streaming NASA telemetry & terrain meshes…', compact=false }) {
  return <div className={`relative flex w-full flex-col items-center justify-center overflow-hidden bg-ares-bg ${compact?'h-full min-h-[240px]':'h-full min-h-screen'}`}>
    <div className="hud-grid-pattern absolute inset-0 opacity-40" aria-hidden="true" />
    <div className="absolute inset-0 bg-radial-vignette" aria-hidden="true" />
    <div className="relative z-10 flex flex-col items-center px-6 text-center">
      <div className="relative mb-6">
        <motion.div className="absolute -inset-4 rounded-full border border-ares-accent/25" animate={{scale:[1,1.25,1],opacity:[0.5,0,0.5]}} transition={{duration:2.4,repeat:Infinity,ease:'easeInOut'}} aria-hidden="true" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ares-accent/40 bg-white p-1.5 shadow-glow-accent"><img src="/recraft-svg-converter.svg" alt="ARES emblem" className="h-full w-full object-contain" /></div>
      </div>
      <div className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-ares-text">{title}</div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ares-accent">{subtitle}</div>
      <div className="mt-6 h-[3px] w-56 overflow-hidden rounded-full bg-ares-surface-alt" role="progressbar" aria-label="Loading module">
        <motion.div className="h-full w-1/3 rounded-full bg-gradient-to-r from-ares-accent-soft via-ares-neon to-ares-accent" animate={{x:['-110%','320%']}} transition={{duration:1.3,repeat:Infinity,ease:'easeInOut'}} />
      </div>
      <div className="mt-4 font-mono text-[10px] text-ares-text-muted">{detail}</div>
    </div>
  </div>;
}
