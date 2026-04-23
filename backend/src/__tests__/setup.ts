import { config } from 'dotenv';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Client } from 'pg';

config({ path: '.env.test' });

// Derive the test DB URL from the current DATABASE_URL so it works in both
// Docker (where DATABASE_URL points at postgres:5432/voteoff) and locally.
// This prevents tests from accidentally wiping the dev database.
const testDbUrl = (process.env.DATABASE_URL ?? '')
  .replace(/\/[^/]+$/, '/voteoff_test');

// Set early so lib/prisma.ts (imported by the app) uses the test DB
process.env.DATABASE_URL = testDbUrl;

const adapter = new PrismaPg({ connectionString: testDbUrl });
const prisma = new PrismaClient({ adapter });

// Ensure the test database exists and has the current schema applied
beforeAll(async () => {
  const adminUrl = (process.env.DATABASE_URL ?? '').replace(/\/[^/]+$/, '/postgres');
  const client = new Client({ connectionString: adminUrl });
  await client.connect();
  await client.query(`CREATE DATABASE voteoff_test`).catch(() => {});
  await client.end();

  execSync(`npx prisma db push --url "${testDbUrl}" --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: testDbUrl },
  });
});

// Wipe all data between tests so each test starts clean
beforeEach(async () => {
  await prisma.vote.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.bracket.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
