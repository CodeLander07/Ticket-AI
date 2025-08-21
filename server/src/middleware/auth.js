import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		req.user = payload;
		next();
	} catch (e) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

export function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
		next();
	};
}


