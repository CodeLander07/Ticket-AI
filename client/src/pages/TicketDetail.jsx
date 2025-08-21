import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, connectSSE } from '../lib/api.js'
import useAuth from '../store/useAuth.js'

export default function TicketDetail(){
	const { id } = useParams()
	const { role } = useAuth()
	const [data, setData] = useState(null)
	const [audit, setAudit] = useState([])
	const [reply, setReply] = useState('')

	async function load(){
		const res = await api(`/api/tickets/${id}`)
		setData(res)
		const a = await api(`/api/tickets/${id}/audit`)
		setAudit(a)
	}

	useEffect(() => {
		load()
		const es = connectSSE((evt) => {
			if(evt.event === 'audit' && evt.data.ticketId === id){
				setAudit(a => [...a, { ...evt.data, _id: Math.random().toString(36).slice(2) }])
			}
		})
		return () => es.close()
	}, [id])

	async function sendReply(){
		await api(`/api/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ body: reply }) })
		setReply('')
		load()
	}

	async function triage(){
		await api(`/api/tickets/${id}/triage`, { method: 'POST' })
		load()
	}

	if(!data) return <div>Loading...</div>
	const { ticket, suggestion } = data

	return (
		<div className="grid gap-6">
			<div className="card p-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-xl font-semibold">{ticket.title}</h3>
						<p className="text-sm text-slate-600">Status: <span className="font-medium">{ticket.status}</span> · Category: <span className="font-medium">{ticket.category || '—'}</span></p>
					</div>
					<div className="flex items-center gap-2">
						{(role === 'admin' || role === 'agent') && <button className="btn btn-primary" onClick={triage}>Run Triage</button>}
					</div>
				</div>
				<div className="mt-4">
					<h4 className="text-sm font-semibold text-slate-700 mb-2">Conversation</h4>
					<ul className="grid gap-2">
						{ticket.messages?.map((m, i) => (
							<li key={i} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
								<span className="font-semibold mr-2 capitalize">{m.actor}</span>
								<span>{m.body}</span>
								<span className="ml-2 text-xs text-slate-500">{new Date(m.timestamp).toLocaleString()}</span>
							</li>
						))}
					</ul>
					<div className="flex items-center gap-2 mt-3">
						<input className="input flex-1" value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write a reply" />
						<button className="btn btn-secondary" onClick={sendReply}>Send</button>
					</div>
				</div>
			</div>

			<div className="card p-6">
				<h4 className="text-sm font-semibold text-slate-700 mb-2">Agent Suggestion</h4>
				{suggestion ? (
					<div>
						<div className="text-sm">Predicted: <span className="font-medium">{suggestion.predictedCategory}</span> (<span className="font-medium">{Math.round(suggestion.confidence*100)}%</span>)</div>
						<pre className="whitespace-pre-wrap text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2">{suggestion.draftReply}</pre>
					</div>
				) : <div className="text-sm text-slate-600">No suggestion yet.</div>}
			</div>

			<div className="card p-6">
				<h4 className="text-sm font-semibold text-slate-700 mb-2">Audit Timeline</h4>
				<ol className="grid gap-1 text-sm">
					{audit.map(a => (
						<li key={a._id} className="flex items-center gap-2"><span className="text-slate-500">{new Date(a.timestamp).toLocaleString()}</span><span className="font-medium">—</span><span>{a.action}</span></li>
					))}
				</ol>
			</div>
		</div>
	)
}


