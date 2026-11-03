'use client';
import Link from 'next/link';
import styles from './ApplyBlock.module.css';

export default function ApplyBlock() {
  return (
    <section className={styles.applySection} id="apply-now">
      <div className={styles.container}>
        <div className={styles.inner}>
          {/* Left / Info */}
          <div className={styles.infoCol}>
            <span className={styles.label}>Get Started Today</span>
            <h2 className={styles.heading}>Stick to us · Shape your career path</h2>
            <p className={styles.desc}>
              Join hundreds of engineering students mapping their skills, closing knowledge gaps,
              and landing internships with curated course roadmaps.
            </p>

            <div className={styles.actionWrap}>
              <Link href="/signup" className={`${styles.ctaBtn} bouncyBtn`}>
                Create Free Account <span className={styles.btnArrow}>→</span>
              </Link>
              <Link href="/login" className={styles.secondaryBtn}>
                Sign In to Existing Account
              </Link>
            </div>
          </div>

          {/* Right / Playful Sticker Collage Photo */}
          <div className={styles.photoCol}>
            <div className={styles.photoWrap}>
              <img
                src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=900&q=80"
                alt="Students collaborating"
                className={styles.photo}
              />

              {/* Tilted Floating Fun Stickers */}
              <span className={`${styles.sticker} ${styles.sticker1}`}>
                ✨ 2026 Batch Ready
              </span>

              <span className={`${styles.sticker} ${styles.sticker2}`}>
                🚀 Join SkillPath!
              </span>

              <span className={`${styles.sticker} ${styles.sticker3}`}>
                ⚡ Fast &amp; Easy
              </span>

              <span className={`${styles.sticker} ${styles.sticker4}`}>
                🎓 DBMS Backed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
