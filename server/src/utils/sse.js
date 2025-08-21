const clients = new Set();

export function sseHandler(req, res) {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders?.();

	const client = { res };
	clients.add(client);

	res.write(`event: ping\n`);
	res.write(`data: connected\n\n`);

	req.on('close', () => {
		clients.delete(client);
	});
}

export function broadcast(event, data) {
	const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
	for (const client of clients) {
		client.res.write(payload);
	}
}


