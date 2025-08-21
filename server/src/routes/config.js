import express from 'express';
import { z } from 'zod';
import { Config } from '../models/Config.js';
import { authRequired, requireRole } from '../middleware/auth.js';

export const router = express.Router();

router.get('/', authRequired, async (req, res) => {
	const cfg = (await Config.findOne().lean()) || { autoCloseEnabled: true, confidenceThreshold: 0.75, slaHours: 24 };
	res.json(cfg);
});

const schema = z.object({
	autoCloseEnabled: z.boolean(),
	confidenceThreshold: z.number().min(0).max(1),
	slaHours: z.number().min(1).max(168)
});

router.put('/', authRequired, requireRole('admin'), async (req, res) => {
	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const cfg = await Config.findOneAndUpdate({}, parsed.data, { upsert: true, new: true });
	res.json(cfg);
});


