import type { Entry } from '../api/brackets';
import styles from './EntryCard.module.css';

interface Props {
  entry: Entry;
  onClick: () => void;
  disabled: boolean;
  result?: 'winner' | 'loser';
}

export function EntryCard({ entry, onClick, disabled, result }: Props) {
  const className = [
    styles.card,
    result === 'winner' ? styles.winner : '',
    result === 'loser' ? styles.loser : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {entry.image_path && (
        <img src={entry.image_path} alt={entry.label ?? ''} className={styles.image} loading="lazy" />
      )}
      {entry.label && <span className={styles.label}>{entry.label}</span>}
      {result === 'winner' && <span className={styles.badge}>✓</span>}
    </button>
  );
}
