import mongoose from 'mongoose';

const agentSuggestionSchema = new mongoose.Schema(
	{
		ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
		predictedCategory: { type: String, enum: ['billing', 'tech', 'shipping', 'other'], required: true },
		articleIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Article', default: [] },
		draftReply: { type: String, required: true },
		confidence: { type: Number, required: true },
		autoClosed: { type: Boolean, default: false },
		modelInfo: {
			provider: String,
			model: String,
			promptVersion: String,
			latencyMs: Number
		}
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

export const AgentSuggestion = mongoose.model('AgentSuggestion', agentSuggestionSchema);


