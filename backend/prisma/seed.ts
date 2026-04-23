import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const brackets = [
  {
    name: 'Best Programming Languages',
    entries: [
      'TypeScript', 'Python', 'Rust', 'Go',
      'Kotlin', 'Swift', 'Elixir', 'Zig',
    ],
  },
  {
    name: 'Greatest 90s Movies',
    entries: [
      'The Matrix', 'Pulp Fiction', 'Goodfellas', 'Fargo',
      'The Shawshank Redemption', 'Fight Club', 'Heat', 'Jurassic Park',
    ],
  },
];

async function main() {
  const password_hash = await bcrypt.hash('password', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { email: 'test@example.com', password_hash },
  });

  for (const { name, entries: labels } of brackets) {
    const existing = await prisma.bracket.findFirst({ where: { name, owner_id: user.id } });
    if (existing) continue;

    const bracket = await prisma.bracket.create({
      data: { name, slug: nanoid(10), owner_id: user.id },
    });

    const entries = await Promise.all(
      labels.map(label => prisma.entry.create({ data: { bracket_id: bracket.id, label } }))
    );

    // Seed some votes so entries have varied elo scores
    const pairs = entries.flatMap((a, i) => entries.slice(i + 1).map(b => [a, b]));
    const selectedPairs = pairs.sort(() => Math.random() - 0.5).slice(0, 20);

    for (const [a, b] of selectedPairs) {
      const winner = Math.random() > 0.5 ? a : b;
      const loser = winner === a ? b : a;
      await prisma.vote.create({ data: { bracket_id: bracket.id, winner_id: winner.id, loser_id: loser.id } });
      await prisma.entry.update({ where: { id: winner.id }, data: { win_count: { increment: 1 }, elo_score: { increment: 12 } } });
      await prisma.entry.update({ where: { id: loser.id }, data: { loss_count: { increment: 1 }, elo_score: { decrement: 12 } } });
    }

    console.log(`Seeded bracket: ${name} (slug: ${bracket.slug})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
