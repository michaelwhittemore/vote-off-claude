import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import prisma from '../../lib/prisma';
import app from '../../app';

let cookie: string[];
let slug: string;

beforeEach(async () => {
  const reg = await request(app).post('/api/auth/register').send({ email: 'voter@example.com', password: 'pass' });
  cookie = reg.headers['set-cookie'];
  const bracket = await request(app).post('/api/brackets').set('Cookie', cookie).send({ name: 'Vote Test' });
  slug = bracket.body.slug;

  // Add entries directly via Prisma for speed
  await prisma.entry.createMany({
    data: [
      { bracket_id: bracket.body.id, label: 'Entry A' },
      { bracket_id: bracket.body.id, label: 'Entry B' },
      { bracket_id: bracket.body.id, label: 'Entry C' },
    ],
  });
});

describe('GET /api/brackets/:slug/matchup', () => {
  it('returns two different entries', async () => {
    const res = await request(app).get(`/api/brackets/${slug}/matchup`);
    expect(res.status).toBe(200);
    expect(res.body.entryA).toBeDefined();
    expect(res.body.entryB).toBeDefined();
    expect(res.body.entryA.id).not.toBe(res.body.entryB.id);
  });

  it('returns 400 when bracket has fewer than 2 entries', async () => {
    const b = await request(app).post('/api/brackets').set('Cookie', cookie).send({ name: 'Empty' });
    await prisma.entry.create({ data: { bracket_id: b.body.id, label: 'Solo' } });
    const res = await request(app).get(`/api/brackets/${b.body.slug}/matchup`);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/brackets/:slug/vote', () => {
  it('records a vote and updates elo scores', async () => {
    const matchup = await request(app).get(`/api/brackets/${slug}/matchup`);
    const { entryA, entryB } = matchup.body;

    const res = await request(app)
      .post(`/api/brackets/${slug}/vote`)
      .send({ winner_id: entryA.id, loser_id: entryB.id });
    expect(res.status).toBe(200);

    const updatedWinner = await prisma.entry.findUnique({ where: { id: entryA.id } });
    const updatedLoser = await prisma.entry.findUnique({ where: { id: entryB.id } });
    expect(updatedWinner!.elo_score).toBeGreaterThan(1000);
    expect(updatedLoser!.elo_score).toBeLessThan(1000);
    expect(updatedWinner!.win_count).toBe(1);
    expect(updatedLoser!.loss_count).toBe(1);
  });

  it('returns 400 when winner_id or loser_id is missing', async () => {
    const res = await request(app).post(`/api/brackets/${slug}/vote`).send({ winner_id: 'abc' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/brackets/:slug/results', () => {
  it('returns entries sorted by elo descending', async () => {
    const matchup = await request(app).get(`/api/brackets/${slug}/matchup`);
    const { entryA, entryB } = matchup.body;
    await request(app).post(`/api/brackets/${slug}/vote`).send({ winner_id: entryA.id, loser_id: entryB.id });

    const res = await request(app).get(`/api/brackets/${slug}/results`);
    expect(res.status).toBe(200);
    const scores = res.body.entries.map((e: { elo_score: number }) => e.elo_score);
    expect(scores[0]).toBeGreaterThanOrEqual(scores[1]);
  });
});
