import client from './client';
import { mockApi } from './mock';
import type { Bracket, Matchup } from './types';

export type { Entry, Bracket, Matchup } from './types';

const MOCK = import.meta.env.VITE_MOCK === 'true';

export const bracketsApi = MOCK ? {
  get: (slug: string) => Promise.resolve(mockApi.get(slug)),
  matchup: (slug: string) => Promise.resolve(mockApi.matchup(slug)),
  vote: (slug: string, winner_id: string, loser_id: string) =>
    Promise.resolve(mockApi.vote(slug, winner_id, loser_id)),
  results: (slug: string) => Promise.resolve(mockApi.results(slug)),
} : {
  get: (slug: string) => client.get<Bracket>(`/brackets/${slug}`).then(r => r.data),
  matchup: (slug: string) => client.get<Matchup>(`/brackets/${slug}/matchup`).then(r => r.data),
  vote: (slug: string, winner_id: string, loser_id: string) =>
    client.post(`/brackets/${slug}/vote`, { winner_id, loser_id }).then(r => r.data),
  results: (slug: string) => client.get<Bracket>(`/brackets/${slug}/results`).then(r => r.data),
};
