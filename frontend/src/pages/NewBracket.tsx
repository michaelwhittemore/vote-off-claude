import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { bracketsApi } from '../api/brackets';
import styles from './NewBracket.module.css';

export function NewBracket() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const { mutate: create, isPending, error } = useMutation({
    mutationFn: () => bracketsApi.create(name.trim()),
    onSuccess: (bracket) => navigate(`/b/${bracket.slug}/manage`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) create();
  };

  return (
    <div className={styles.page}>
      <Link to="/dashboard" className={styles.back}>← My brackets</Link>
      <h1 className={styles.title}>New bracket</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label} htmlFor="name">Bracket name</label>
        <input
          id="name"
          className={styles.input}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Best Programming Languages"
          autoFocus
        />
        {error && <p className={styles.error}>Something went wrong. Try again.</p>}
        <button
          type="submit"
          className={styles.submit}
          disabled={!name.trim() || isPending}
        >
          {isPending ? 'Creating…' : 'Create bracket'}
        </button>
      </form>
    </div>
  );
}
