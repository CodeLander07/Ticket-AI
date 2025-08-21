import { performance } from 'node:perf_hooks';

export class LLMProvider {
	constructor() {
		this.stubMode = (process.env.STUB_MODE || 'true').toLowerCase() === 'true';
	}

	async classify(text) {
		const start = performance.now();
		if (this.stubMode) {
			const lower = text.toLowerCase();
			const billingWords = ['refund', 'invoice', 'billing', 'charge', 'payment'];
			const techWords = ['error', 'bug', 'stack', 'exception', 'crash', 'api'];
			const shippingWords = ['delivery', 'shipment', 'shipping', 'courier', 'tracking'];
			const score = (words) => words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
			const sBilling = score(billingWords);
			const sTech = score(techWords);
			const sShipping = score(shippingWords);
			let category = 'other';
			let maxScore = 0;
			if (sBilling >= sTech && sBilling >= sShipping && sBilling > 0) {
				category = 'billing';
				maxScore = sBilling;
			} else if (sTech >= sBilling && sTech >= sShipping && sTech > 0) {
				category = 'tech';
				maxScore = sTech;
			} else if (sShipping >= sBilling && sShipping >= sTech && sShipping > 0) {
				category = 'shipping';
				maxScore = sShipping;
			}
			const confidence = Math.min(1, 0.4 + 0.2 * maxScore);
			return {
				predictedCategory: category,
				confidence,
				modelInfo: { provider: 'stub', model: 'heuristic', promptVersion: 'v1', latencyMs: Math.round(performance.now() - start) }
			};
		}
		// Real provider would go here
		throw new Error('Non-stub mode not implemented');
	}

	async draft(text, articles) {
		const start = performance.now();
		if (this.stubMode) {
			const titles = articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
			const reply = `Thanks for reaching out. Based on your message, here are some resources that may help:\n${titles}\nIf this resolves your issue, we will close the ticket. Otherwise, a human agent will assist you shortly.`;
			return {
				draftReply: reply,
				citations: articles.map((a) => String(a._id || a.id || a)),
				modelInfo: { provider: 'stub', model: 'templated', promptVersion: 'v1', latencyMs: Math.round(performance.now() - start) }
			};
		}
		throw new Error('Non-stub mode not implemented');
	}
}


