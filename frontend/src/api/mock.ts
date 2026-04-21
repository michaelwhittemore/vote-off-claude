import type { Bracket, Entry, Matchup } from './types';

let nextId = 9;
let nextBracketNum = 2;

const initialEntries: Entry[] = [
  { id: '1', label: 'TypeScript', image_path: null, elo_score: 1050, win_count: 4, loss_count: 1 },
  { id: '2', label: 'Python',     image_path: null, elo_score: 1030, win_count: 3, loss_count: 2 },
  { id: '3', label: 'Rust',       image_path: null, elo_score: 1020, win_count: 3, loss_count: 2 },
  { id: '4', label: 'Go',         image_path: null, elo_score: 1000, win_count: 2, loss_count: 3 },
  { id: '5', label: 'Kotlin',     image_path: null, elo_score: 990,  win_count: 2, loss_count: 3 },
  { id: '6', label: 'Swift',      image_path: null, elo_score: 975,  win_count: 1, loss_count: 4 },
  { id: '7', label: 'Elixir',     image_path: null, elo_score: 960,  win_count: 1, loss_count: 4 },
  { id: '8', label: 'Zig',        image_path: null, elo_score: 950,  win_count: 0, loss_count: 5 },
];

type BracketStore = { bracket: Bracket; entries: Entry[] };

const store = new Map<string, BracketStore>([
  ['mock', {
    bracket: { id: 'mock-1', slug: 'mock', name: 'Best Programming Languages', status: 'active', entries: [] },
    entries: initialEntries.map(e => ({ ...e })),
  }],
]);

function getStore(slug: string): BracketStore {
  const s = store.get(slug);
  if (!s) throw new Error(`Bracket not found: ${slug}`);
  return s;
}

function toBracket(s: BracketStore): Bracket {
  return { ...s.bracket, entries: [...s.entries] };
}

const K = 32;

function updateElo(slug: string, winnerId: string, loserId: string) {
  const { entries } = getStore(slug);
  const winner = entries.find(e => e.id === winnerId)!;
  const loser  = entries.find(e => e.id === loserId)!;
  const expected = 1 / (1 + Math.pow(10, (loser.elo_score - winner.elo_score) / 400));
  winner.elo_score += K * (1 - expected);
  loser.elo_score  += K * (0 - (1 - expected));
  winner.win_count++;
  loser.loss_count++;
}

function pickMatchup(slug: string): Matchup {
  const { entries } = getStore(slug);
  const sorted = [...entries].sort(
    (a, b) => (a.win_count + a.loss_count) - (b.win_count + b.loss_count)
  );
  const entryA = sorted[0];
  const pool = sorted.slice(1, Math.max(2, Math.ceil(sorted.length / 2)));
  const entryB = pool[Math.floor(Math.random() * pool.length)];
  return { entryA, entryB };
}

export const mockApi = {
  // --- voting ---
  get: (slug: string): Bracket => toBracket(getStore(slug)),

  matchup: (slug: string): Matchup => pickMatchup(slug),

  vote: (slug: string, winnerId: string, loserId: string) => {
    updateElo(slug, winnerId, loserId);
    return { ok: true };
  },

  results: (slug: string): Bracket => {
    const s = getStore(slug);
    return { ...s.bracket, entries: [...s.entries].sort((a, b) => b.elo_score - a.elo_score) };
  },

  // --- bracket management ---
  list: (): Bracket[] => Array.from(store.values()).map(toBracket),

  create: (name: string): Bracket => {
    const slug = `mock-${nextBracketNum++}`;
    const bracket: Bracket = { id: `bracket-${slug}`, slug, name, status: 'active', entries: [] };
    store.set(slug, { bracket, entries: [] });
    return { ...bracket };
  },

  update: (slug: string, data: { name?: string; status?: string }): Bracket => {
    const s = getStore(slug);
    if (data.name !== undefined) s.bracket.name = data.name;
    if (data.status !== undefined) s.bracket.status = data.status;
    return toBracket(s);
  },

  deleteBracket: (slug: string) => {
    store.delete(slug);
    return { ok: true };
  },

  addEntry: (slug: string, label: string): Entry => {
    const s = getStore(slug);
    const entry: Entry = {
      id: String(nextId++),
      label,
      image_path: null,
      elo_score: 1000,
      win_count: 0,
      loss_count: 0,
    };
    s.entries.push(entry);
    return { ...entry };
  },

  removeEntry: (slug: string, entryId: string) => {
    const s = getStore(slug);
    s.entries = s.entries.filter(e => e.id !== entryId);
    return { ok: true };
  },
};
