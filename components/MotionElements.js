'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export function RevealOnScroll({ children, className = '', delay = 0, y = 28 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.16 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({ children, className = '', delay = 0.08 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function TiltCard({ children, className = '', ...props }) {
  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty('--tilt-x', `${y * -7}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x * 7}deg`);
  }
  function handleLeave(event) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }
  return (
    <div {...props} className={`${className} tiltCard`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

export function MagneticButton({ children, className = '', ...props }) {
  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    event.currentTarget.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  }
  function handleLeave(event) { event.currentTarget.style.transform = ''; }
  return (
    <motion.div
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.97 }}
    >
      {props.as === 'a' ? (
        <a {...props} className={props.href ? undefined : undefined}>{children}</a>
      ) : children}
    </motion.div>
  );
}

export function AnimatedStat({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const numeric = Number.parseInt(String(value).replace(/\D/g, ''), 10);
  const suffix = String(value).replace(String(numeric || ''), '');

  useEffect(() => {
    if (!inView || !Number.isFinite(numeric)) return;
    let frame;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, numeric, duration]);

  return <span ref={ref}>{Number.isFinite(numeric) ? `${display}${suffix}` : value}</span>;
}

export function SkillNetwork({ className = '' }) {
  return (
    <div className={className} aria-label="Animated skill and career path network">
      <div className="skillOrbit skillOrbitOne" />
      <div className="skillOrbit skillOrbitTwo" />
      <motion.div className="skillCenter" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <span>Student</span>
        <strong>Goal</strong>
      </motion.div>
      {[
        ['skillBadgeOne', 'React'],
        ['skillBadgeTwo', 'Python'],
        ['skillBadgeThree', 'SQL'],
        ['skillBadgeFour', 'Cloud'],
      ].map(([classNameItem, label]) => (
        <motion.div
          key={label}
          className={`skillBadge ${classNameItem}`}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3.4, delay: classNameItem.length * 0.08, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.div>
      ))}
    </div>
  );
}
