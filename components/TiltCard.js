'use client';
import { motion } from 'motion/react';

// Hover-lift card wrapper — preserves all existing card styles
export default function TiltCard({ children, className = '', style = {} }) {
  return (
    <motion.div
      className={className}
      style={style}
      whileHover={{
        y: -6,
        boxShadow: '0 1rem 3rem rgba(0,0,0,.14)',
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
