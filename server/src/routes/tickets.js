import express from 'express';
import { z } from 'zod';
import { authRequired, requireRole } from '../middleware/auth.js';
import { Ticket } from '../models/Ticket.js';
import { AuditLog } from '../models/AuditLog.js';
import { triageTicket } from '../services/agent.js';
import { AgentSuggestion } from '../models/AgentSuggestion.js';
import { broadcast } from '../utils/sse.js';

export const router = express.Router();

const createSchema = z.object({
	title: z.string().min(3),
	description: z.string().min(10)
});

router.post('/', authRequired, async (req, res) => {
	const parsed = createSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const ticket = await Ticket.create({ ...parsed.data, createdBy: req.user.sub });
	await AuditLog.create({ ticketId: ticket._id, traceId: ticket._id.toString(), actor: 'user', action: 'TICKET_CREATED', meta: {}, timestamp: new Date() });
	broadcast('audit', { ticketId: ticket._id.toString(), action: 'TICKET_CREATED', traceId: ticket._id.toString() });
	res.status(201).json(ticket);
});

router.get('/', authRequired, async (req, res) => {
	const status = req.query.status;
	const mine = req.query.mine === 'true';
	const filter = {};
	if (status) filter.status = status;
	if (mine) filter.createdBy = req.user.sub;
	const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).limit(100).lean();
	res.json(tickets);
});

router.get('/:id', authRequired, async (req, res) => {
	const ticket = await Ticket.findById(req.params.id).lean();
	if (!ticket) return res.status(404).json({ error: 'Not found' });
	const suggestion = ticket.agentSuggestionId ? await AgentSuggestion.findById(ticket.agentSuggestionId).lean() : null;
	res.json({ ticket, suggestion });
});

const replySchema = z.object({ body: z.string().min(1), actor: z.enum(['user', 'agent']).optional() });
router.post('/:id/reply', authRequired, async (req, res) => {
	const parsed = replySchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const actor = parsed.data.actor || 'user';
	const ticket = await Ticket.findByIdAndUpdate(
		req.params.id,
		{ $push: { messages: { actor, body: parsed.data.body, timestamp: new Date() } }, updatedAt: new Date() },
		{ new: true }
	);
	if (!ticket) return res.status(404).json({ error: 'Not found' });
	await AuditLog.create({ ticketId: ticket._id, traceId: ticket._id.toString(), actor, action: 'REPLY_SENT', meta: {}, timestamp: new Date() });
	broadcast('audit', { ticketId: ticket._id.toString(), action: 'REPLY_SENT', traceId: ticket._id.toString(), actor });
	res.json(ticket);
});

const assignSchema = z.object({ assigneeId: z.string().min(1) });
router.post('/:id/assign', authRequired, requireRole('admin', 'agent'), async (req, res) => {
	const parsed = assignSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const ticket = await Ticket.findByIdAndUpdate(req.params.id, { assignee: parsed.data.assigneeId, status: 'waiting_human' }, { new: true });
	if (!ticket) return res.status(404).json({ error: 'Not found' });
	await AuditLog.create({ ticketId: ticket._id, traceId: ticket._id.toString(), actor: 'agent', action: 'ASSIGNED_TO_HUMAN', meta: { assigneeId: parsed.data.assigneeId }, timestamp: new Date() });
	broadcast('audit', { ticketId: ticket._id.toString(), action: 'ASSIGNED_TO_HUMAN', traceId: ticket._id.toString(), assigneeId: parsed.data.assigneeId });
	res.json(ticket);
});

router.get('/:id/audit', authRequired, async (req, res) => {
	const items = await AuditLog.find({ ticketId: req.params.id }).sort({ timestamp: 1 }).lean();
	res.json(items);
});

router.post('/:id/triage', authRequired, async (req, res) => {
	// enqueue or run inline for simplicity
	try {
		const { suggestionId, autoClosed } = await triageTicket(req.params.id, {});
		res.json({ suggestionId, autoClosed });
	} catch (e) {
		res.status(400).json({ error: 'Cannot triage' });
	}
});


