export const EASE_GLIDE=[0.22,1,0.36,1];export const EASE_SWIFT=[0.32,0.72,0,1];
export const SPRING_HUD={type:'spring',stiffness:420,damping:34,mass:0.9};
export const SPRING_PANEL={type:'spring',stiffness:300,damping:30,mass:0.9};
export const SPRING_PILL={type:'spring',stiffness:500,damping:38};
export const popover={hidden:{opacity:0,scale:0.96,y:-6},visible:{opacity:1,scale:1,y:0,transition:SPRING_HUD},exit:{opacity:0,scale:0.97,y:-4,transition:{duration:0.13,ease:'easeIn'}}};
export const collapse={hidden:{height:0,opacity:0},visible:{height:'auto',opacity:1,transition:{height:{duration:0.32,ease:EASE_SWIFT},opacity:{duration:0.24,delay:0.06}}},exit:{height:0,opacity:0,transition:{height:{duration:0.26,ease:EASE_SWIFT},opacity:{duration:0.14}}}};
export const staggerParent=(s=0.07,d=0.05)=>({hidden:{},visible:{transition:{staggerChildren:s,delayChildren:d}}});
