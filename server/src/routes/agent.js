import express from 'express';
import { z } from 'zod';
import { authRequired, requireRole } from '../middleware/auth.js';
import { triageTicket } from '../services/agent.js';
import { AgentSuggestion } from '../models/AgentSuggestion.js';

export const router = express.Router();

const triageSchema = z.object({ ticketId: z.string().min(1) });

router.post('/triage', authRequired, requireRole('admin', 'agent'), async (req, res) => {
	const parsed = triageSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	try {
		const { suggestionId, autoClosed } = await triageTicket(parsed.data.ticketId, {});
		res.json({ suggestionId, autoClosed });
	} catch (e) {
		res.status(400).json({ error: 'Cannot triage' });
	}
});

router.get('/suggestion/:ticketId', authRequired, async (req, res) => {
	const suggestion = await AgentSuggestion.findOne({ ticketId: req.params.ticketId }).sort({ createdAt: -1 }).lean();
	if (!suggestion) return res.status(404).json({ error: 'Not found' });
	res.json(suggestion);
});


