---
name: retrospect
description: "Analiza la sesión completada — cambios y errores — y propone mejoras concretas para skills, rules y decisions-log. USA CUANDO: 'haz retrospectiva', 'revisa lo que hemos hecho', 'actualiza los skills', 'aprende de esta sesión'. PRODUCE: propuestas de mejora para .opencode/."
---

# Retrospect — Automejora de skills y reglas

Analiza la sesión reciente y propone mejoras a los skills, reglas y registro de decisiones.

## Cuándo se activa

- Al terminar una feature, fix o refactor significativo
- "haz retrospectiva", "revisa la sesión", "actualiza skills"

## Procedimiento

### 1. Recopilar contexto

1. Preguntar al usuario el alcance (último commit, rango de commits, o toda la sesión).
2. Si no especifica, usar `git diff HEAD~1 --name-only` para listar archivos modificados.
3. Si existe `logs/agent/session.md`, leerlo para identificar errores y soluciones.
4. Identificar qué skills/rules están relacionados con los archivos tocados.

### 2. Evaluar skills/rules implicados

| Archivos tocados | Skill/rule a revisar |
|---|---|
| `backend/src/controllers/`, `models/`, `routes/` | `backend-endpoint`, `backend-conventions` |
| `ludoScript/src/stores/` | `frontend-store`, `frontend-conventions` |
| `ludoScript/src/composables/` | `frontend-composable` |
| `ludoScript/src/components/` | `ui-component` |
| `backend/src/socket/` o `socket.service.js` | `socket-event`, `sockets-architecture` |
| `ludoScript/src/api/*.service.js` | `backend-endpoint` |
| `*.spec.js`, `*.test.js` | `tests` |
| Múltiples capas | `feature-vertical`, `design-review` |

Para cada uno, preguntar:
1. ¿El error o patrón ya está documentado?
2. ¿Hay algo nuevo que merezca añadirse a "errores comunes"?
3. ¿Hay una decisión técnica que deba ir a `decisions-log.md`?

### 3. Detectar omisiones comunes

- ¿Endpoint sin registrar en `routes/index.js` o sin `authMiddleware`?
- ¿Modelo sin asociaciones en `models/index.js`?
- ¿Store sin `loading`/`error`/`clearError`?
- ¿Listeners de socket sin `socket.off()` en `onUnmounted`?
- ¿`password` expuesta en alguna respuesta?
- ¿`async setup` en lugar de `onMounted`?

Si alguna ocurrió y NO está documentada en el skill correspondiente → proponer añadirla.

### 4. Proponer cambios

Formato de cada propuesta:

```markdown
### [skill/rule]: [archivo]
**Problema:** qué faltó o qué se aprendió
**Cambio sugerido:** texto exacto a añadir/modificar
**Ubicación:** sección del archivo
```

Máximo 3 propuestas. Si hay más, priorizar las más repetibles.

### 5. Esperar aprobación

No modificar nada sin confirmación del usuario. Preguntar "¿Aplico estos cambios?".

## Reglas

- No modificar nada sin aprobación explícita
- Priorizar: bugs repetibles > documentación faltante > mejoras cosméticas
- Si no hay nada que mejorar, decirlo directamente
- No proponer cambios a skills no relacionados
