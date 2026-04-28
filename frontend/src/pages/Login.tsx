import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import styles from './Auth.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { mutate: login, isPending, isError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password }, { onSuccess: () => navigate('/dashboard') });
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Sign in</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          className={styles.input}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoFocus
          required
        />
        <label className={styles.label} htmlFor="password">Password</label>
        <input
          id="password"
          className={styles.input}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {isError && <p className={styles.error}>Invalid email or password.</p>}
        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className={styles.footer}>
        No account? <Link to="/register" className={styles.link}>Create one</Link>
      </p>
    </div>
  );
}
