# LudoScript — Quick Context

> Plataforma web educativa gamificada para aprendizaje de JavaScript (TFG DAW).  
> Vue 3 SPA (Vite) + Node.js REST API (Express) + Socket.IO + PostgreSQL (Supabase).

## Stack y arranque

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 `<script setup>`, Pinia Setup Stores, Tailwind CSS, PrimeVue 4 |
| Backend | Express 4, Sequelize 6 (PostgreSQL/MySQL), JWT, Socket.IO 4 |
| Test | Vitest (frontend), Jest + Supertest (backend) |

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
6. Todo `socket.on("evento")` requiere su `socket.off("evento")` en `onUnmounted`

## Documentación detallada (cargar bajo demanda)

| Archivo | Cuándo cargarlo |
|---------|----------------|
| `.opencode/rules/project-map.md` | Necesitas orientación global: estructura, endpoints, tablas DB |
| `.opencode/rules/backend-conventions.md` | Vas a tocar backend (controllers, modelos, rutas) |
| `.opencode/rules/frontend-conventions.md` | Vas a tocar frontend (stores, composables, componentes, vistas) |
| `.opencode/rules/sockets-architecture.md` | Vas a tocar Socket.IO (handlers backend o listeners frontend) |
| `.opencode/rules/quiz-system.md` | Vas a tocar los composables del quiz adaptativo |
| `.opencode/rules/decisions-log.md` | Dudas sobre por qué se tomó una decisión técnica |

## ⚠️ Quiz adaptativo — zona de alto riesgo

Los 7 composables del quiz son interdependientes. **Antes de tocar cualquiera, carga `.opencode/rules/quiz-system.md`** y lee `useQuizController.js` (máquina de estados principal).

## Errores conocidos

- **"Cannot read clipboard (this model does not support image input)"** — El modelo no soporta imágenes. Si el usuario pega una imagen, pedir que describa el contenido con texto.
