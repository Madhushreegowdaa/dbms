'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { PageEnter, StaggerContainer, StaggerItem, Reveal, PopIn } from '../../../components/Animate';
import AnimatedCounter from '../../../components/AnimatedCounter';
import styles from './dashboard.module.css';

export default function DashboardClient({
  displayName, completion, totalSkills,
  beginnerCount, intermediateCount, advancedCount,
  studentSkills, recommendationCount, courseDataStatus, careerGoal, branch,
}) {
  const statCards = [
    { icon: '\u{1F4CA}', label: 'Profile Complete', value: completion, suffix: '%', extra: 'progress' },
    { icon: '\u{1F9F0}', label: 'Total Skills',     value: totalSkills,      suffix: '' },
    { icon: '\u{1F3AF}', label: 'Career Goal',      value: null, text: careerGoal || '\u2014', small: true },
    { icon: '\u{1F3EB}', label: 'Branch',           value: null, text: branch    || '\u2014', small: true },
    {
      icon: '\u{1F4DA}',
      label: 'Recommended Courses',
      value: courseDataStatus === 'ready' ? recommendationCount : null,
      text: courseDataStatus === 'migration-required'
        ? 'Setup needed'
        : courseDataStatus === 'profile-missing'
          ? 'Create profile'
          : 'Unavailable',
      small: true,
    },
  ];

  return (
    <PageEnter>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.headerCopy}>
          <span className={styles.eyebrow}>YOUR LEARNING SPACE</span>
          <h1 className={styles.welcome}>Welcome back, {displayName} <span aria-hidden="true">{"\u{1F44B}"}</span></h1>
          <p className="text-muted">Here&apos;s a snapshot of your skill profile.</p>
        </div>
        <div className={styles.studentInitials} aria-label={`${displayName}'s initials`}>
          {displayName?.trim()?.charAt(0)?.toUpperCase() || 'S'}
        </div>
        <div className={styles.headerActions}>
          <Link href="/profile" className="btn btn-outline-primary btn-sm">Edit Profile</Link>
          <Link href="/skills" className="btn btn-primary btn-sm">Manage Skills {"\u2192"}</Link>
        </div>
      </motion.div>

      {courseDataStatus === 'error' && (
        <p className={styles.dataNotice} role="status">
          Recommendation metrics could not be loaded. Your profile and skills are still available.
        </p>
      )}

      {/* Stat cards */}
      <StaggerContainer className={styles.statsGrid} stagger={0.1} delay={0.1}>
        {statCards.map((s, i) => (
          <StaggerItem key={i}>
            <div className={`service-item ${styles.statCard}`}>
              <div className={styles.statInner}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={`${styles.statValue} ${s.small ? styles.statSmall : ''}`}>
                  {s.value !== null
                    ? <AnimatedCounter target={s.value} suffix={s.suffix} />
                    : s.text
                  }
                </div>
                {s.extra === 'progress' && (
                  <div className={styles.progressBar}>
                    <motion.div
                      className={styles.progressFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                )}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Proficiency breakdown */}
      <StaggerContainer className={styles.profGrid} stagger={0.12} delay={0.2}>
        {[
          { level: 'Beginner',     count: beginnerCount,     color: '#3b82f6' },
          { level: 'Intermediate', count: intermediateCount, color: '#f59e0b' },
          { level: 'Advanced',     count: advancedCount,     color: '#10b981' },
        ].map(p => (
          <StaggerItem key={p.level}>
            <div className={`service-item ${styles.profCard}`}>
              <motion.div
                className={styles.profCircle}
                style={{ borderColor: p.color, color: p.color }}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <AnimatedCounter target={p.count} />
              </motion.div>
              <div className={styles.profLabel}>{p.level}</div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Bottom grid */}
      <div className={styles.bottom}>
        <Reveal delay={0.05}>
          <div className={`card ${styles.recentCard}`}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardTitleLine} />
              My Skills
            </h2>
            {studentSkills.length === 0 ? (
              <div className={styles.empty}>
                <p>No skills added yet.</p>
                <Link href="/skills" className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>
                  Add Your First Skill
                </Link>
              </div>
            ) : (
              <ul className={styles.skillList}>
                {studentSkills.map((s, i) => (
                  <motion.li
                    key={i}
                    className={styles.skillItem}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div>
                      <span className={styles.skillName}>{s.skills?.skill_name}</span>
                      <span className={styles.skillCat}>{s.skills?.category}</span>
                    </div>
                    <span className={`badge badge-${s.proficiency_level.toLowerCase()}`}>{s.proficiency_level}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className={`card ${styles.quickCard}`}>
            <h2 className={styles.cardTitle}>
              <span className={styles.cardTitleLine} />
              Quick Actions
            </h2>
            <div className={styles.quickLinks}>
              {[
                { href: '/profile', icon: '\u{1F464}', title: 'Edit Profile',    sub: 'Update your personal & academic info' },
                { href: '/skills',  icon: '\u{2795}', title: 'Add Skills',      sub: 'Browse and add technical skills' },
                { href: '/skills',  icon: '\u{1F4CB}', title: 'View All Skills', sub: 'See your complete skill catalogue' },
                { href: '/courses', icon: '\u{1F4D6}', title: 'Browse Courses', sub: 'Explore the database course catalog' },
                { href: '/recommendations', icon: '\u{1F3AF}', title: 'My Recommendations', sub: 'See ranked skill-based course matches' },
              ].map((q, i) => (
                <motion.div key={i} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link href={q.href} className={styles.quickLink}>
                    <div className={styles.quickIcon}>{q.icon}</div>
                    <div>
                      <strong>{q.title}</strong>
                      <p>{q.sub}</p>
                    </div>
                    <span className={styles.quickArrow}>{"\u2192"}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </PageEnter>
  );
}
