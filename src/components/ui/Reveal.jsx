import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE_GLIDE } from './motion';
export default function Reveal({ children, className='', delay=0, y=28, once=true, amount=0.2, as='div' }) {
  const reduce = useReducedMotion(); const Comp = motion[as] || motion.div;
  return <Comp className={className} initial={reduce?false:{opacity:0,y}} whileInView={{opacity:1,y:0}} viewport={{once,amount}} transition={{duration:0.75,delay,ease:EASE_GLIDE}}>{children}</Comp>;
}
