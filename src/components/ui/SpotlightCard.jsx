import React, { useRef, useCallback } from 'react';
export default function SpotlightCard({ children, className='', onClick, spotlight='rgba(255,122,48,0.13)', borderGlow='rgba(255,122,48,0.45)', ariaLabel, tabIndex }) {
  const ref=useRef(null), glowRef=useRef(null), frame=useRef(0), last=useRef(null);
  const move=useCallback((e)=>{ last.current={x:e.clientX,y:e.clientY}; if(frame.current) return;
    frame.current=requestAnimationFrame(()=>{ frame.current=0; const n=ref.current,g=glowRef.current,ev=last.current; if(!n||!g||!ev) return;
      const r=n.getBoundingClientRect(),x=ev.x-r.left,y=ev.y-r.top;
      g.style.background=`radial-gradient(460px circle at ${x}px ${y}px, ${spotlight}, transparent 62%)`;
      n.style.setProperty('--spot-x',`${x}px`); n.style.setProperty('--spot-y',`${y}px`); }); },[spotlight]);
  const enter=useCallback(()=>{ if(glowRef.current) glowRef.current.style.opacity='1'; if(ref.current) ref.current.style.setProperty('--spot-border',borderGlow); },[borderGlow]);
  const leave=useCallback(()=>{ if(glowRef.current) glowRef.current.style.opacity='0'; },[]);
  const interactive=Boolean(onClick);
  return <div ref={ref} onClick={onClick} onMouseMove={move} onMouseEnter={enter} onMouseLeave={leave}
    role={interactive?'button':undefined} aria-label={ariaLabel} tabIndex={tabIndex ?? (interactive?0:undefined)}
    onKeyDown={interactive?(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onClick(e);}}:undefined}
    className={`spotlight-card group relative overflow-hidden ${interactive?'cursor-pointer':''} ${className}`}>
    <div ref={glowRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300" />
    <div className="relative z-10 flex h-full flex-col">{children}</div>
  </div>;
}
