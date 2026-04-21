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
  list: () => Promise.resolve(mockApi.list()),
  create: (name: string) => Promise.resolve(mockApi.create(name)),
  update: (slug: string, data: { name?: string; status?: string }) =>
    Promise.resolve(mockApi.update(slug, data)),
  deleteBracket: (slug: string) => Promise.resolve(mockApi.deleteBracket(slug)),
  addEntry: (slug: string, formData: FormData) =>
    Promise.resolve(mockApi.addEntry(slug, formData.get('label') as string)),
  removeEntry: (slug: string, entryId: string) =>
    Promise.resolve(mockApi.removeEntry(slug, entryId)),
} : {
  get: (slug: string) => client.get<Bracket>(`/brackets/${slug}`).then(r => r.data),
  matchup: (slug: string) => client.get<Matchup>(`/brackets/${slug}/matchup`).then(r => r.data),
  vote: (slug: string, winner_id: string, loser_id: string) =>
    client.post(`/brackets/${slug}/vote`, { winner_id, loser_id }).then(r => r.data),
  results: (slug: string) => client.get<Bracket>(`/brackets/${slug}/results`).then(r => r.data),
  list: () => client.get<Bracket[]>('/brackets').then(r => r.data),
  create: (name: string) => client.post<Bracket>('/brackets', { name }).then(r => r.data),
  update: (slug: string, data: { name?: string; status?: string }) =>
    client.patch<Bracket>(`/brackets/${slug}`, data).then(r => r.data),
  deleteBracket: (slug: string) => client.delete(`/brackets/${slug}`).then(r => r.data),
  addEntry: (slug: string, formData: FormData) =>
    client.post(`/brackets/${slug}/entries`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  removeEntry: (slug: string, entryId: string) =>
    client.delete(`/brackets/${slug}/entries/${entryId}`).then(r => r.data),
};
