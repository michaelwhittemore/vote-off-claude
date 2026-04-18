import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { calculateElo } from '../services/elo';

const router = Router();

router.get('/:slug/matchup', async (req: Request, res: Response) => {
  const bracket = await prisma.bracket.findUnique({
    where: { slug: req.params.slug },
    include: {
      entries: { orderBy: [{ win_count: 'asc' }, { loss_count: 'asc' }] },
    },
  });
  if (!bracket) { res.status(404).json({ error: 'Bracket not found' }); return; }
  if (bracket.entries.length < 2) {
    res.status(400).json({ error: 'Not enough entries' }); return;
  }

  // Pick the two entries with the fewest total matches for even coverage
  const sorted = [...bracket.entries].sort(
    (a, b) => (a.win_count + a.loss_count) - (b.win_count + b.loss_count)
  );
  const entryA = sorted[0];
  // Pick a random opponent from the bottom half to add variety
  const pool = sorted.slice(1, Math.max(2, Math.ceil(sorted.length / 2)));
  const entryB = pool[Math.floor(Math.random() * pool.length)];

  res.json({ entryA, entryB });
});

router.post('/:slug/vote', async (req: Request, res: Response) => {
  const { winner_id, loser_id } = req.body;
  if (!winner_id || !loser_id) {
    res.status(400).json({ error: 'winner_id and loser_id required' }); return;
  }
  const bracket = await prisma.bracket.findUnique({ where: { slug: req.params.slug } });
  if (!bracket) { res.status(404).json({ error: 'Bracket not found' }); return; }

  const [winner, loser] = await Promise.all([
    prisma.entry.findUnique({ where: { id: winner_id } }),
    prisma.entry.findUnique({ where: { id: loser_id } }),
  ]);
  if (!winner || !loser) { res.status(404).json({ error: 'Entry not found' }); return; }

  const { newWinnerScore, newLoserScore } = calculateElo(winner.elo_score, loser.elo_score);

  await prisma.$transaction([
    prisma.vote.create({ data: { bracket_id: bracket.id, winner_id, loser_id } }),
    prisma.entry.update({
      where: { id: winner_id },
      data: { elo_score: newWinnerScore, win_count: { increment: 1 } },
    }),
    prisma.entry.update({
      where: { id: loser_id },
      data: { elo_score: newLoserScore, loss_count: { increment: 1 } },
    }),
  ]);

  res.json({ ok: true });
});

router.get('/:slug/results', async (req: Request, res: Response) => {
  const bracket = await prisma.bracket.findUnique({
    where: { slug: req.params.slug },
    include: {
      entries: { orderBy: { elo_score: 'desc' } },
      _count: { select: { votes: true } },
    },
  });
  if (!bracket) { res.status(404).json({ error: 'Bracket not found' }); return; }
  res.json(bracket);
});

export default router;
