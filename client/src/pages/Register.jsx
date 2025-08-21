import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../store/useAuth.js'
import { api } from '../lib/api.js'

export default function Register(){
	const nav = useNavigate()
	const { login } = useAuth()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e){
		e.preventDefault()
		setLoading(true)
		setError(null)
		try{
			const { token } = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
			login(token)
			nav('/')
		}catch(err){ setError(err.message) } finally { setLoading(false) }
	}

	return (
		<div className="card p-6 max-w-md mx-auto w-full">
			<h2 className="text-xl font-semibold mb-4">Create account</h2>
			<form onSubmit={onSubmit} className="grid gap-3">
				<div>
					<label className="label">Name</label>
					<input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
				</div>
				<div>
					<label className="label">Email</label>
					<input className="input" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
				</div>
				<div>
					<label className="label">Password</label>
					<input className="input" placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
				</div>
				<button className="btn btn-primary" disabled={loading}>{loading ? 'Loading...' : 'Create account'}</button>
				{error && <div className="text-sm text-red-600">{error}</div>}
			</form>
			<p className="text-sm text-slate-600 mt-4">Already have an account? <Link className="text-indigo-600 hover:underline" to="/login">Login</Link></p>
		</div>
	)
}


