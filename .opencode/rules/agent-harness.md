# Agent Activity Harness

Registro mínimo de errores y guardrails de comportamiento.

## Registro de errores

Si ocurre un error no resuelto durante la sesión, se conserva `logs/agent/session.md` con la causa y recuperación. Si la sesión termina sin errores, el archivo se elimina. Al iniciar una sesión, si existe `session.md` huérfano, se archiva como `logs/agent/errors/crash-YYYYMMDD-HHmmss.md`.

## Guardrails

### Tests rotos
Si `npm test` / `npm run lint` fallan tras un cambio: no continuar hasta que pasen. Si el fallo es preexistente, informar antes de tocar nada más.

### Conflictos de git
No hacer commit, push ni amend. Informar al usuario y esperar instrucciones.

### Archivos grandes (+200 líneas)
Leer contexto completo antes de editar. Si el cambio supera 20 líneas, preguntar.

### Cambios multi-archivo (3+ archivos)
Presentar plan al usuario antes de ejecutar. No proceder sin confirmación.
