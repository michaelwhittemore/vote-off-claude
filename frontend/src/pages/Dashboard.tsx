import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { bracketsApi } from '../api/brackets';
import { useAuth, useLogout } from '../hooks/useAuth';
import { ConfirmModal } from '../components/ConfirmModal';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: brackets, isLoading } = useQuery({
    queryKey: ['brackets'],
    queryFn: () => bracketsApi.list(),
  });

  const { mutate: deleteBracket } = useMutation({
    mutationFn: (slug: string) => bracketsApi.deleteBracket(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brackets'] }),
  });

  const { mutate: logout } = useLogout();

  if (isLoading) return <div className={styles.center}>Loading...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Brackets</h1>
        <div className={styles.headerRight}>
          {user && <span className={styles.userEmail}>{user.email}</span>}
          <button className={styles.logoutBtn} onClick={() => logout()}>Logout</button>
          <button className={styles.newBtn} onClick={() => navigate('/brackets/new')}>
            + New bracket
          </button>
        </div>
      </header>

      {!brackets?.length ? (
        <p className={styles.empty}>No brackets yet. Create one to get started.</p>
      ) : (
        <ul className={styles.list}>
          {brackets.map(b => (
            <li key={b.slug} className={styles.row}>
              <div className={styles.info}>
                <span className={styles.name}>{b.name}</span>
                <span className={styles.status} data-status={b.status}>{b.status}</span>
              </div>
              <div className={styles.actions}>
                <Link to={`/b/${b.slug}`} className={styles.link}>Vote</Link>
                <Link to={`/b/${b.slug}/results`} className={styles.link}>Results</Link>
                <Link to={`/b/${b.slug}/manage`} className={styles.link}>Manage</Link>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setPendingDelete(b.slug)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmModal
          message={`Delete "${brackets?.find(b => b.slug === pendingDelete)?.name}"? This cannot be undone.`}
          onConfirm={() => { deleteBracket(pendingDelete); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
