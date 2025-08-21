## Support Desk (MERN)

End-to-end support ticket app with AI triage, SSE updates, SLA checks, and MERN stack.

### Folder structure
```
.
├─ client/                 # React + Vite frontend
│  ├─ src/
│  │  ├─ lib/             # API helpers, SSE
│  │  ├─ pages/           # App, Login, Register, Tickets, TicketDetail, KB, Settings
│  │  └─ store/           # Zustand auth store
│  ├─ index.html
│  ├─ vite.config.js
│  └─ package.json
├─ server/                 # Express + Mongoose API
│  ├─ src/
│  │  ├─ jobs/            # SLA scheduler
│  │  ├─ middleware/      # auth
│  │  ├─ models/          # User, Article, Ticket, AgentSuggestion, AuditLog, Config
│  │  ├─ routes/          # auth, kb, tickets, agent, config
│  │  ├─ services/        # agent workflow, search
│  │  └─ utils/           # sse, llmProvider (stub), requestLogger
│  ├─ seed.js
│  └─ package.json
├─ docker-compose.yml
└─ README.md
```

### Environment setup

Create a `.env` file in `server/` with:
```
MONGO_URI=mongodb://localhost:27017/weva
JWT_SECRET=<generate-a-strong-secret>
CORS_ORIGINS=http://localhost:5173
STUB_MODE=true
```

Optional `.env` in `client/` (or set via shell) for API base URL:
```
VITE_API=http://localhost:8080
```

Generate `JWT_SECRET` (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### One-command run
```bash
docker compose up -d --build
docker compose exec api node seed.js
```
App: `http://localhost:5173` • API: `http://localhost:8080`

### Seed data
```bash
cd server && npm install && npm run seed
```

Default users:
- admin@example.com / password123 (admin)
- agent@example.com / password123 (agent)
- user@example.com / password123 (user)

### Notes
- STUB_MODE=true enables deterministic heuristic AI (no API keys needed).
- SSE stream: `GET /api/events` (emits `audit` events with `ticketId`, `action`).
- Health: `/healthz`, readiness: `/readyz`.


