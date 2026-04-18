import { Router, Response } from 'express';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'Name required' }); return; }
  const bracket = await prisma.bracket.create({
    data: { name, slug: nanoid(10), owner_id: req.userId! },
  });
  res.status(201).json(bracket);
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const brackets = await prisma.bracket.findMany({
    where: { owner_id: req.userId! },
    include: { _count: { select: { entries: true, votes: true } } },
    orderBy: { created_at: 'desc' },
  });
  res.json(brackets);
});

router.get('/:slug', async (req, res: Response) => {
  const bracket = await prisma.bracket.findUnique({
    where: { slug: req.params.slug },
    include: { entries: true },
  });
  if (!bracket) { res.status(404).json({ error: 'Bracket not found' }); return; }
  res.json(bracket);
});

router.patch('/:slug', requireAuth, async (req: AuthRequest, res: Response) => {
  const bracket = await prisma.bracket.findUnique({ where: { slug: req.params.slug } });
  if (!bracket || bracket.owner_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const updated = await prisma.bracket.update({
    where: { slug: req.params.slug },
    data: { name: req.body.name, status: req.body.status },
  });
  res.json(updated);
});

router.delete('/:slug', requireAuth, async (req: AuthRequest, res: Response) => {
  const bracket = await prisma.bracket.findUnique({ where: { slug: req.params.slug } });
  if (!bracket || bracket.owner_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  await prisma.bracket.delete({ where: { slug: req.params.slug } });
  res.json({ ok: true });
});

export default router;
