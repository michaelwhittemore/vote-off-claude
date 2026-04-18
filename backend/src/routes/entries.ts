import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/:slug/entries', requireAuth, upload.single('image'), async (req: AuthRequest, res: Response) => {
  const bracket = await prisma.bracket.findUnique({ where: { slug: req.params.slug } });
  if (!bracket || bracket.owner_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const count = await prisma.entry.count({ where: { bracket_id: bracket.id } });
  if (count >= 64) {
    res.status(400).json({ error: 'Maximum 64 entries per bracket' }); return;
  }
  const { label } = req.body;
  const image_path = req.file ? `/uploads/${req.file.filename}` : undefined;
  if (!image_path && !label) {
    res.status(400).json({ error: 'Entry must have an image or label' }); return;
  }
  const entry = await prisma.entry.create({
    data: { bracket_id: bracket.id, image_path, label },
  });
  res.status(201).json(entry);
});

router.delete('/:slug/entries/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const bracket = await prisma.bracket.findUnique({ where: { slug: req.params.slug } });
  if (!bracket || bracket.owner_id !== req.userId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  await prisma.entry.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
