import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import { Article } from './src/models/Article.js';
import { Ticket } from './src/models/Ticket.js';
import { Config } from './src/models/Config.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/weva';

async function run() {
	await mongoose.connect(MONGO_URI);
	await Promise.all([User.deleteMany({}), Article.deleteMany({}), Ticket.deleteMany({}), Config.deleteMany({})]);

	const password = await bcrypt.hash('password123', 10);
	const [admin, agent, user] = await User.create([
		{ name: 'Admin', email: 'admin@example.com', password_hash: password, role: 'admin' },
		{ name: 'Agent', email: 'agent@example.com', password_hash: password, role: 'agent' },
		{ name: 'User', email: 'user@example.com', password_hash: password, role: 'user' }
	]);

	await Config.create({ autoCloseEnabled: true, confidenceThreshold: 0.7, slaHours: 24 });

	const articles = await Article.create([
		{ title: 'How to request a refund', body: 'To request a refund, go to Billing > Refunds and submit the form.', tags: ['billing', 'refund'], status: 'published' },
		{ title: 'Fixing common API errors', body: 'If you see a 500 error, check your API keys and retry.', tags: ['tech', 'api', 'error'], status: 'published' },
		{ title: 'Shipment tracking guide', body: 'Use the tracking number to follow your delivery on the courier site.', tags: ['shipping', 'delivery'], status: 'published' }
	]);

	await Ticket.create([
		{ title: 'Refund for wrong charge', description: 'I saw an unexpected charge and need a refund for the invoice.', createdBy: user._id },
		{ title: 'API error on login', description: 'Getting a 500 error and stack trace when hitting the auth endpoint.', createdBy: user._id },
		{ title: 'Where is my delivery?', description: 'Shipment tracking shows pending for 3 days, delivery delayed.', createdBy: user._id }
	]);

	console.log('Seeded database.');
	await mongoose.disconnect();
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});


