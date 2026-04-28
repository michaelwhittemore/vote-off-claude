import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import styles from './Auth.module.css';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { mutate: register, isPending, isError, error } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ email, password }, { onSuccess: () => navigate('/dashboard') });
  };

  const errorMsg = isError
    ? ((error as any)?.response?.data?.error === 'Email already in use'
        ? 'That email is already registered.'
        : 'Something went wrong. Try again.')
    : null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Create account</h1>
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
          minLength={6}
          required
        />
        {errorMsg && <p className={styles.error}>{errorMsg}</p>}
        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className={styles.footer}>
        Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
      </p>
    </div>
  );
}
