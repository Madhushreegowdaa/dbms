'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './SloganBlock.module.css';

export default function SloganBlock() {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.sloganSection} ${isInView ? styles.active : ''}`} id="slogan">
      <div className={styles.container}>
        <div className={styles.sloganPill}>
          <span className={styles.pillPulse} />
          <span>Intelligent Curriculum Mapping</span>
        </div>

        <div className={styles.sloganItems}>
          {/* Word 1 */}
          <div className={styles.word} style={{ '--delay': '0.08s' }}>
            <span>Master Skills</span>
          </div>

          {/* Fun Pop-in Shape 1 (Hexagon Badge) */}
          <div className={styles.shapeWrap} style={{ '--delay': '0.18s' }}>
            <span className={`${styles.shape} ${styles.shape1}`} aria-hidden="true" />
            <span className={styles.shapeTooltip}>60+ Skills</span>
          </div>

          {/* Word 2 */}
          <div className={styles.word} style={{ '--delay': '0.28s' }}>
            <span>Build Projects</span>
          </div>

          {/* Fun Organic Masked Image 1 */}
          <figure className={`${styles.maskedImg} ${styles.img1}`} style={{ '--delay': '0.38s' }}>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
              alt="Students mastering skills"
            />
          </figure>

          {/* Word 3 */}
          <div className={styles.word} style={{ '--delay': '0.48s' }}>
            <span>Bridge Gaps</span>
          </div>

          {/* Fun Pop-in Shape 2 (Notched Ribbon) */}
          <div className={styles.shapeWrap} style={{ '--delay': '0.58s' }}>
            <span className={`${styles.shape} ${styles.shape2}`} aria-hidden="true" />
            <span className={styles.shapeTooltip}>AI Delta</span>
          </div>

          {/* Word 4 */}
          <div className={styles.word} style={{ '--delay': '0.68s' }}>
            <span>Get Recs</span>
          </div>

          {/* Fun Pop-in Shape 3 (Star / Polygon) */}
          <div className={styles.shapeWrap} style={{ '--delay': '0.78s' }}>
            <span className={`${styles.shape} ${styles.shape3}`} aria-hidden="true" />
            <span className={styles.shapeTooltip}>DBMS Live</span>
          </div>

          {/* Word 5 */}
          <div className={styles.word} style={{ '--delay': '0.88s' }}>
            <span>Ace Careers</span>
          </div>

          {/* Fun Organic Masked Image 2 */}
          <figure className={`${styles.maskedImg} ${styles.img2}`} style={{ '--delay': '0.98s' }}>
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80"
              alt="Graduates celebrating success"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
