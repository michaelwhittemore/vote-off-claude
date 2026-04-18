export interface Entry {
  id: string;
  label: string | null;
  image_path: string | null;
  elo_score: number;
  win_count: number;
  loss_count: number;
}

export interface Bracket {
  id: string;
  slug: string;
  name: string;
  status: string;
  entries: Entry[];
}

export interface Matchup {
  entryA: Entry;
  entryB: Entry;
}
