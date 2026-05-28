---
name: socket-event
description: "Añade un evento Socket.IO completo: handler backend registrado + listener/emisión frontend con limpieza en onUnmounted. USA CUANDO: 'añade evento de socket', 'nuevo evento en tiempo real', 'conecta socket en el componente'. NO USAR para depurar errores de socket (usa debug)."
---

# Socket Event (handler backend + listener frontend)

## Arquitectura del sistema

### Backend (`backend/src/socket/`)

```
index.js         initSocket(httpServer, clientUrl) — JWT middleware + delegación
gameHandler.js   Salas de quiz (room:create/join/leave, game:start/answer/end)
duelHandler.js   Duelos 1v1 (duel:challenge/accept/answer/end)
groupGameHandler.js  Juego de clase/grupo (group:start/answer/results)
roomManager.js   Estado en memoria de salas activas (Map)
```

## Procedimiento

### Paso 1 — Explorar contexto

Leer los handlers existentes para entender el patrón actual:
- `backend/src/socket/gameHandler.js` (handler más completo)
- `backend/src/socket/roomManager.js` (si el evento gestiona salas)

### Paso 2 — Crear handler backend

Archivo: `backend/src/socket/miFeature.handler.js`

```js
function registerMiFeatureHandlers(io, socket) {
  const userId = socket.user.id;
  const username = socket.user.username;

  socket.on("dominio:accion", (payload) => {
    if (!payload.requiredField) {
      return socket.emit("dominio:error", { message: "Campo requerido" });
    }
    // lógica de negocio
    socket.emit("dominio:result", { data });
    // o broadcast: io.to(roomCode).emit("dominio:update", { data });
  });
}
module.exports = { registerMiFeatureHandlers };
```

Registrar en `backend/src/socket/index.js`:
```js
const { registerMiFeatureHandlers } = require("./miFeature.handler");
// Dentro de io.on("connection", (socket) => { ... }):
registerMiFeatureHandlers(io, socket);
```

### Paso 3 — Implementar en frontend

```js
import { socketService } from "@/api/socket.service";

const socket = socketService.connect();

socket.emit("dominio:accion", { requiredField: "value" });

socket.on("dominio:result", (data) => { /* actualizar estado */ });

onUnmounted(() => {
  socket.off("dominio:result"); // ⚠️ SIEMPRE limpiar listeners
});
```

### Convenciones de nombres

- Formato: `dominio:accion` en kebab-case.
- Errores: `dominio:error { message }` — nunca excepciones.
- `socket.user.id` para identificar al usuario, nunca el payload.

## Checklist

- [ ] Nombre del evento sigue formato `dominio:accion`
- [ ] Errores emitidos como `dominio:error { message }`
- [ ] Handler registrado en `socket/index.js`
- [ ] Frontend llama `socket.off()` en `onUnmounted`
- [ ] Si gestiona salas: usa `roomManager`
- [ ] `socket.user.id` usado para identificación
