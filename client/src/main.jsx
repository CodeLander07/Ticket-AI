import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './pages/App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import KB from './pages/KB.jsx'
import Tickets from './pages/Tickets.jsx'
import TicketDetail from './pages/TicketDetail.jsx'
import Settings from './pages/Settings.jsx'
import './globals.css'

const router = createBrowserRouter([
	{ path: '/', element: <App />,
		children: [
			{ index: true, element: <Tickets /> },
			{ path: 'login', element: <Login /> },
			{ path: 'register', element: <Register /> },
			{ path: 'kb', element: <KB /> },
			{ path: 'tickets/:id', element: <TicketDetail /> },
			{ path: 'settings', element: <Settings /> }
		]
	}
])

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
)


