# LudoScript — Instrucciones para el agente

> Plataforma educativa gamificada para aprender JavaScript (TFG DAW).  
> Vue 3 SPA + Express REST API + Socket.IO + PostgreSQL.  
> **Autores:** Miguel Ángel Laurero y Álvaro Pastor.

## Stack

| Capa | Tecnología | Módulos |
|------|-----------|---------|
| Backend | Express 4, Sequelize 6, JWT, Socket.IO 4 | **CommonJS** (`require`/`module.exports`) |
| Frontend | Vue 3 `<script setup>`, Pinia, Tailwind CSS, PrimeVue 4, Axios | **ESM** (`import`/`export`) |
| Tests | Vitest + jsdom (frontend), ningún test backend | — |

El frontend en dev usa el proxy de Vite: `/api` → `http://localhost:3000`. No hay CORS en desarrollo.

## Comandos exactos

```bash
npm run dev                           # backend (:3000) + frontend (:5173) concurrente
npm run lint                          # ESLint backend/ + ludoScript/src/
npm run format                        # Prettier en backend/ + ludoScript/src/
npm test --prefix ludoScript -- --run # Tests frontend Vitest (una ejecución)
npm run dev --prefix backend          # Solo backend (nodemon)
npm run dev --prefix ludoScript       # Solo frontend (vite)
```

## Reglas que más bugs causan

1. `req.user.id` viene del **JWT middleware**, nunca del body
2. Stores Pinia: acciones devuelven `data` o `null` en error — nunca lanzan. El componente chequea `if (!result)`
3. `storeToRefs()` para estado reactivo; las acciones se desestructuran directamente del store
4. Rutas Vue terminan en `/`: `/profile-view/` ✓, `/profile-view` ✗
5. Nunca exponer `password` en respuestas API — usar `attributes: { exclude: ["password"] }`
6. Backend es CommonJS, frontend es ESM — no mezclar sintaxis de imports

## Arquitectura

Ver archivos completos en `.github/instructions/`:
- `project-architecture.instructions.md` — estructura general
- `backend-conventions.instructions.md` — patrones de controller, rutas, modelos
- `frontend-conventions.instructions.md` — stores, servicios, componentes, vistas
- `decisions-log.instructions.md` — decisiones técnicas ya tomadas (no cuestionar)

Resumen de directorios:
```
backend/                  Express + Sequelize + Socket.IO
  server.js               Entry point (Express + sync + Socket.IO)
  config/database.js      Sequelize — dialecto "postgres" siempre
  src/controllers/        Lógica: try/catch/next(err)
  src/models/index.js     Todos los modelos + asociaciones
  src/routes/index.js     Todas bajo /api/
  src/socket/             gameHandler, duelHandler, groupGameHandler

ludoScript/src/           Vue 3 + Pinia + Tailwind + PrimeVue
  api/axios.js            Axios (baseURL + interceptor JWT + redirect 401)
  api/*.service.js        Uno por recurso
  stores/*.store.js       Pinia Setup Stores
  composables/            21 composables (useXxx)
  router/router.js        Lazy loading, guards auth + admin
```

## Socket.IO — arquitectura

3 namespaces en el mismo servidor:
- `gameHandler` — salas de quiz (create-room, join-room, game-start, submit-answer)
- `duelHandler` — duelos 1v1
- `groupGameHandler` — multiplayer de clase

Frontend conecta vía `ludoScript/src/api/socket.service.js`. Token en `socket.handshake.auth.token`. Sin token → espectador invitado.

**Regla:** todo `socket.on("evento")` requiere su `socket.off("evento")` en `onUnmounted`.

## Base de datos

- `sequelize.sync({ alter: true })` en dev — **no hace falta migraciones**
- Dialecto PostgreSQL siempre (SSL: `rejectUnauthorized: false` en dev)
- Producción: Render PostgreSQL. Frontend: Vercel (con `vercel.json` rewrite)
- 13 modelos, 14 tablas. Tablas clave: `users`, `user_data`, `games`, `items`, `items_users`, `groups`, `group_members`, `category_stats`, `user_pdfs`, `user_sessions`

## ⚠️ Sistema de quiz adaptativo — zona de alto riesgo

Los 7 composables son interdependientes. Leer `useQuizController.js` (máquina de estados) antes de tocar cualquiera:

| Composable | Dependencias |
|---|---|
| `useQuizController` | useQuizLoader, useAdaptiveSelection, useActivitySession |
| `useQuizLoader` | useCategoryStats, API questions |
| `useAdaptiveSelection` | useAdaptiveHistory, useCategoryStats |
| `useActivitySession` | session API |
| `useActivityReward` | useCategoryStats, rewards API |
| `useQuizReward` | useActivityReward, authStore |
| `useCategoryStats` | categoryStats API |

## Skills disponibles (`.opencode/skills/`)

| Skill | Para qué |
|-------|---------|
| `backend-endpoint` | Endpoint REST completo (modelo → controller → ruta → service) |
| `frontend-store` | Store Pinia nuevo |
| `socket-event` | Evento Socket.IO (handler backend + listener frontend) |
| `feature-vertical` | Feature full-stack (orquesta skills anteriores) |
| `debug` | Diagnosticar errores backend o frontend |
| `tests` | Tests para componentes, stores, composables, endpoints |
| `ui-component` | Componente Vue con heurísticas de usabilidad |
| `design-review` | Interrogar plan de diseño antes de implementar |

## Tests

```bash
npm test --prefix ludoScript -- --run   # frontend (Vitest + jsdom)
```
- Tests en `ludoScript/src/composables/__tests__/` y `components/*/__tests__/`
- Vitest config: `globals: false` (importar `describe`, `it`, `expect`), `environment: "jsdom"`
- Backend: sin tests aún
