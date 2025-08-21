import { create } from 'zustand'

function decode(token){
	try{ return JSON.parse(atob(token.split('.')[1])) }catch{ return null }
}

const saved = localStorage.getItem('token')
const initial = saved ? decode(saved) : null

const useAuth = create((set, get) => ({
	token: saved || null,
	role: initial?.role || null,
	user: initial ? { id: initial.sub, name: initial.name, email: initial.email } : null,
	login: (token) => {
		localStorage.setItem('token', token)
		const payload = decode(token)
		set({ token, role: payload?.role || null, user: payload ? { id: payload.sub, name: payload.name, email: payload.email } : null })
	},
	logout: () => { localStorage.removeItem('token'); set({ token: null, role: null, user: null }) }
}))

export default useAuth


