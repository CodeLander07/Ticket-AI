import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export default function KB(){
	const [items, setItems] = useState([])
	const [form, setForm] = useState({ title: '', body: '', tags: '', status: 'published' })
	const [q, setQ] = useState('')

	async function load(){
		const res = await api(`/api/kb?query=${encodeURIComponent(q)}`)
		setItems(res)
	}
	useEffect(() => { load() }, [q])

	async function create(){
		await api('/api/kb', { method: 'POST', body: JSON.stringify({ ...form, tags: form.tags ? form.tags.split(',').map(s=>s.trim()) : [] }) })
		setForm({ title: '', body: '', tags: '', status: 'published' })
		load()
	}

	return (
		<div className="grid gap-6">
			<div className="flex items-center gap-2">
				<input className="input" placeholder="Search KB" value={q} onChange={e=>setQ(e.target.value)} />
			</div>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="card p-6">
					<h3 className="text-lg font-semibold mb-3">Create Article</h3>
					<div className="grid gap-3">
						<div>
							<label className="label">Title</label>
							<input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} />
						</div>
						<div>
							<label className="label">Body</label>
							<textarea className="input min-h-[140px]" placeholder="Body" value={form.body} onChange={e=>setForm({ ...form, body: e.target.value })}></textarea>
						</div>
						<div>
							<label className="label">Tags</label>
							<input className="input" placeholder="billing, refund" value={form.tags} onChange={e=>setForm({ ...form, tags: e.target.value })} />
						</div>
						<div>
							<label className="label">Status</label>
							<select className="input" value={form.status} onChange={e=>setForm({ ...form, status: e.target.value })}>
								<option value="published">published</option>
								<option value="draft">draft</option>
							</select>
						</div>
						<button className="btn btn-primary w-fit" onClick={create}>Save</button>
					</div>
				</div>
				<div className="card p-6">
					<h3 className="text-lg font-semibold mb-3">Articles</h3>
					<ul className="grid gap-2">
						{items.map(a => (
							<li key={a._id} className="border border-slate-200 rounded-lg p-3 bg-white">
								<div className="font-medium">{a.title}</div>
								<div className="text-xs text-slate-600">{a.tags?.join(', ')}</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}


