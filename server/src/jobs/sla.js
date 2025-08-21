import { Config } from '../models/Config.js';
import { Ticket } from '../models/Ticket.js';
import { AuditLog } from '../models/AuditLog.js';

export async function runSlaScan() {
	const cfg = (await Config.findOne().lean()) || { slaHours: 24 };
	const cutoff = new Date(Date.now() - cfg.slaHours * 60 * 60 * 1000);
	const candidates = await Ticket.find({
		status: { $in: ['open', 'waiting_human'] },
		slaBreached: false,
		createdAt: { $lt: cutoff }
	}).select({ _id: 1 }).lean();
	if (candidates.length === 0) return 0;
	const ids = candidates.map(c => c._id);
	await Ticket.updateMany({ _id: { $in: ids } }, { $set: { slaBreached: true } });
	for (const id of ids) {
		await AuditLog.create({ ticketId: id, traceId: String(id), actor: 'system', action: 'SLA_BREACHED', meta: { slaHours: cfg.slaHours }, timestamp: new Date() });
	}
	return ids.length;
}

export function startSlaScheduler() {
	const intervalMs = 60 * 60 * 1000; // hourly
	setInterval(() => {
		runSlaScan().catch(() => {});
	}, intervalMs);
}


