import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';

export const router = express.Router();

const registerSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6)
});

router.post('/register', async (req, res) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const { name, email, password } = parsed.data;
	const existing = await User.findOne({ email });
	if (existing) return res.status(409).json({ error: 'Email already registered' });
	const password_hash = await bcrypt.hash(password, 10);
	const user = await User.create({ name, email, password_hash, role: 'user' });
	const token = jwt.sign({ sub: user._id, email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1h' });
	const refreshToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
	res.json({ token, refreshToken });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
router.post('/login', async (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const { email, password } = parsed.data;
	const user = await User.findOne({ email });
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });
	const ok = await bcrypt.compare(password, user.password_hash);
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
	const token = jwt.sign({ sub: user._id, email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1h' });
	const refreshToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
	res.json({ token, refreshToken });
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });
router.post('/refresh', async (req, res) => {
	const parsed = refreshSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	try {
		const payload = jwt.verify(parsed.data.refreshToken, process.env.JWT_SECRET || 'dev_secret');
		const user = await User.findById(payload.sub).lean();
		if (!user) return res.status(401).json({ error: 'Invalid token' });
		const token = jwt.sign({ sub: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1h' });
		res.json({ token });
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
});


