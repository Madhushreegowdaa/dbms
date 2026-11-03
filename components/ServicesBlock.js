'use client';
import { useState } from 'react';
import styles from './ServicesBlock.module.css';

const SERVICES = [
  {
    id: 1,
    title: 'What you track',
    subtitle: '60+ technical skills across 9 core domains',
    desc: 'Select from Programming Languages, Web Dev, Databases, Cloud, Machine Learning, and DevOps. Mark each skill as Beginner, Intermediate, or Advanced to generate your dynamic skill matrix.',
    bullets: ['9 structured domains', '3 proficiency tiers', 'Visual radar & proficiency bars'],
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&q=80',
    tag: 'Skill Tracking',
  },
  {
    id: 2,
    title: 'What you get',
    subtitle: 'Intelligent skill-gap analysis & course matching',
    desc: 'SkillPath calculates the exact delta between your current stack and your target career goal. It instantly recommends verified courses and exercises to bridge the difference efficiently.',
    bullets: ['Personalised gap delta', 'Curated course catalogue', 'Real-time DBMS query validation'],
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&q=80',
    tag: 'Smart Analytics',
  },
  {
    id: 3,
    title: 'Where you go',
    subtitle: 'Proven roadmaps to your dream engineering career',
    desc: 'Whether aiming to become a Full-Stack Engineer, AI Specialist, Cloud Architect, or Data Scientist — get a step-by-step verified pathway designed for college students and graduates.',
    bullets: ['10+ career target roles', 'Milestone achievement badges', 'Direct resume export readiness'],
    img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&q=80',
    tag: 'Career Growth',
  },
];

export default function ServicesBlock() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className={styles.servicesSection} id="services">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.label}>Platform Highlights</span>
          <h2 className={styles.heading}>Services built for student success</h2>
        </header>

        <div className={styles.layout}>
          {/* Left Column: Interactive Drawer Items */}
          <div className={styles.drawers}>
            {SERVICES.map((s, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div
                  key={s.id}
                  className={`${styles.drawerItem} ${isActive ? styles.active : ''}`}
                >
                  <button
                    className={styles.toggler}
                    onClick={() => setActiveIndex(idx)}
                    aria-expanded={isActive}
                  >
                    <span className={styles.togglerText}>
                      <span className={styles.stepNum}>0{s.id}</span>
                      {s.title}
                    </span>

                    <span className={styles.iconCircle}>
                      <span className={styles.iconH} />
                      <span className={`${styles.iconV} ${isActive ? styles.iconVHidden : ''}`} />
                    </span>
                  </button>

                  <div className={styles.drawerBody} aria-hidden={!isActive}>
                    <div className={styles.drawerContent}>
                      <h4 className={styles.subHeading}>{s.subtitle}</h4>
                      <p className={styles.desc}>{s.desc}</p>
                      <ul className={styles.bulletList}>
                        {s.bullets.map((b, bIdx) => (
                          <li key={bIdx} className={styles.bulletItem}>
                            <span className={styles.checkIcon}>✓</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Featured Photo */}
          <div className={styles.mediaCol}>
            <div className={styles.photoFrame}>
              {SERVICES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`${styles.photoSlide} ${activeIndex === idx ? styles.photoActive : ''}`}
                >
                  <img src={s.img} alt={s.title} className={styles.photo} />
                  <div className={styles.photoOverlay}>
                    <span className={styles.photoTag}>{s.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
