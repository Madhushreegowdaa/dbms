'use client';
import styles from './TilesBlock.module.css';

const TILES = [
  {
    title: 'Student Cohort Matrix',
    desc: 'Connect your college, branch, and semester details to benchmark your technical proficiency against top peer percentiles.',
    badge: '🤝 Peer Benchmark',
    badgeRot: '-4deg',
    bg: '#FAF6EF',
    borderColor: '#e8dcce',
    accentColor: '#F96926',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80',
    metric: '98% Student Relevance',
  },
  {
    title: '60+ Technical Skills Catalog',
    desc: 'Categorized across 9 high-growth engineering domains with 3 validated proficiency tiers: Beginner, Intermediate, and Advanced.',
    badge: '⚡ 60+ Skills',
    badgeRot: '3deg',
    bg: '#F0F6FD',
    borderColor: '#d2e4f7',
    accentColor: '#3984F3',
    img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=80',
    metric: '9 Specialised Domains',
  },
  {
    title: 'AI & DBMS Gap Analysis',
    desc: 'Real-time algorithm compares your current stack against industry role expectations and points out your highest-priority missing skills.',
    badge: '🎯 Gap Delta Engine',
    badgeRot: '-3deg',
    bg: '#FCF1F7',
    borderColor: '#f7d6e6',
    accentColor: '#D81B60',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
    metric: 'Instant Personalized Delta',
  },
  {
    title: 'Curated Course Recommendations',
    desc: 'Matches your missing competencies to verified coursework and project roadmaps designed to help you prepare for technical interviews.',
    badge: '🚀 Career Accelerator',
    badgeRot: '4deg',
    bg: '#F0FAF4',
    borderColor: '#d0f0de',
    accentColor: '#10B981',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=700&q=80',
    metric: 'DBMS-Backed Matching',
  },
];

export default function TilesBlock() {
  function handleMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-x', `${y * -8}deg`);
    card.style.setProperty('--tilt-y', `${x * 8}deg`);
  }

  function handleLeave(e) {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  }

  return (
    <section className={styles.tilesSection} id="welcome-tiles">
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.badgePill}>
            <span className={styles.pillSparkle}>✨</span>
            <span>Intelligent Learning Infrastructure</span>
          </div>
          <h2 className={styles.heading}>Professional Course &amp; Skill Recommendations</h2>
          <p className={styles.subheading}>
            Engineered specifically for engineering students to master modern stacks, eliminate knowledge gaps, and land target technical careers.
          </p>
        </header>

        <div className={styles.grid}>
          {TILES.map((t, i) => (
            <div
              key={i}
              className={`${styles.card} bouncyBtn`}
              style={{
                backgroundColor: t.bg,
                borderColor: t.borderColor,
                '--accent': t.accentColor,
              }}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
            >
              <div className={styles.photoWrap}>
                <img src={t.img} alt={t.title} className={styles.photo} />
                <span className={styles.sticker} style={{ '--rot': t.badgeRot }}>
                  {t.badge}
                </span>
                <span className={styles.metricPill}>
                  {t.metric}
                </span>
              </div>

              <div className={styles.content}>
                <h3 className={styles.title}>{t.title}</h3>
                <p className={styles.desc}>{t.desc}</p>
                <div className={styles.exploreLink}>
                  <span>Explore Module</span>
                  <span className={styles.arrowIcon}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
