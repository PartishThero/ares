import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Navigation, X } from 'lucide-react';
import { SPRING_HUD } from './motion';
export default function RouteToast({ prompt, onClear }) {
  useEffect(()=>{ if(!prompt) return undefined; const t=setTimeout(()=>onClear?.(),4200); return ()=>clearTimeout(t); },[prompt,onClear]);
  return <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[70] flex justify-center px-4">
    <AnimatePresence>
      {prompt && <motion.div key={`${prompt.type}-${prompt.message}`} initial={{opacity:0,y:24,scale:0.94}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12,scale:0.96,transition:{duration:0.18}}} transition={SPRING_HUD}
        className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl border border-ares-success/40 bg-ares-surface/95 px-4 py-2.5 shadow-panel backdrop-blur-xl" role="status" aria-live="polite">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ares-success/15">
          {prompt.type==='start_set'||prompt.type==='start_updated'?<Navigation className="h-3.5 w-3.5 text-ares-success"/>:<CheckCircle2 className="h-3.5 w-3.5 text-ares-success"/>}
        </span>
        <span className="font-mono text-[11px] leading-snug text-ares-text">{prompt.message}</span>
        <button onClick={()=>onClear?.()} className="ml-1 rounded-md p-1 text-ares-text-muted transition-colors hover:bg-ares-surface-alt hover:text-ares-text" aria-label="Dismiss notification"><X className="h-3.5 w-3.5" /></button>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
