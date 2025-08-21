import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		category: { type: String, enum: ['billing', 'tech', 'shipping', 'other'], default: 'other', index: true },
		status: { type: String, enum: ['open', 'triaged', 'waiting_human', 'resolved', 'closed'], default: 'open', index: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
		agentSuggestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentSuggestion', default: null },
		slaBreached: { type: Boolean, default: false, index: true },
		messages: [
			{
				actor: { type: String, enum: ['system', 'agent', 'user'], required: true },
				body: { type: String, required: true },
				timestamp: { type: Date, default: Date.now }
			}
		]
	},
	{ timestamps: true }
);

export const Ticket = mongoose.model('Ticket', ticketSchema);


