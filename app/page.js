'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import styles from './page.module.css';

export default function Home() {
  useEffect(() => {
    const els = document.querySelectorAll('.wow');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.style.animationDelay = el.dataset.wowDelay || '0s';
        el.classList.add('animated');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className={styles.main}>
      <Navbar isPublic />
      <HeroCarousel />

      
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.row4}>
            {[
              { icon: '\u{1F393}', title: 'Build Your Profile',  desc: 'Set your college, branch, academic year, and career goal in one place.' },
              { icon: '\u{1F310}', title: 'Track Your Skills',   desc: 'Add 60+ technical skills with Beginner, Intermediate, or Advanced levels.' },
              { icon: '\u{1F3C6}', title: 'Get Recommendations', desc: 'Receive personalised course suggestions that match your skill gaps.' },
              { icon: '\u{1F4C8}', title: 'Measure Progress',    desc: 'Visualise your growth and stay on track toward your career goals.' },
            ].map((s, i) => (
              <div key={i} className="wow fadeInUp" data-wow-delay={`${i * 0.15}s`}>
                <div className={styles.serviceCard}>
                  <div className={styles.serviceIconWrap}><span>{s.icon}</span></div>
                  <h5 className={styles.serviceTitle}>{s.title}</h5>
                  <p className={styles.serviceDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.aboutRow}>
            <div className="wow fadeInUp" data-wow-delay="0.1s">
              <div className={styles.aboutImgWrap}>
                <img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80" alt="Students" className={styles.aboutImg} />
                <div className={styles.aboutBadge}><span className={styles.aboutBadgeNum}>60+</span><span className={styles.aboutBadgeLabel}>Skills Available</span></div>
              </div>
            </div>
            <div className="wow fadeInUp" data-wow-delay="0.25s">
              <span className="section-title">About SkillPath</span>
              <h1 className={styles.aboutHeading}>Welcome to SkillPath</h1>
              <p className={styles.aboutPara}>SkillPath is a student-focused platform designed to help you build a comprehensive skill profile, track your technical proficiency, and discover courses that align with your career goals.</p>
              <p className={styles.aboutPara}>Whether you&apos;re aiming to become a Full Stack Developer, Data Scientist, or Cloud Engineer {"\u2014"} SkillPath maps your current skills to your dream career and shows you exactly what to learn next.</p>
              <div className={styles.aboutFeatures}>
                {['Profile with career goal','60+ technical skills','Proficiency tracking','Skill gap analysis','Course recommendations','DBMS-backed system'].map((f,i) => (
                  <p key={i} className={styles.aboutFeature}><span className={styles.featureArrow}>{"\u2192"}</span> {f}</p>
                ))}
              </div>
              <Link href="/signup" className={`btn btn-primary btn-lg ${styles.aboutBtn}`}>Get Started {"\u2192"}</Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className={styles.container}>
          <div className={`wow fadeInUp ${styles.sectionHead}`} data-wow-delay="0.1s">
            <span className="section-title">Categories</span>
            <h1 className={styles.sectionH1}>Explore Skill Categories</h1>
            <p className={styles.sectionSub}>Browse 60+ skills across 9 technical domains.</p>
          </div>
          <div className={styles.catGrid}>
            {[
              { icon:'\u{1F4BB}', name:'Programming Languages', count:10, color:'#5c6bc0' },
              { icon:'\u{1F3A8}', name:'Frontend Development',  count:7,  color:'#e91e63' },
              { icon:'\u{2699}\uFE0F', name:'Backend Development',   count:7,  color:'#ff9800' },
              { icon:'\u{1F5C4}\uFE0F', name:'Databases',             count:6,  color:'#4caf50' },
              { icon:'\u{1F4CA}', name:'Data Science',          count:7,  color:'#2196f3' },
              { icon:'\u{1F916}', name:'Machine Learning',      count:6,  color:'#9c27b0' },
              { icon:'\u{2601}\uFE0F', name:'Cloud Computing',       count:6,  color:'#00bcd4' },
              { icon:'\u{1F512}', name:'Cybersecurity',         count:5,  color:'#f44336' },
              { icon:'\u{1F6E0}\uFE0F', name:'Tools & Technologies',  count:7,  color:'#795548' },
            ].map((c,i) => (
              <div key={i} className="wow zoomIn" data-wow-delay={`${(i%3)*0.12}s`}>
                <div className={styles.catCard} style={{'--cc':c.color}}>
                  <div className={styles.catIconBox} style={{background:`${c.color}18`}}><span>{c.icon}</span></div>
                  <div className={styles.catInfo}>
                    <h5 className={styles.catName}>{c.name}</h5>
                    <small style={{color:c.color, fontWeight:700}}>{c.count} Skills</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={`wow fadeInUp ${styles.sectionHead}`} data-wow-delay="0.1s">
            <span className="section-title">How It Works</span>
            <h1 className={styles.sectionH1}>Start in 4 Simple Steps</h1>
            <p className={styles.sectionSub}>From signup to personalised recommendations in minutes.</p>
          </div>
          <div className={styles.row4}>
            {[
              { num:'01', icon:'\u270D\uFE0F', title:'Create Account',     desc:'Sign up with your college email address in seconds.' },
              { num:'02', icon:'\u{1F464}', title:'Build Your Profile',  desc:'Fill in your academic details and set your career goal.' },
              { num:'03', icon:'\u{1F6E0}\uFE0F', title:'Add Your Skills',     desc:'Browse 60+ skills and mark your proficiency level.' },
              { num:'04', icon:'\u{1F680}', title:'Get Recommendations', desc:'Receive personalised course suggestions for your goals.' },
            ].map((s,i) => (
              <div key={i} className="wow fadeInUp" data-wow-delay={`${i*0.15}s`}>
                <div className={styles.stepCard}>
                  <div className={styles.stepTop}><span className={styles.stepNum}>{s.num}</span><span className={styles.stepEmoji}>{s.icon}</span></div>
                  <div className={styles.stepBody}><h5 className={styles.stepTitle}>{s.title}</h5><p className={styles.stepDesc}>{s.desc}</p></div>
                  <div className={styles.stepFoot}><span className={styles.stepArrow}>{"\u2192"}</span> Step {s.num}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className={styles.container}>
          <div className={`wow fadeInUp ${styles.sectionHead}`} data-wow-delay="0.1s">
            <span className="section-title">Career Goals</span>
            <h1 className={styles.sectionH1}>Choose Your Career Path</h1>
            <p className={styles.sectionSub}>Pick a goal and let SkillPath guide your learning journey.</p>
          </div>
          <div className={styles.row4}>
            {[
              { img:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80', role:'Full Stack Developer',   skills:'React \u00B7 Node.js \u00B7 PostgreSQL' },
              { img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',    role:'Data Scientist',          skills:'Python \u00B7 Pandas \u00B7 ML' },
              { img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80',    role:'Cloud Engineer',          skills:'AWS \u00B7 Docker \u00B7 Kubernetes' },
              { img:'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80', role:'Cybersecurity Engineer',  skills:'Linux \u00B7 OWASP \u00B7 Cryptography' },
            ].map((c,i) => (
              <div key={i} className="wow fadeInUp" data-wow-delay={`${i*0.15}s`}>
                <div className={styles.careerCard}>
                  <div className={styles.careerImgWrap}>
                    <img src={c.img} alt={c.role} className={styles.careerImg} />
                    <div className={styles.careerOverlay}><Link href="/signup" className={styles.careerBtn}>Start Path {"\u2192"}</Link></div>
                  </div>
                  <div className={styles.careerBody}>
                    <h5 className={styles.careerRole}>{c.role}</h5>
                    <small className={styles.careerSkills}>{c.skills}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {[
              { icon:'\u{1F393}', num:'60+', label:'Skills in Catalog' },
              { icon:'\u{1F4C2}', num:'9', label:'Skill Categories' },
              { icon:'\u{1F3AF}', num:'10+', label:'Career Paths' },
              { icon:'\u{1F512}', num:'100%', label:'Secure & Private' },
            ].map((s,i) => (
              <div key={i} className="wow zoomIn" data-wow-delay={`${i*0.15}s`}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <h2 className={styles.statNum}>{s.num}</h2>
                  <p className={styles.statLabel}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.container}>
            <div className={styles.footerGrid}>
              <div>
                <div className={styles.footerBrand}>{"\u{1F4DA}"} SkillPath</div>
                <p className={styles.footerAbout}>A student skill tracking and course recommendation system built as a DBMS mini project.</p>
              </div>
              <div>
                <h4 className={styles.footerHeading}>Quick Links</h4>
                {[['/', 'Home'],['/signup','Sign Up'],['/login','Sign In'],['/dashboard','Dashboard'],['/skills','My Skills']].map(([href,label]) => (
                  <Link key={href} href={href} className={styles.footerLink}>{label}</Link>
                ))}
              </div>
              <div>
                <h4 className={styles.footerHeading}>Skill Categories</h4>
                {['Programming Languages','Frontend Development','Backend Development','Databases','Data Science'].map(c => (
                  <span key={c} className={styles.footerLink}>{c}</span>
                ))}
              </div>
              <div>
                <h4 className={styles.footerHeading}>Get Started</h4>
                <p className={styles.footerAbout}>Join SkillPath and start building your personalised skill profile today.</p>
                <Link href="/signup" className={styles.footerCta}>Create Free Account {"\u2192"}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div className={styles.container}>
            <div className={styles.footerCopy}>
              <p>{"\u00A9"} {new Date().getFullYear()} SkillPath {"\u00B7"} Student Skill &amp; Course Recommendation System {"\u00B7"} DBMS Mini Project</p>
              <div className={styles.footerMenu}>
                <Link href="/">Home</Link>
                <Link href="/login">Sign In</Link>
                <Link href="/signup">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
