import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export default function Settings(){
	const [cfg, setCfg] = useState(null)
	async function load(){ setCfg(await api('/api/config')) }
	useEffect(() => { load() }, [])

	async function save(){
		await api('/api/config', { method: 'PUT', body: JSON.stringify(cfg) })
		load()
	}

	if(!cfg) return <div>Loading...</div>
	return (
		<div className="card p-6 max-w-xl">
			<h2 className="text-xl font-semibold mb-4">Settings</h2>
			<div className="grid gap-4">
				<label className="inline-flex items-center gap-2">
					<input type="checkbox" className="h-4 w-4" checked={cfg.autoCloseEnabled} onChange={e=>setCfg({ ...cfg, autoCloseEnabled: e.target.checked })} />
					<span className="text-sm">Auto-close enabled</span>
				</label>
				<div>
					<label className="label">Confidence threshold</label>
					<input className="input w-40" type="number" min="0" max="1" step="0.05" value={cfg.confidenceThreshold} onChange={e=>setCfg({ ...cfg, confidenceThreshold: Number(e.target.value) })} />
				</div>
				<div>
					<label className="label">SLA hours</label>
					<input className="input w-40" type="number" min="1" max="168" value={cfg.slaHours} onChange={e=>setCfg({ ...cfg, slaHours: Number(e.target.value) })} />
				</div>
				<button className="btn btn-primary w-fit" onClick={save}>Save</button>
			</div>
		</div>
	)
}


