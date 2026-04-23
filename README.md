Trying to get better about letting claude build things agentically, I'll be writing less code than my usual preference in this project

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

### Option B — Full stack with hot reloading (recommended)

Runs everything in Docker with a single command. Source files are mounted as volumes so changes are picked up automatically.

**Prerequisites:** Docker Desktop running, ports 3000, 5173, and 5432 free.

```bash
docker compose -f docker-compose.dev.yml up
```

On first run this installs dependencies, syncs the Prisma schema, seeds the database, and starts both dev servers. Open `http://localhost:5173`.

Prisma Studio (database browser) is also available at `http://localhost:5555`.

The seed runs automatically on every startup — it is safe to ignore if it fails on subsequent runs (data already exists). The app auto-logs in with the seeded dev account (`test@example.com` / `password`) so no manual login is required.

---

### Option C — Full stack (manual, no Docker for app servers)

**Prerequisites:** Docker Desktop running, ports 3000 and 5432 free.

**1. Start PostgreSQL**
```bash
docker compose up postgres -d
```
> `postgres` starts only the database service (not the backend/frontend containers). `-d` runs it in the background so your terminal stays free.

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
| `http://localhost:5173/dashboard` | Bracket list (default landing page) |
| `http://localhost:5173/brackets/new` | Create a new bracket |
| `http://localhost:5173/b/:slug` | Voting page |
| `http://localhost:5173/b/:slug/results` | Rankings |
| `http://localhost:5173/b/:slug/manage` | Add/remove entries, edit bracket |
| `http://localhost:3000/api/brackets/:slug` | Bracket API (direct) |
| `http://localhost:5555` | Prisma Studio (database browser, Docker dev only) |

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

- Supports all CRUD operations: create/list/update/delete brackets, add/remove entries
- Serves a pre-populated bracket ("Best Programming Languages", 8 entries) on first load
- Picks matchups using the same least-played-first logic as the real backend
- Applies real Elo calculations on each vote, so rankings change as you vote
- Auth is bypassed entirely — no login required
- Resets on page refresh

To add more mock brackets or entries, edit `frontend/src/api/mock.ts` directly.

---

## Known temporary shortcuts

- **Auto-login**: In full-stack mode, `ProtectedRoute` automatically logs in as `test@example.com` / `password` if no session exists. This is a dev shortcut — a real login page comes later.

---

## Prisma 7 notes

This project uses Prisma 7, which changed how database connections work:

- The `datasource` block in `schema.prisma` has **no `url` field** — this is intentional
- Connection URL for CLI tools (migrate, db push) is set in `prisma.config.ts`
- Runtime `PrismaClient` requires a pg adapter: see `backend/src/lib/prisma.ts`
- Any file that instantiates `PrismaClient` directly (e.g. `prisma/seed.ts`) must also use the adapter

---

## Production (Docker)

```bash
docker compose up --build
```

Serves the app on port 80. See `PLANNING.md` for the full architecture.
