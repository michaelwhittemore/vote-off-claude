import { Bracket, Entry, Matchup } from './types';

const entries: Entry[] = [
  { id: '1', label: 'TypeScript', image_path: null, elo_score: 1050, win_count: 4, loss_count: 1 },
  { id: '2', label: 'Python',     image_path: null, elo_score: 1030, win_count: 3, loss_count: 2 },
  { id: '3', label: 'Rust',       image_path: null, elo_score: 1020, win_count: 3, loss_count: 2 },
  { id: '4', label: 'Go',         image_path: null, elo_score: 1000, win_count: 2, loss_count: 3 },
  { id: '5', label: 'Kotlin',     image_path: null, elo_score: 990,  win_count: 2, loss_count: 3 },
  { id: '6', label: 'Swift',      image_path: null, elo_score: 975,  win_count: 1, loss_count: 4 },
  { id: '7', label: 'Elixir',     image_path: null, elo_score: 960,  win_count: 1, loss_count: 4 },
  { id: '8', label: 'Zig',        image_path: null, elo_score: 950,  win_count: 0, loss_count: 5 },
];

const bracket: Bracket = {
  id: 'mock-1',
  slug: 'mock',
  name: 'Best Programming Languages',
  status: 'active',
  entries,
};

const K = 32;

function updateElo(winnerId: string, loserId: string) {
  const winner = entries.find(e => e.id === winnerId)!;
  const loser  = entries.find(e => e.id === loserId)!;
  const expected = 1 / (1 + Math.pow(10, (loser.elo_score - winner.elo_score) / 400));
  winner.elo_score += K * (1 - expected);
  loser.elo_score  += K * (0 - (1 - expected));
  winner.win_count++;
  loser.loss_count++;
}

function pickMatchup(): Matchup {
  const sorted = [...entries].sort(
    (a, b) => (a.win_count + a.loss_count) - (b.win_count + b.loss_count)
  );
  const entryA = sorted[0];
  const pool = sorted.slice(1, Math.max(2, Math.ceil(sorted.length / 2)));
  const entryB = pool[Math.floor(Math.random() * pool.length)];
  return { entryA, entryB };
}

export const mockApi = {
  get: (_slug: string): Bracket => ({ ...bracket, entries: [...entries] }),
  matchup: (_slug: string): Matchup => pickMatchup(),
  vote: (_slug: string, winnerId: string, loserId: string) => {
    updateElo(winnerId, loserId);
    return { ok: true };
  },
  results: (_slug: string): Bracket => ({
    ...bracket,
    entries: [...entries].sort((a, b) => b.elo_score - a.elo_score),
  }),
};
