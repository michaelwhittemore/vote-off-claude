import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bracketsApi } from '../api/brackets';
import { EntryCard } from '../components/EntryCard';
import styles from './Vote.module.css';

export function Vote() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [voted, setVoted] = useState<{ winnerId: string; loserId: string } | null>(null);

  const { data: bracket } = useQuery({
    queryKey: ['bracket', slug],
    queryFn: () => bracketsApi.get(slug!),
  });

  const { data: matchup, isLoading, isError } = useQuery({
    queryKey: ['matchup', slug],
    queryFn: () => bracketsApi.matchup(slug!),
    enabled: !!slug,
  });

  const { mutate: submitVote } = useMutation({
    mutationFn: ({ winnerId, loserId }: { winnerId: string; loserId: string }) =>
      bracketsApi.vote(slug!, winnerId, loserId),
    onMutate: ({ winnerId, loserId }) => setVoted({ winnerId, loserId }),
    onSuccess: () => {
      setTimeout(() => {
        setVoted(null);
        queryClient.invalidateQueries({ queryKey: ['matchup', slug] });
      }, 700);
    },
  });

  if (isLoading) return <div className={styles.center}>Loading...</div>;
  if (isError || !matchup) return <div className={styles.center}>Could not load bracket.</div>;

  const { entryA, entryB } = matchup;

  return (
    <div className={styles.page}>
      <Link to="/dashboard" className={styles.backLink}>← My brackets</Link>
      <header className={styles.header}>
        <h1 className={styles.title}>{bracket?.name ?? '...'}</h1>
        <Link to={`/b/${slug}/results`} className={styles.resultsLink}>
          View rankings →
        </Link>
      </header>

      <p className={styles.prompt}>Which do you prefer?</p>

      <div className={styles.arena}>
        <EntryCard
          entry={entryA}
          onClick={() => submitVote({ winnerId: entryA.id, loserId: entryB.id })}
          disabled={!!voted}
          result={voted ? (voted.winnerId === entryA.id ? 'winner' : 'loser') : undefined}
        />

        <span className={styles.vs}>VS</span>

        <EntryCard
          entry={entryB}
          onClick={() => submitVote({ winnerId: entryB.id, loserId: entryA.id })}
          disabled={!!voted}
          result={voted ? (voted.winnerId === entryB.id ? 'winner' : 'loser') : undefined}
        />
      </div>
    </div>
  );
}
