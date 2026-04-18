# Vote-Off

A continuous Elo-ranked voting app. Upload images (or text) to create brackets, share a link, and let people vote on pairs. Rankings update in real time using the Elo algorithm.

## Project structure

```
vote-off-claude/
├── frontend/       # React + TypeScript + Vite
├── backend/        # Node + Express + TypeScript + Prisma
├── nginx/          # Reverse proxy config (production)
├── docker-compose.yml
└── PLANNING.md     # Architecture and design decisions
```

---

## Running in development

### Option A — Frontend only (no backend required)

Uses in-memory mock data. Voting updates Elo scores for the duration of the session.

```bash
cd frontend
VITE_MOCK=true npm run dev
```

Open `http://localhost:5173/b/anything` — the slug is ignored in mock mode.

---

### Option B — Full stack

**Prerequisites:** Docker Desktop running, ports 3000 and 5432 free.

**1. Start PostgreSQL**
```bash
docker compose up postgres -d
```

**2. Set up the backend**
```bash
cd backend
cp .env.example .env        # already copied, edit JWT_SECRET if desired
npx prisma migrate dev --name init
npm run db:seed             # creates test@example.com / password + two brackets
npm run dev                 # starts on http://localhost:3000
```

The seed script prints the bracket slugs when it runs.

**3. Start the frontend** (new terminal)
```bash
cd frontend
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:3000` automatically — no CORS configuration needed.

**Test account**
- Email: `test@example.com`
- Password: `password`

---

## Key URLs (dev)

| URL | Description |
|---|---|
| `http://localhost:5173/b/:slug` | Voting page |
| `http://localhost:5173/b/:slug/results` | Rankings |
| `http://localhost:3000/api/brackets/:slug` | Bracket API (direct) |

---

## Running tests

**Backend unit tests** (no database needed)
```bash
cd backend
npm test
```

**Backend integration tests** (requires PostgreSQL running)
```bash
cd backend
npm run test:integration
```

Integration tests use a separate `voteoff_test` database. The test setup runs migrations and wipes data between each test automatically.

**Frontend tests**
```bash
cd frontend
npm test
```

---

## Mock mode details

Setting `VITE_MOCK=true` replaces all API calls with an in-memory implementation defined in `frontend/src/api/mock.ts`. The mock:

- Serves a single pre-populated bracket ("Best Programming Languages", 8 entries)
- Picks matchups using the same least-played-first logic as the real backend
- Applies real Elo calculations on each vote, so rankings change as you vote
- Resets on page refresh

To add more mock brackets or entries, edit `frontend/src/api/mock.ts` directly.

---

## Production (Docker)

```bash
docker compose up --build
```

Serves the app on port 80. See `PLANNING.md` for the full architecture.
