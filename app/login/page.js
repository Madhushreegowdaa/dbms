'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (err) return setError(err.message);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span>📚</span>
          <h2>Skill<em>Path</em></h2>
        </div>
        <h1 className={styles.title}>Welcome Back!</h1>
        <p className={styles.sub}>Sign in to continue to your skill dashboard.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" required placeholder="you@college.edu" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" required placeholder="Your password" value={form.password} onChange={set('password')} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '.75rem' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Don&apos;t have an account? <Link href="/signup">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
