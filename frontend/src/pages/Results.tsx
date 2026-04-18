import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bracketsApi } from '../api/brackets';
import type { Entry } from '../api/brackets';
import styles from './Results.module.css';

export function Results() {
  const { slug } = useParams<{ slug: string }>();

  const { data: bracket, isLoading } = useQuery({
    queryKey: ['results', slug],
    queryFn: () => bracketsApi.results(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <div className={styles.center}>Loading...</div>;
  if (!bracket) return <div className={styles.center}>Bracket not found.</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{bracket.name}</h1>
        <Link to={`/b/${slug}`} className={styles.voteLink}>← Vote</Link>
      </header>

      <ol className={styles.list}>
        {bracket.entries.map((entry: Entry, i: number) => {
          const total = entry.win_count + entry.loss_count;
          const winRate = total > 0 ? Math.round((entry.win_count / total) * 100) : 0;
          return (
            <li key={entry.id} className={styles.row}>
              <span className={styles.rank}>#{i + 1}</span>
              {entry.image_path && (
                <img src={entry.image_path} alt={entry.label ?? ''} className={styles.thumb} />
              )}
              <span className={styles.entryLabel}>{entry.label ?? entry.image_path}</span>
              <span className={styles.stats}>
                {winRate}% · {total} votes · {Math.round(entry.elo_score)} pts
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
