import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { EASE_GLIDE } from './motion';
export default function AnimatedNumber({ value, decimals=0, duration=0.9, className='', prefix='', suffix='' }) {
  const reduce = useReducedMotion();
  const numeric = typeof value==='number'?value:parseFloat(value);
  const isValid = Number.isFinite(numeric);
  const mv = useMotionValue(isValid?numeric:0);
  const text = useTransform(mv,(v)=>`${prefix}${v.toFixed(decimals)}${suffix}`);
  useEffect(()=>{ if(!isValid) return undefined; if(reduce){mv.set(numeric);return undefined;} const c=animate(mv,numeric,{duration,ease:EASE_GLIDE}); return ()=>c.stop(); },[numeric,isValid,reduce,duration,mv]);
  if(!isValid) return <span className={className}>{value}</span>;
  return <motion.span className={className}>{text}</motion.span>;
}
