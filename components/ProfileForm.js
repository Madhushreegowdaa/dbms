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
const YEARS = ['1st Year','2nd Year','3rd Year','4th Year','Postgraduate'];
const CAREER_GOALS = [
  'Full Stack Developer','Frontend Developer','Backend Developer',
  'Data Scientist','Data Analyst','Machine Learning Engineer',
  'AI Engineer','Cloud Engineer','Cybersecurity Engineer','Other',
];

export default function ProfileForm({ student, userEmail, userId }) {
  const [form, setForm] = useState({
    full_name:     student?.full_name     || '',
    college:       student?.college       || '',
    branch:        student?.branch        || '',
    academic_year: student?.academic_year || '',
    career_goal:   student?.career_goal   || '',
    bio:           student?.bio           || '',
    custom_goal:   '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(student?.avatar_url || '');
  const [photoLoading, setPhotoLoading] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setMessage({ type: 'error', text: 'Choose an image file.' });
    if (file.size > 5 * 1024 * 1024) return setMessage({ type: 'error', text: 'Choose an image smaller than 5 MB.' });
    setMessage(null);
    setPhotoLoading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('student-avatars').upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setPhotoLoading(false);
      return setMessage({ type: 'error', text: uploadError.message });
    }
    const { data: { publicUrl } } = supabase.storage.from('student-avatars').getPublicUrl(path);
    const { error: saveError } = await supabase.from('students').upsert({
      ...(student?.id ? { id: student.id } : {}), auth_user_id: userId, email: userEmail, avatar_url: publicUrl,
    }, { onConflict: 'auth_user_id' });
    setPhotoLoading(false);
    if (saveError) return setMessage({ type: 'error', text: saveError.message });
    setAvatarUrl(publicUrl);
    setMessage({ type: 'success', text: 'Profile photo uploaded.' });
  }

  const isCustomGoal = form.career_goal === 'Other';

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!form.full_name.trim()) return setMessage({ type: 'error', text: 'Full name is required.' });

    const finalGoal = isCustomGoal ? form.custom_goal.trim() || 'Other' : form.career_goal;
    const payload = {
      auth_user_id: userId, email: userEmail,
      full_name: form.full_name.trim(), college: form.college.trim(),
      branch: form.branch, academic_year: form.academic_year,
      career_goal: finalGoal, bio: form.bio.trim(), avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    };

    setLoading(true);
    const supabase = createClient();
    let error;
    ({ error } = await supabase.from('students').upsert(payload, { onConflict: 'auth_user_id' }));
    setLoading(false);
    if (error) return setMessage({ type: 'error', text: error.message });
    setMessage({ type: 'success', text: 'Profile saved successfully!' });
  }

  const fields = ['full_name','college','branch','academic_year','career_goal','bio'];
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
              <div className={styles.photoUpload}>
                <div className={styles.photoPreview}>{avatarUrl ? <img src={avatarUrl} alt="Your profile" /> : <span>{form.full_name.trim().charAt(0).toUpperCase() || 'S'}</span>}</div>
                <div className={styles.photoControls}>
                  <strong>Profile photo</strong>
                  <p>Upload a photo to personalize your dashboard.</p>
                  <label className="btn btn-outline-primary btn-sm">
                    {photoLoading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={photoLoading} />
                  </label>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" value={form.full_name} onChange={set('full_name')} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" value={userEmail} disabled style={{ opacity: .7 }} />
                </div>
              </div>
              <div className="form-group">
                <label>Short Bio</label>
                <textarea className="form-control" value={form.bio} onChange={set('bio')} placeholder="Tell us a bit about yourself, your interests, and goals…" rows={3} />
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Academic Information</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label>College / University</label>
                  <input className="form-control" value={form.college} onChange={set('college')} placeholder="e.g. RV College of Engineering" />
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <select className="form-control" value={form.academic_year} onChange={set('academic_year')}>
                    <option value="">Select year</option>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Branch / Department</label>
                <select className="form-control" value={form.branch} onChange={set('branch')}>
                  <option value="">Select branch</option>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
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
