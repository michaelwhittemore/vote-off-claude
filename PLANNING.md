# Vote-Off: Planning Document

## Concept

A continuous image ranking app. Users upload sets of images to create brackets. Visitors vote between random pairs of images. Votes update Elo scores, producing an aggregate ranking over time.

---

## Core Decisions

| Decision | Choice | Reason |
|---|---|---|
| Ranking system | Continuous Elo | No round management, flexible entry count |
| Voting auth | Anonymous (session-based) | Low friction; IP tracking can be added later |
| Bracket access | Direct link only | No public discovery/browsing |
| Create/manage auth | JWT (email + password) | Required to create brackets, not to vote |
| Max entries per bracket | 64 | Practical upper limit for Elo coverage |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite |
| Server state | TanStack Query |
| Charts | Recharts |
| Backend | Node + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Image storage | Local filesystem (Docker volume) |
| Auth | JWT (httpOnly cookie), bcrypt |
| Infra | docker-compose + nginx |

---

## Repository Structure

```
vote-off-claude/
├── frontend/               # React + Vite app
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── api/
├── backend/                # Express + Prisma app
│   └── src/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       └── prisma/
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── PLANNING.md
```

---

## Data Model

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password_hash String
  created_at    DateTime  @default(now())
  brackets      Bracket[]
}

model Bracket {
  id         String   @id @default(cuid())
  slug       String   @unique   // nanoid, used in URLs
  name       String
  owner_id   String
  owner      User     @relation(fields: [owner_id], references: [id])
  status     String   @default("active")  // active | archived
  created_at DateTime @default(now())
  entries    Entry[]
  votes      Vote[]
}

model Entry {
  id         String   @id @default(cuid())
  bracket_id String
  bracket    Bracket  @relation(fields: [bracket_id], references: [id])
  image_path String?  // optional — entries may be text-only
  label      String?  // required if no image
  elo_score  Float    @default(1000)
  win_count  Int      @default(0)
  loss_count Int      @default(0)
  created_at DateTime @default(now())
  votes_won  Vote[]   @relation("winner")
  votes_lost Vote[]   @relation("loser")
}

model Vote {
  id         String   @id @default(cuid())
  bracket_id String
  bracket    Bracket  @relation(fields: [bracket_id], references: [id])
  winner_id  String
  winner     Entry    @relation("winner", fields: [winner_id], references: [id])
  loser_id   String
  loser      Entry    @relation("loser", fields: [loser_id], references: [id])
  created_at DateTime @default(now())
  // ip_address String?  // reserved for future anti-spam
}
```

---

## Elo Algorithm

```
K = 32
expected_A = 1 / (1 + 10^((score_B - score_A) / 400))
new_score_A = score_A + K * (1 - expected_A)   // winner
new_score_B = score_B + K * (0 - (1 - expected_A))  // loser
```

Standard K=32 to start. Can tune once we have real voting data.

---

## Matchup Selection

Priority order:
1. Entries with fewest total matches — ensures all entries get evaluated before any are over-represented
2. Fallback to random pairing once match counts are roughly even

Never pair an entry against itself. Avoid showing the same pair twice in a row (client-side state).

---

## API Routes

```
Auth
  POST  /api/auth/register
  POST  /api/auth/login
  POST  /api/auth/logout

Brackets
  POST  /api/brackets              (auth) — create bracket
  GET   /api/brackets              (auth) — list own brackets
  GET   /api/brackets/:slug        — public bracket info + entries
  PATCH /api/brackets/:slug        (auth) — update name/status
  DELETE /api/brackets/:slug       (auth) — delete bracket

Entries
  POST   /api/brackets/:slug/entries     (auth) — upload image
  DELETE /api/brackets/:slug/entries/:id (auth) — remove entry

Voting
  GET  /api/brackets/:slug/matchup  — get random pair
  POST /api/brackets/:slug/vote     — { winner_id, loser_id }

Results
  GET  /api/brackets/:slug/results  — entries sorted by elo, with vote counts
```

---

## Frontend Pages

| Route | Auth Required | Purpose |
|---|---|---|
| `/` | no | Landing page |
| `/login` | no | Login form |
| `/register` | no | Registration form |
| `/dashboard` | yes | List user's brackets |
| `/brackets/new` | yes | Create bracket + upload images |
| `/b/:slug` | no | Voting page (image pair) |
| `/b/:slug/results` | no | Rankings + charts |
| `/b/:slug/manage` | yes | Add/remove entries, archive |

---

## Infrastructure

```
Browser
  │
  ▼
nginx :80
  ├── /api/*      → Express :3000
  ├── /uploads/*  → /uploads volume (static, served by nginx)
  └── /*          → React build (static HTML/JS/CSS)

Docker Compose services:
  - postgres   (postgres:16, persistent volume)
  - backend    (Node/Express, mounts /uploads)
  - frontend   (nginx, serves built React app)
```

Note: During development, run frontend (`npm run dev`) and backend (`npm run dev`) directly — Docker is for production.

---

## Out of Scope (v1)

- Public bracket discovery / homepage feed
- Vote integrity beyond session (IP tracking is stubbed in schema)
- Image moderation
- Bracket sharing permissions (public/private toggle)
- Mobile-specific optimizations
- Email verification
