import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, index: 'text' },
		body: { type: String, required: true, index: 'text' },
		tags: { type: [String], default: [], index: true },
		status: { type: String, enum: ['draft', 'published'], default: 'published', index: true }
	},
	{ timestamps: { createdAt: false, updatedAt: true } }
);

articleSchema.index({ title: 'text', body: 'text', tags: 'text' });

export const Article = mongoose.model('Article', articleSchema);


