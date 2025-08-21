import { Outlet, Link, useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth.js'
import '../globals.css'
export default function App(){
	const navigate = useNavigate()
	const { token, role, logout } = useAuth()
	return (
		<div className="app-container">
			<header className="mb-6">
				<div className="flex items-center gap-4">
				<Link to="/" className="text-lg font-semibold text-slate-900">Ticket AI</Link>
					<nav className="flex items-center gap-3 text-slate-700">
						<Link className="hover:text-slate-900" to="/">Tickets</Link>
						{role === 'admin' && <Link className="hover:text-slate-900" to="/kb">KB</Link>}
						{role === 'admin' && <Link className="hover:text-slate-900" to="/settings">Settings</Link>}
					</nav>
					<div className="ml-auto">
						{token ? (
							<button className="btn btn-secondary" onClick={() => { logout(); navigate('/login') }}>Logout</button>
						) : (
							<div className="flex items-center gap-2">
								<Link className="btn btn-secondary" to="/login">Login</Link>
								<Link className="btn btn-primary" to="/register">Register</Link>
							</div>
						)}
					</div>
				</div>
			</header>
			<main className="grid gap-6">
				<Outlet />
			</main>
		</div>
	)
}


