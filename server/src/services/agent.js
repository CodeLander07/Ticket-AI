import { v4 as uuidv4 } from 'uuid';
import { LLMProvider } from '../utils/llmProvider.js';
import { searchKB } from './search.js';
import { AgentSuggestion } from '../models/AgentSuggestion.js';
import { Ticket } from '../models/Ticket.js';
import { AuditLog } from '../models/AuditLog.js';
import { Config } from '../models/Config.js';
import { broadcast } from '../utils/sse.js';

const llm = new LLMProvider();

export async function triageTicket(ticketId, options = {}) {
	const traceId = options.traceId || uuidv4();
	const timeoutMs = options.timeoutMs || 15000;
	const startedAt = Date.now();
	const ticket = await Ticket.findById(ticketId).lean();
	if (!ticket) throw new Error('Ticket not found');

	await AuditLog.create({ ticketId, traceId, actor: 'system', action: 'TRIAGE_STARTED', meta: {}, timestamp: new Date() });
	broadcast('audit', { ticketId, action: 'TRIAGE_STARTED', traceId });

	// 1. Classify
	const { predictedCategory, confidence, modelInfo: classifyInfo } = await withTimeout(
		llm.classify(`${ticket.title}\n${ticket.description}`),
		Math.max(1000, timeoutMs - (Date.now() - startedAt))
	);
	await AuditLog.create({ ticketId, traceId, actor: 'agent', action: 'AGENT_CLASSIFIED', meta: { predictedCategory, confidence }, timestamp: new Date() });
	broadcast('audit', { ticketId, action: 'AGENT_CLASSIFIED', traceId, meta: { predictedCategory, confidence } });

	// 2. Retrieve KB
	const query = `${ticket.title} ${ticket.description}`;
	const kbArticles = await withTimeout(
		searchKB(query, 3),
		Math.max(1000, timeoutMs - (Date.now() - startedAt))
	);
	await AuditLog.create({ ticketId, traceId, actor: 'agent', action: 'KB_RETRIEVED', meta: { articleIds: kbArticles.map(a => a._id) }, timestamp: new Date() });
	broadcast('audit', { ticketId, action: 'KB_RETRIEVED', traceId, meta: { articleIds: kbArticles.map(a => a._id) } });

	// 3. Draft reply
	const { draftReply, citations, modelInfo: draftInfo } = await withTimeout(
		llm.draft(`${ticket.description}`, kbArticles),
		Math.max(1000, timeoutMs - (Date.now() - startedAt))
	);
	await AuditLog.create({ ticketId, traceId, actor: 'agent', action: 'DRAFT_GENERATED', meta: { draftReply, citations }, timestamp: new Date() });
	broadcast('audit', { ticketId, action: 'DRAFT_GENERATED', traceId });

	// 4. Decision
	const cfg = (await Config.findOne().lean()) || { autoCloseEnabled: true, confidenceThreshold: 0.75 };
	let autoClosed = false;
	let newStatus = 'waiting_human';
	if (cfg.autoCloseEnabled && confidence >= cfg.confidenceThreshold) {
		autoClosed = true;
		newStatus = 'resolved';
	}

	// Persist suggestion
	const suggestion = await AgentSuggestion.create({
		ticketId,
		predictedCategory,
		articleIds: kbArticles.map((a) => a._id),
		draftReply,
		confidence,
		autoClosed,
		modelInfo: { provider: classifyInfo.provider, model: `${classifyInfo.model}+${draftInfo.model}`, promptVersion: 'v1', latencyMs: classifyInfo.latencyMs + draftInfo.latencyMs }
	});

	// Update ticket
	const pushMessage = autoClosed ? { messages: { actor: 'agent', body: draftReply, timestamp: new Date() } } : null;
	await Ticket.updateOne(
		{ _id: ticketId },
		{
			$set: { category: predictedCategory, status: autoClosed ? 'resolved' : 'waiting_human', agentSuggestionId: suggestion._id, updatedAt: new Date() },
			...(pushMessage ? { $push: pushMessage } : {})
		}
	);

	await AuditLog.create({ ticketId, traceId, actor: 'agent', action: autoClosed ? 'AUTO_CLOSED' : 'ASSIGNED_TO_HUMAN', meta: { suggestionId: suggestion._id }, timestamp: new Date() });
	broadcast('audit', { ticketId, action: autoClosed ? 'AUTO_CLOSED' : 'ASSIGNED_TO_HUMAN', traceId });

	return { suggestionId: suggestion._id, autoClosed };
}

function withTimeout(promise, ms) {
	return new Promise((resolve, reject) => {
		const id = setTimeout(() => reject(new Error('Timed out')), ms);
		promise.then((v) => { clearTimeout(id); resolve(v); }, (e) => { clearTimeout(id); reject(e); });
	});
}


