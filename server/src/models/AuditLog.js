import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
	{
		ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
		traceId: { type: String, required: true, index: true },
		actor: { type: String, enum: ['system', 'agent', 'user'], required: true },
		action: { type: String, required: true },
		meta: { type: mongoose.Schema.Types.Mixed, default: {} },
		timestamp: { type: Date, default: Date.now, index: true }
	},
	{ versionKey: false }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);


