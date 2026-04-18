import { config } from 'dotenv';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.test' });

const prisma = new PrismaClient();

// Run migrations against test DB before the suite
beforeAll(async () => {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
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
