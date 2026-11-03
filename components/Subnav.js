'use client';
import { useEffect, useState } from 'react';
import styles from './Subnav.module.css';

const SECTIONS = [
  { id: 'welcome-home',  label: 'Overview',              icon: '⚡' },
  { id: 'slogan',        label: 'Platform Vision',       icon: '🎯' },
  { id: 'welcome-tiles', label: 'Features',              icon: '✨' },
  { id: 'skill-catalog', label: 'Skill Matrix (60+)',    icon: '📊' },
  { id: 'how-it-works',  label: 'Recommendation Engine', icon: '🤖' },
  { id: 'services',      label: 'DBMS Architecture',     icon: '🗄️' },
  { id: 'career-paths',  label: 'Career Roadmaps',       icon: '🚀' },
  { id: 'apply-now',     label: 'Start Free',            icon: '🎓' },
];

export default function Subnav() {
  const [activeId, setActiveId] = useState('welcome-home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className={styles.subnav} aria-label="Section Navigation">
      <div className={styles.slider}>
        <div className={styles.engineBadge}>
          <span className={styles.enginePulse} />
          <span>Interactive Navigator</span>
        </div>
        <ul className={styles.list}>
          {SECTIONS.map(item => {
            const isActive = activeId === item.id;
            return (
              <li
                key={item.id}
                className={`${styles.item} ${isActive ? styles.active : ''}`}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => scrollTo(e, item.id)}
                  className={styles.link}
                >
                  <span className={styles.itemIcon}>{item.icon}</span>
                  <span className={styles.itemText}>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
