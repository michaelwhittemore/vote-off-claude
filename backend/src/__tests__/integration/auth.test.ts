import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('POST /api/auth/register', () => {
  it('creates a user and returns their info', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate emails', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dupe@example.com', password: 'pass' });
    const res = await request(app).post('/api/auth/register').send({ email: 'dupe@example.com', password: 'pass' });
    expect(res.status).toBe(409);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'no-pass@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns user and sets cookie on valid credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login@example.com', password: 'secret' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'secret' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('login@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send({ email: 'wrongpass@example.com', password: 'correct' });
    const res = await request(app).post('/api/auth/login').send({ email: 'wrongpass@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user when authenticated', async () => {
    const reg = await request(app).post('/api/auth/register').send({ email: 'me@example.com', password: 'pass' });
    const cookie = reg.headers['set-cookie'];
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@example.com');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
