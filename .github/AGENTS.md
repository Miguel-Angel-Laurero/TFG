# LudoScript — Agent Instructions

> Gamified learning platform (TFG). Vue 3 SPA + Node.js REST API + Socket.IO real-time multiplayer.

## Quick Start

```bash
# From repo root — starts backend (port 3000) + frontend (port 5173) concurrently
npm run dev

# Backend only (from backend/)
npm run dev    # nodemon server.js

# Frontend only (from ludoScript/)
npm run dev    # vite
npm test       # vitest
```

## Environment Variables

| File              | Key vars                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `backend/.env`    | `PORT`, `JWT_SECRET`, `CLIENT_URL`, `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `GEMINI_API_KEY` |
| `ludoScript/.env` | `VITE_API_URL` (dev default: `http://localhost:3000/api`)                                        |

Dev uses MySQL locally. Production uses PostgreSQL on Render. `sequelize.sync({ alter: true })` handles schema automatically in dev.

## Architecture

See [`project-architecture.instructions.md`](.github/instructions/project-architecture.instructions.md) for full structure.

```
backend/               Node.js + Express + Sequelize
  server.js            Entry point — Express + Socket.IO + Sequelize.sync
  config/config.js     All env vars in one place
  src/controllers/     Business logic (try/catch/next pattern)
  src/models/index.js  All model imports + Sequelize associations
  src/routes/index.js  All route prefixes (/api/auth, /api/users, …)
  src/socket/          Socket.IO: gameHandler, duelHandler, groupGameHandler

ludoScript/src/
  api/axios.js         Axios instance (baseURL + JWT interceptor)
  api/*.service.js     One file per resource
  stores/*.store.js    Pinia setup stores
  views/*.vue          One view per route
  components/{domain}/ Grouped by feature domain
  composables/         20+ composables for quiz/game logic (use* prefix)
  router/router.js     Vue Router — trailing slash convention (/route-name/)
```

## Key Conventions

- **Backend**: [backend-conventions.instructions.md](.github/instructions/backend-conventions.instructions.md)
- **Frontend**: [frontend-conventions.instructions.md](.github/instructions/frontend-conventions.instructions.md)
- **Technical decisions already made**: [decisions-log.instructions.md](.github/instructions/decisions-log.instructions.md)

### Critical rules (summary)

- `req.user.id` always comes from the JWT middleware, **never from the body**
- Store actions return data or `null` on error — never throw. Component checks `if (!result)`.
- `storeToRefs()` for reactive state; actions destructured directly
- Vue routes end with trailing slash: `/profile-view/` ✓ `/profile-view` ✗
- Never expose `password` field in API responses

## Socket.IO Architecture

Three namespaces/event sets on the same server:

- `gameHandler` — solo quiz rooms (`create-room`, `join-room`, `game-start`, `submit-answer`)
- `duelHandler` — 1v1 duels
- `groupGameHandler` — class (grupo) multiplayer sessions

Frontend connects via `ludoScript/src/api/socket.service.js`. Token passed in `socket.handshake.auth.token`. Unauthenticated connections become guest spectators.

See [`/memories/repo/socket-io-architecture.md`](../memories/repo/socket-io-architecture.md) for details.

## Adaptive Quiz System (Composables)

The adaptive quiz system lives entirely in `ludoScript/src/composables/`. Key composables:

| Composable             | Responsibility                                           |
| ---------------------- | -------------------------------------------------------- |
| `useAdaptiveHistory`   | Tracks game count; unlocks adaptive mode after threshold |
| `useAdaptiveSelection` | Picks questions biased toward weak categories            |
| `useQuizController`    | Main quiz flow controller (state machine)                |
| `useQuizLoader`        | Fetches and prepares question pool                       |
| `useActivitySession`   | Generic lifecycle for quizzes and flashcards             |
| `useActivityReward`    | Computes coins/XP based on performance                   |
| `useCategoryStats`     | Reads/writes per-category accuracy stats                 |

When modifying quiz logic, these composables work together — check dependencies before editing one in isolation.

## Tests

Frontend tests (Vitest) live in `ludoScript/src/composables/__tests__/` and `ludoScript/src/components/{domain}/__tests__/`. Run with `npm test` from `ludoScript/`.

No backend tests currently. Use the `write-tests-backend` skill to add them.

## Available Automation

Use `/` in chat to access:

| Skill / Prompt             | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `/nueva-feature`           | Full-stack feature (backend + frontend)   |
| `/nuevo-endpoint`          | New REST endpoint with controller + route |
| `/debug-error`             | Diagnose backend or frontend error        |
| `/escribir-tests`          | Generate tests for a component/endpoint   |
| `/planificar-arquitectura` | Design solution before implementing       |

Agents: **Arquitecto** (plan/design), **Vue Refactoring Expert** (Vue code quality), **Arquitecto Refactor** (separation of concerns)
