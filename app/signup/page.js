'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import styles from '../auth.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });
    setLoading(false);
    if (err) return setError(err.message);
    setDone(true);
  }

  if (done) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>✉️</div>
        <h2 className={styles.title}>Check your email</h2>
        <p className={styles.sub} style={{ marginBottom: '1.5rem' }}>
          We sent a confirmation link to <strong>{form.email}</strong>.<br />
          Click it to activate your account, then sign in.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ width: '100%', padding: '.75rem', justifyContent: 'center' }}>
          Go to Sign In →
        </Link>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span>📚</span>
          <h2>Skill<em>Path</em></h2>
        </div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.sub}>Sign up and start building your skill profile today.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" required placeholder="you@college.edu" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" required placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input className="form-control" type="password" required placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '.75rem' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link href="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
