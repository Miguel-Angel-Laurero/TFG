# LudoScript — Agent Instructions

> Plataforma web educativa gamificada (TFG). Vue 3 SPA + Express REST API + Socket.IO + PostgreSQL.
> **Las reglas detalladas, skills y convenciones están en `.opencode/`** — este archivo es solo el contexto mínimo.

## Arranque

```bash
npm run dev            # backend (:3000) + frontend (:5173) concurrently
npm test --prefix ludoScript -- --run   # tests frontend (Vitest)
```

## Reglas críticas

1. `req.user.id` del JWT middleware — **nunca del body**
2. Stores: acciones devuelven `data` o `null` — nunca lanzan. Componente: `if (!result)`
3. `storeToRefs()` para estado reactivo; acciones se desestructuran directamente
4. Rutas Vue con trailing slash: `/profile-view/` ✓  `/profile-view` ✗
5. Nunca exponer `password` en respuestas API
6. Todo `socket.on()` requiere `socket.off()` en `onUnmounted`

## Documentación detallada

Las reglas completas están en `.opencode/rules/`. Carga el archivo relevante según lo que vayas a tocar:

| Archivo | Cuándo cargarlo |
|---------|----------------|
| `.opencode/rules/project-map.md` | Estructura, endpoints, tablas DB |
| `.opencode/rules/backend-conventions.md` | Backend (controllers, modelos, rutas) |
| `.opencode/rules/frontend-conventions.md` | Frontend (stores, composables, componentes) |
| `.opencode/rules/sockets-architecture.md` | Socket.IO |
| `.opencode/rules/quiz-system.md` | Quiz adaptativo (composables interdependientes) |
| `.opencode/rules/decisions-log.md` | Decisiones técnicas ya tomadas |

## Automatización disponible (prompts Copilot)

Usa `/` en el chat:

| Prompt | Propósito |
|--------|-----------|
| `/nueva-feature` | Feature full-stack completa |
| `/nuevo-endpoint` | Nuevo endpoint REST |
| `/debug-error` | Diagnosticar error |
| `/escribir-tests` | Generar tests |
| `/planificar-arquitectura` | Planificar antes de implementar |

## Agents disponibles

- **Arquitecto** — Planificación y diseño arquitectónico
- **Vue Refactoring Expert** — Calidad de código Vue y refactorización
