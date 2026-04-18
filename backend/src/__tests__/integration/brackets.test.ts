import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

async function registerAndGetCookie(email = 'owner@example.com') {
  const res = await request(app).post('/api/auth/register').send({ email, password: 'password' });
  return res.headers['set-cookie'] as string[];
}

describe('POST /api/brackets', () => {
  it('creates a bracket when authenticated', async () => {
    const cookie = await registerAndGetCookie();
    const res = await request(app).post('/api/brackets').set('Cookie', cookie).send({ name: 'My Bracket' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My Bracket');
    expect(res.body.slug).toBeDefined();
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/brackets').send({ name: 'No Auth' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    const cookie = await registerAndGetCookie();
    const res = await request(app).post('/api/brackets').set('Cookie', cookie).send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/brackets', () => {
  it('lists only the authenticated user\'s brackets', async () => {
    const cookie1 = await registerAndGetCookie('user1@example.com');
    const cookie2 = await registerAndGetCookie('user2@example.com');
    await request(app).post('/api/brackets').set('Cookie', cookie1).send({ name: 'User1 Bracket' });
    await request(app).post('/api/brackets').set('Cookie', cookie2).send({ name: 'User2 Bracket' });

    const res = await request(app).get('/api/brackets').set('Cookie', cookie1);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('User1 Bracket');
  });
});

describe('GET /api/brackets/:slug', () => {
  it('returns bracket by slug publicly', async () => {
    const cookie = await registerAndGetCookie();
    const created = await request(app).post('/api/brackets').set('Cookie', cookie).send({ name: 'Public' });
    const res = await request(app).get(`/api/brackets/${created.body.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Public');
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/brackets/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/brackets/:slug', () => {
  it('allows owner to delete their bracket', async () => {
    const cookie = await registerAndGetCookie();
    const { body } = await request(app).post('/api/brackets').set('Cookie', cookie).send({ name: 'Delete Me' });
    const res = await request(app).delete(`/api/brackets/${body.slug}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
  });

  it('prevents non-owner from deleting', async () => {
    const owner = await registerAndGetCookie('owner2@example.com');
    const other = await registerAndGetCookie('other@example.com');
    const { body } = await request(app).post('/api/brackets').set('Cookie', owner).send({ name: 'Protected' });
    const res = await request(app).delete(`/api/brackets/${body.slug}`).set('Cookie', other);
    expect(res.status).toBe(403);
  });
});
