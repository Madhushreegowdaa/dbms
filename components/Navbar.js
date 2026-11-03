'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import styles from './Navbar.module.css';

export default function Navbar({ isPublic = false }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const appLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile',   label: 'My Profile' },
    { href: '/skills',    label: 'My Skills'  },
  ];
  const pubLinks = [
    { href: '/',       label: 'Home'    },
    { href: '/login',  label: 'Sign In' },
    { href: '/signup', label: 'Sign Up' },
  ];
  const links = isPublic ? pubLinks : appLinks;

  return (
    <nav className={`${styles.navbar} ${!isPublic ? styles.appNav : ''} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Brand */}
        <Link href={isPublic ? '/' : '/dashboard'} className={styles.brand}>
          <span className={styles.brandIcon}>📚</span>
          <span className={styles.brandText}>Skill<strong>Path</strong></span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.navLinks}>
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`${styles.navLink} ${pathname === l.href ? styles.active : ''}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={styles.cta}>
          {isPublic ? (
            <Link href="/signup" className={`btn btn-primary ${styles.ctaBtn}`}>
              Join Now <span className={styles.arrow}>→</span>
            </Link>
          ) : (
            <button className={`btn btn-primary ${styles.ctaBtn}`} onClick={handleLogout}>
              Logout <span className={styles.arrow}>→</span>
            </button>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`${styles.drawerLink} ${pathname === l.href ? styles.active : ''}`}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        {isPublic ? (
          <Link href="/signup" className="btn btn-primary" style={{ marginTop: '.5rem' }} onClick={() => setOpen(false)}>
            Join Now →
          </Link>
        ) : (
          <button className="btn btn-primary" style={{ marginTop: '.5rem' }} onClick={handleLogout}>
            Logout →
          </button>
        )}
      </div>
    </nav>
  );
}
