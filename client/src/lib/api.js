import useAuth from '../store/useAuth.js'

const API_BASE = import.meta.env.VITE_API || 'http://localhost:8080'

export async function api(path, options = {}){
	const { token } = useAuth.getState()
	const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
	if(token){ headers['Authorization'] = `Bearer ${token}` }
	const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
	if(!res.ok){ throw new Error((await res.json().catch(() => ({}))).error || 'Request failed') }
	return res.json().catch(() => ({}))
}

export function connectSSE(onMessage){
	const es = new EventSource(`${API_BASE}/api/events`)
	es.onmessage = (e) => onMessage && onMessage({ event: 'message', data: e.data })
	es.addEventListener('audit', (e) => onMessage && onMessage({ event: 'audit', data: JSON.parse(e.data) }))
	return es
}


