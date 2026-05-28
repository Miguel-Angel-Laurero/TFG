# LudoScript — Quick Context

> Plataforma web educativa gamificada para aprendizaje de JavaScript (TFG DAW).  
> Vue 3 SPA (Vite) + Node.js REST API (Express) + Socket.IO + PostgreSQL (Supabase).  
> **Autores:** Miguel Ángel Laurero y Álvaro Pastor.

## Stack (3 líneas)

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 `<script setup>`, Pinia Setup Stores, Tailwind CSS, PrimeVue 4 |
| Backend | Express 4, Sequelize 6 (PostgreSQL/MySQL), JWT, Socket.IO 4 |
| Test | Vitest (frontend), Jest + Supertest (backend) |

## Arranque

```bash
npm run dev            # backend (3000) + frontend (5173) concurrently
npm test --prefix ludoScript -- --run   # tests frontend
```

## Reglas críticas (lo que más bugs causa)

1. `req.user.id` viene del JWT middleware, **nunca del body** — previene spoofing
2. Stores Pinia: acciones devuelven `data` o `null` en error — **nunca lanzan**. Componente chequea `if (!result)`
3. `storeToRefs()` para estado reactivo; acciones se desestructuran directamente del store
4. Rutas Vue terminan en `/` (trailing slash): `/profile-view/` ✓  `/profile-view` ✗
5. Nunca exponer `password` en respuestas API (usar `attributes: { exclude: ["password"] }`)

## Dónde está cada cosa

```
backend/
├── server.js              Punto de entrada — Express + Socket.IO + sync
├── config/config.js       Variables de entorno centralizadas
├── config/database.js     Conexión Sequelize
└── src/
    ├── controllers/       15 controladores — lógica de negocio (try/catch/next)
    ├── models/            13 modelos + index.js con asociaciones
    ├── routes/            15 rutas + index.js (todas bajo /api/)
    ├── middlewares/       3: auth (JWT), validate (express-validator), errorHandler
    ├── socket/            5 handlers: game, duel, groupGame, roomManager, index
    └── utils/             4: jwt, bcrypt, validators, supabaseStorage

ludoScript/src/
├── api/axios.js           Instancia Axios (baseURL + interceptor JWT + redirect 401)
├── api/*.service.js       11 servicios — uno por recurso
├── stores/*.store.js      13 stores Pinia (Setup Store, loading + error + clearError)
├── views/*.vue            15 vistas — una por ruta
├── components/{domain}/   13 dominios de componentes
├── composables/           21 composables (useXxx) — 7 del sistema de quiz adaptativo
├── router/router.js       14 rutas con lazy loading, guards auth + admin
└── utils/                 5 utilidades
```

## ⚠️ Sistema de quiz adaptativo — zona de alto riesgo

Los 7 composables del quiz son **interdependientes**. Antes de tocar cualquiera, leer `useQuizController.js` (máquina de estados principal) y entender sus dependencias:

| Composable | Depende de |
|---|---|
| `useQuizController` | useQuizLoader, useAdaptiveSelection, useActivitySession |
| `useQuizLoader` | useCategoryStats, API questions |
| `useAdaptiveSelection` | useAdaptiveHistory, useCategoryStats |
| `useActivitySession` | session API |
| `useActivityReward` | useCategoryStats, rewards API |
| `useQuizReward` | useActivityReward, authStore |
| `useCategoryStats` | categoryStats API |

## Lista de endpoints API (`/api/...`)

| Prefijo | Recurso |
|---------|---------|
| `/auth` | Login, registro, /me |
| `/users` | CRUD usuarios + items |
| `/games` | Partidas y preguntas adaptativas |
| `/rewards` | Recompensa diaria |
| `/shop` | Tienda de items |
| `/categories` | Categorías temáticas |
| `/activities` | Flashcards y recursos |
| `/pdfs` | PDFs subidos |
| `/category-stats` | Estadísticas por categoría |
| `/groups` | Sistema de clases/grupos |
| `/upload` | Subida de archivos |

## Socket.IO — arquitectura

3 namespaces en el mismo servidor (ver `backend/src/socket/index.js`):
- `gameHandler` — salas de quiz (create-room, join-room, game-start, submit-answer)
- `duelHandler` — duelos 1v1
- `groupGameHandler` — sesiones multiplayer de clase

El frontend conecta vía `ludoScript/src/api/socket.service.js`. Token en `socket.handshake.auth.token`. Conexiones sin autenticar → espectadores invitados.

**Regla de oro:** todo `socket.on("evento")` requiere su `socket.off("evento")` en `onUnmounted`.

## Base de datos — tablas principales

| Modelo | Tabla | Nota |
|--------|-------|------|
| User | users | id, username, email, password(hash), role |
| UserData | user_data | FK user_id UNIQUE, coins, streak, accuracy |
| Game | games | FK userId, score, category, mode |
| Item | items | FK type_id → item_categories, 8 slots fijos |
| ItemsUser | items_users | FK user_id + item_id, equipped flag |
| Group | groups | FK ownerId, inviteCode(8 UNIQUE) |
| GroupMember | group_members | FK groupId + userId UNIQUE (1 grupo/usuario) |
| CategoryStat | category_stats | FK userId + category UNIQUE |
| UserPdf | user_pdfs | FK userId, quizQuestions JSON, flashCards JSON |
| UserSession | user_sessions | FK userId, stats JSON, summary JSON |

`sequelize.sync({ alter: true })` en dev gestiona el esquema automáticamente — **no hacen falta migraciones manuales**.

## Skills disponibles

| Skill | Cuándo usarla |
|-------|--------------|
| `backend-endpoint` | Nuevo endpoint REST (modelo → controller → ruta → service) |
| `frontend-store` | Nuevo store Pinia con el patrón del proyecto |
| `socket-event` | Añadir evento Socket.IO (handler backend + listener frontend) |
| `feature-vertical` | Feature full-stack completa (orquesta las skills anteriores) |
| `debug` | Diagnosticar errores en backend o frontend sistemáticamente |
| `tests` | Escribir tests para componentes, stores, composables o endpoints |
| `ui-component` | Implementar componente Vue con heurísticas de usabilidad |
| `design-review` | Interrogar un plan de diseño antes de implementar |

## Errores conocidos (no repetir)

- **"Cannot read clipboard (this model does not support image input)"** — El
  modelo activo no soporta imágenes. Si el usuario pega una imagen desde el
  portapapeles, informar y pedir que describa el contenido con texto. No
  reportar como error interno del sistema.
