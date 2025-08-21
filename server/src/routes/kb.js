import express from 'express';
import { z } from 'zod';
import { Article } from '../models/Article.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const router = express.Router();

router.get('/', authRequired, async (req, res) => {
	const q = String(req.query.query || '').trim();
	const filter = { status: 'published' };
	if (q) {
		filter.$text = { $search: q };
	}
	const articles = await Article.find(filter).sort(q ? { score: { $meta: 'textScore' } } : { updatedAt: -1 }).limit(50).lean();
	res.json(articles);
});

const upsertSchema = z.object({
	title: z.string().min(3),
	body: z.string().min(10),
	tags: z.array(z.string()).default([]),
	status: z.enum(['draft', 'published']).default('published')
});

router.post('/', authRequired, requireRole('admin'), async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const doc = await Article.create(parsed.data);
	res.status(201).json(doc);
});

router.put('/:id', authRequired, requireRole('admin'), async (req, res) => {
	const parsed = upsertSchema.partial().safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const doc = await Article.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
	if (!doc) return res.status(404).json({ error: 'Not found' });
	res.json(doc);
});

router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
	const ok = await Article.findByIdAndDelete(req.params.id);
	if (!ok) return res.status(404).json({ error: 'Not found' });
	res.status(204).end();
});


