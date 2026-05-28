# Arquitectura Socket.IO — LudoScript

## Backend (`backend/src/socket/`)

```
index.js         initSocket(httpServer, clientUrl)  — JWT auth + delegación a handlers
gameHandler.js   Salas de quiz (create-room, join-room, game-start, submit-answer)
duelHandler.js   Duelos 1v1 (desafiar, aceptar, responder, finalizar)
groupGameHandler.js  Juego de clase/grupo (iniciar, responder, resultados)
roomManager.js   Estado en memoria de salas activas (Map) — usar siempre, no estado ad-hoc
```

## Patrón de handler backend

```js
// backend/src/socket/miFeature.handler.js
function registerMiFeatureHandlers(io, socket) {
  const userId = socket.user.id; // disponible tras JWT middleware
  const username = socket.user.username;

  socket.on("dominio:accion", (payload) => {
    if (!payload.requiredField) {
      return socket.emit("dominio:error", { message: "Campo requerido" });
    }
    // lógica de negocio...
    socket.emit("dominio:result", { data });
    // o broadcast: io.to(roomCode).emit("dominio:update", { data });
  });
}
module.exports = { registerMiFeatureHandlers };
```

## Registrar handler en `backend/src/socket/index.js`

```js
const { registerMiFeatureHandlers } = require("./miFeature.handler");
// Dentro de io.on("connection", (socket) => { ... }):
registerMiFeatureHandlers(io, socket);
```

## Convenciones de nombres de eventos

- Formato: `dominio:accion` en kebab-case.
- Errores: `dominio:error { message }` — nunca excepciones.
- `socket.user.id` para identificar al usuario, nunca el payload.

## Frontend (`ludoScript/src/api/socket.service.js`)

```js
import { socketService } from "@/api/socket.service";

const socket = socketService.connect();

// Emitir
socket.emit("dominio:accion", { requiredField: "value" });

// Escuchar (siempre limpiar en onUnmounted)
socket.on("dominio:result", (data) => { /* actualizar estado */ });

onUnmounted(() => {
  socket.off("dominio:result"); // ⚠️ CRÍTICO: limpiar listeners
});
```

## ⚠️ Regla de oro

**Todo `socket.on("evento")` requiere su `socket.off("evento")` en `onUnmounted`.** Los listeners no limpiados causan memory leaks y eventos duplicados.
