'use client';
import { useEffect } from 'react';

export default function WowInit() {
  useEffect(() => {
    // Elements with .animated class (hero) — fire immediately
    document.querySelectorAll('.animated:not(.wow)').forEach(el => {
      el.style.visibility = 'visible';
    });

    // WOW-style scroll-triggered animations
    const wowEls = document.querySelectorAll('.wow');
    if (!wowEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay    = el.dataset.wowDelay    || '0s';
        const duration = el.dataset.wowDuration || '.8s';
        const anim     = el.dataset.wowAnimation || el.classList[1] || 'fadeInUp';

        el.style.animationDelay    = delay;
        el.style.animationDuration = duration;
        el.classList.add('animated', anim);
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    wowEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
