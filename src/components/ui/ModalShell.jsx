import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SPRING_PANEL } from './motion';
export default function ModalShell({ isOpen, onClose, children, maxWidth='max-w-2xl', label='Mission panel', className='' }) {
  const panelRef=useRef(null), restoreRef=useRef(null);
  useEffect(()=>{ if(!isOpen) return undefined;
    restoreRef.current=document.activeElement; const {overflow}=document.body.style; document.body.style.overflow='hidden';
    const onKey=(e)=>{ if(e.key==='Escape'){e.stopPropagation();onClose?.();return;}
      if(e.key==='Tab'&&panelRef.current){ const f=panelRef.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); if(!f.length) return;
        const first=f[0],last=f[f.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();} } };
    document.addEventListener('keydown',onKey,true); const raf=requestAnimationFrame(()=>panelRef.current?.focus?.());
    return ()=>{ document.removeEventListener('keydown',onKey,true); document.body.style.overflow=overflow; cancelAnimationFrame(raf); if(restoreRef.current instanceof HTMLElement) restoreRef.current.focus?.(); };
  },[isOpen,onClose]);
  return createPortal(<AnimatePresence>
    {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.22}} onClick={onClose} aria-hidden="true" />
      <motion.div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label}
        className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-ares-border bg-ares-surface shadow-panel outline-none flex flex-col max-h-[92vh] ${className}`}
        initial={{opacity:0,scale:0.95,y:18}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:10,transition:{duration:0.16,ease:'easeIn'}}} transition={SPRING_PANEL}>
        {children}
      </motion.div>
    </div>}
  </AnimatePresence>, document.body);
}
