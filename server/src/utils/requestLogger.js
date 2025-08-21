export function requestLogger() {
	return (req, res, next) => {
		const start = Date.now();
		res.on('finish', () => {
			const latency = Date.now() - start;
			console.log(
				JSON.stringify({
					level: 'info',
					message: 'request',
					method: req.method,
					path: req.path,
					status: res.statusCode,
					latencyMs: latency
				})
			);
		});
		next();
	};
}


