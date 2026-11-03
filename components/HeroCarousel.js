'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './HeroCarousel.module.css';

const WORDS = ['Careers', 'Skills', 'Projects', 'Interviews', 'Future'];

export default function HeroCarousel() {
  const [wordIndex, setWordIndex] = useState(0);
  const [subText, setSubText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Exact Typewriter animation matching allinnhomeofstudents.com
  useEffect(() => {
    const currentWord = WORDS[wordIndex];
    const speed = isDeleting ? 38 : 75;

    if (!isDeleting && subText === currentWord) {
      const holdTimeout = setTimeout(() => setIsDeleting(true), 1500);
      return () => clearTimeout(holdTimeout);
    }

    if (isDeleting && subText === '') {
      setIsDeleting(false);
      setWordIndex(prev => (prev + 1) % WORDS.length);
      return;
    }

    const timer = setTimeout(() => {
      setSubText(
        isDeleting
          ? currentWord.substring(0, subText.length - 1)
          : currentWord.substring(0, subText.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [subText, isDeleting, wordIndex]);

  // Items for the continuous carousel ribbon
  const carouselItems = (
    <>
      <span className={`${styles.carouselItem} ${styles.shape1}`} aria-hidden="true" />

      <figure className={`${styles.carouselItem} ${styles.media1}`}>
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80"
          alt="Students collaborating"
          className={styles.carouselImg}
        />
        <span className={styles.carouselBadge} style={{ '--rot': '-4deg', top: '12%', left: '8%' }}>
          ⚡ 60+ Skills
        </span>
      </figure>

      <span className={`${styles.carouselItem} ${styles.shape2}`} aria-hidden="true" />

      <figure className={`${styles.carouselItem} ${styles.media2}`}>
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80"
          alt="Team building projects"
          className={styles.carouselImg}
        />
        <span className={styles.carouselBadge} style={{ '--rot': '3deg', bottom: '14%', right: '8%' }}>
          🎯 Career Paths
        </span>
      </figure>

      <span className={`${styles.carouselItem} ${styles.shape3}`} aria-hidden="true" />

      <figure className={`${styles.carouselItem} ${styles.media3}`}>
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80"
          alt="Student learning coding"
          className={styles.carouselImg}
        />
        <span className={styles.carouselBadge} style={{ '--rot': '-5deg', top: '15%', right: '10%' }}>
          ✨ DBMS Powered
        </span>
      </figure>

      <span className={`${styles.carouselItem} ${styles.shape4}`} aria-hidden="true" />

      <figure className={`${styles.carouselItem} ${styles.media4}`}>
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80"
          alt="Tech workshop students"
          className={styles.carouselImg}
        />
        <span className={styles.carouselBadge} style={{ '--rot': '4deg', bottom: '12%', left: '10%' }}>
          🚀 100% Free
        </span>
      </figure>
    </>
  );

  return (
    <section className={styles.heroSection} id="welcome-home">
      <div className={styles.heroContainer}>
        {/* Playful Heading with Typewriter Effect */}
        <div className={styles.headingWrap}>
          <div className={styles.tagPill}>
            <span className={styles.tagDot} />
            SkillPath · Home of Student Techies
          </div>
          <h1 className={styles.heading}>
            Stick around! <br className={styles.brMobile} />
            It&apos;s SkillPath:
            <span className={styles.wordHighlight}>
              {subText}
              <span className={styles.cursor}>|</span>
            </span>
          </h1>
        </div>

        {/* Continuous Flowing Horizontal Ribbon Carousel */}
        <div className={styles.carouselTrack}>
          <div className={styles.carouselGroup}>{carouselItems}</div>
          <div className={styles.carouselGroup} aria-hidden="true">{carouselItems}</div>
        </div>

        {/* Hero Bottom Info & Bouncy Actions */}
        <div className={styles.heroBottom}>
          <p className={styles.description}>
            Track 60+ technical skills, discover your skill gaps, and get personalised
            course recommendations — all in one student-focused platform.
          </p>

          <div className={styles.btnRow}>
            <Link href="/signup" className={`${styles.btnPrimary} bouncyBtn`}>
              Get Started Now <span className={styles.btnArrow}>→</span>
            </Link>
            <a href="#skill-catalog" className={`${styles.btnSecondary} bouncyBtn`}>
              Explore Catalog ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
