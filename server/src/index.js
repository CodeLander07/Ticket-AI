import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { router as authRouter } from './routes/auth.js';
import { router as kbRouter } from './routes/kb.js';
import { router as ticketsRouter } from './routes/tickets.js';
import { router as agentRouter } from './routes/agent.js';
import { router as configRouter } from './routes/config.js';

import { requestLogger } from './utils/requestLogger.js';
import { sseHandler } from './utils/sse.js';
import { startSlaScheduler } from './jobs/sla.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(requestLogger());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/readyz', (req, res) => res.json({ ready: mongoose.connection.readyState === 1 }));

app.get('/api/events', sseHandler);

app.use('/api/auth', authRouter);
app.use('/api/kb', kbRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/agent', agentRouter);
app.use('/api/config', configRouter);

app.use((err, req, res, next) => {
	console.error(JSON.stringify({ level: 'error', message: err.message }));
	res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/weva';
const PORT = process.env.PORT || 8080;

mongoose
	.connect(MONGO_URI)
	.then(() => {
		startSlaScheduler();
		app.listen(PORT, () => {
			console.log(JSON.stringify({ level: 'info', message: `API listening on ${PORT}` }));
		});
	})
	.catch((e) => {
		console.error('Mongo connection error', e);
		process.exit(1);
	});


