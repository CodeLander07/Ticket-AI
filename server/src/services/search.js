import { Article } from '../models/Article.js';

// Simple keyword search using MongoDB text index + regex fallback
export async function searchKB(query, limit = 3) {
	if (!query || !query.trim()) return [];
	const textResults = await Article.find(
		{ $text: { $search: query }, status: 'published' },
		{ score: { $meta: 'textScore' } }
	)
		.sort({ score: { $meta: 'textScore' } })
		.limit(limit)
		.lean();
	if (textResults.length > 0) return textResults;
	const regex = new RegExp(query.split(/\s+/).join('|'), 'i');
	return Article.find({ status: 'published', $or: [{ title: regex }, { body: regex }, { tags: regex }] })
		.limit(limit)
		.lean();
}


