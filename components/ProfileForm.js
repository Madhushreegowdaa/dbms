'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '../lib/supabase/client';
import { PageEnter } from './Animate';
import styles from './ProfileForm.module.css';

const BRANCHES = [
  'Computer Science Engineering','Information Science Engineering',
  'Electronics and Communication Engineering','Electrical Engineering',
  'Mechanical Engineering','Civil Engineering','Biotechnology',
  'Chemical Engineering','Aerospace Engineering','Other',
];
const YEARS = [1, 2, 3, 4, 5, 6];
const CAREER_GOALS = [
  'Full Stack Developer','Frontend Developer','Backend Developer',
  'Data Scientist','Data Analyst','Machine Learning Engineer',
  'AI Engineer','Cloud Engineer','Cybersecurity Engineer','Other',
];

export default function ProfileForm({ student, userEmail, userId }) {
  const [form, setForm] = useState({
    name:          student?.name          || '',
    branch:        student?.branch        || '',
    year:          student?.year          ?? '',
    career_goal:   student?.career_goal   || '',
    custom_goal:   '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function set(k) {
    return e => {
      const value = e.target.value;
      setForm(f => ({ ...f, [k]: k === 'year' && value !== '' ? Number(value) : value }));
    };
  }

  const isCustomGoal = form.career_goal === 'Other';

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!form.name.trim()) return setMessage({ type: 'error', text: 'Name is required.' });

    const finalGoal = isCustomGoal ? form.custom_goal.trim() || 'Other' : form.career_goal;
    const payload = {
      student_id: userId,
      name: form.name.trim(),
      email: userEmail,
      branch: form.branch,
      year: form.year === '' ? null : form.year,
      career_goal: finalGoal,
    };

    setLoading(true);
    const supabase = createClient();
    let error;
    ({ error } = await supabase.from('students').upsert(payload, { onConflict: 'student_id' }));
    setLoading(false);
    if (error) return setMessage({ type: 'error', text: error.message });
    setMessage({ type: 'success', text: 'Profile saved successfully!' });
  }

  const fields = ['name','branch','year','career_goal'];
  const filled = fields.filter(f => form[f]).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <PageEnter>
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>My Profile</h1>
            <p className="text-muted">Keep your academic and career information up to date.</p>
          </div>
          <motion.div
            className={styles.completionBadge}
            key={pct}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <span>{pct}%</span>
            <small>Complete</small>
          </motion.div>
        </div>

        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <motion.div
          className={`card ${styles.formCard}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message.text}
                className={`alert alert-${message.type}`}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label>Name *</label>
                  <input className="form-control" value={form.name} onChange={set('name')} placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" value={userEmail} disabled style={{ opacity: .7 }} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Academic Information</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label>Year</label>
                  <select className="form-control" value={form.year} onChange={set('year')}>
                    <option value="">Select year</option>
                    {YEARS.map(year => <option key={year} value={year}>{year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Branch / Department</label>
                  <select className="form-control" value={form.branch} onChange={set('branch')}>
                    <option value="">Select branch</option>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Career Goal</h2>
              <div className="form-group">
                <label>I want to become a…</label>
                <select className="form-control" value={form.career_goal} onChange={set('career_goal')}>
                  <option value="">Select career goal</option>
                  {CAREER_GOALS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <AnimatePresence>
                {isCustomGoal && (
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label>Specify your goal</label>
                    <input className="form-control" value={form.custom_goal} onChange={set('custom_goal')} placeholder="e.g. DevOps Engineer" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ minWidth: 180 }}
              whileHover={{ scale: 1.03, boxShadow: '0 .5rem 1.5rem rgba(92,107,192,.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? <><span className="spinner" /> Saving…</> : 'Save Profile →'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </PageEnter>
  );
}
