import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'

export default function Tickets(){
	const [items, setItems] = useState([])
	const [form, setForm] = useState({ title: '', description: '' })
	const [filter, setFilter] = useState('')

	async function load(){
		const qs = new URLSearchParams()
		if(filter) qs.set('status', filter)
		const data = await api(`/api/tickets?${qs.toString()}`)
		setItems(data)
	}
	useEffect(() => { load() }, [filter])

	async function create(){
		await api('/api/tickets', { method: 'POST', body: JSON.stringify(form) })
		setForm({ title: '', description: '' })
		load()
	}

	return (
		<div className="grid gap-6">
			<div className="card p-6">
				<h2 className="text-xl font-semibold mb-4">Create Ticket</h2>
				<div className="grid gap-3">
					<div>
						<label className="label">Title</label>
						<input className="input" placeholder="What's the issue?" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} />
					</div>
					<div>
						<label className="label">Description</label>
						<textarea className="input min-h-[120px]" placeholder="Describe your issue" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })}></textarea>
					</div>
					<button className="btn btn-primary w-fit" onClick={create}>Create Ticket</button>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Your Tickets</h3>
				<select className="input w-48" value={filter} onChange={e=>setFilter(e.target.value)}>
					<option value="">All</option>
					<option value="open">open</option>
					<option value="waiting_human">waiting_human</option>
					<option value="resolved">resolved</option>
				</select>
			</div>

			<ul className="grid gap-2">
				{items.map(t => (
					<li key={t._id} className="card p-4 flex items-center justify-between">
						<a className="text-indigo-700 hover:underline font-medium" href={`/tickets/${t._id}`}>{t.title}</a>
						<span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{t.status}</span>
					</li>
				))}
			</ul>
		</div>
	)
}


