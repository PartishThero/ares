import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
export default function ScrollProgress({ containerRef }) {
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness:140, damping:28, mass:0.4 });
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-ares-accent-soft via-ares-neon to-ares-cyan" style={{scaleX}} aria-hidden="true" />;
}
