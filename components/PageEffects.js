'use client';
import { useEffect, useState } from 'react';

export default function PageEffects() {
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [backTop, setBackTop] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setSpinnerVisible(false), 500);

    function onScroll() {
      setBackTop(window.scrollY > 300);
      const el = document.documentElement;
      const pct = (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(pct, 100));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <>
      {/* Page load spinner */}
      <div className={`page-spinner${spinnerVisible ? '' : ' hide'}`}>
        <div className="spinner-border" role="status" />
      </div>

      {/* Scroll progress bar */}
      <div id="scroll-progress" style={{ width: `${scrollPct}%` }} />

      {/* Back to top */}
      <button
        className={`back-to-top${backTop ? ' show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        style={{ fontSize: '1.2rem', fontWeight: 700 }}
      >
        ↑
      </button>
    </>
  );
}
