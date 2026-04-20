---
name: "add-socket-event"
description: "**SOCKET.IO SKILL** — Añade un nuevo evento Socket.IO (backend handler + emisión frontend) siguiendo las convenciones del proyecto. USA CUANDO: el usuario pida 'añade un evento de socket', 'nuevo evento en tiempo real', 'implementa la lógica de socket para...', 'conecta socket en el componente'. NO USAR PARA: crear un endpoint REST (usa new-backend-endpoint); depurar errores de socket existentes (usa debug-backend). PRODUCE: handler backend registrado + emisión/escucha en el componente o store Vue."
---

# Skill: Add Socket.IO Event

## Arquitectura del sistema Socket.IO

### Backend (`backend/src/socket/`)

```
index.js         initSocket(httpServer, clientUrl)  — JWT middleware + delegation
gameHandler.js   Sala de quiz (room:create/join/leave, game:start/answer/end)
duelHandler.js   1v1 duels (duel:challenge/accept/answer/end)
groupGameHandler.js  Juego de clase/grupo (group:start/answer/results)
roomManager.js   Estado en memoria de salas activas (Map)
```

**Patrón de handler backend:**

```js
// backend/src/socket/myFeature.handler.js
function registerMyFeatureHandlers(io, socket) {
  const userId = socket.user.id; // siempre disponible tras JWT middleware
  const username = socket.user.username;

  socket.on("myfeature:action", (payload) => {
    // 1. Validar payload
    if (!payload.requiredField) {
      return socket.emit("myfeature:error", { message: "Campo requerido" });
    }

    // 2. Lógica de negocio
    // ...

    // 3. Emitir resultado
    socket.emit("myfeature:result", { data });
    // O broadcast a sala: io.to(roomCode).emit("myfeature:update", { data });
  });
}

module.exports = { registerMyFeatureHandlers };
```

**Registrar en `backend/src/socket/index.js`:**

```js
const { registerMyFeatureHandlers } = require("./myFeature.handler");

// Dentro de io.on("connection", (socket) => { ... }):
registerMyFeatureHandlers(io, socket);
```

**Convenciones de nombres de eventos:** `dominio:accion` en kebab-case.
Errores siempre como `dominio:error { message }` — nunca excepciones.

### Frontend (`ludoScript/src/api/socket.service.js`)

```js
import { socketService } from "@/api/socket.service";

// Conectar (reutiliza si ya conectado)
const socket = socketService.connect();

// Emitir evento
socket.emit("myfeature:action", { requiredField: "value" });

// Escuchar respuesta (limpiar en onUnmounted)
socket.on("myfeature:result", (data) => {
  /* actualizar estado */
});

// Desconectar al salir de la vista
onUnmounted(() => {
  socket.off("myfeature:result"); // ⚠️ SIEMPRE limpiar listeners
  // socketService.disconnect();   // solo si la vista "posee" la conexión
});
```

**⚠️ Regla crítica:** Llamar `socket.off("evento")` en `onUnmounted` para todos los listeners registrados. Los listeners no limpiados causan memory leaks y eventos duplicados.

## Proceso de implementación

### Paso 1 — Explorar contexto

Leer los handlers existentes para entender el patrón actual:

- `backend/src/socket/gameHandler.js` (handler más completo)
- `backend/src/socket/roomManager.js` (si el evento gestiona salas)
- El componente Vue o store donde se usará el nuevo evento

### Paso 2 — Crear handler backend

1. Crear `backend/src/socket/miFeature.handler.js` con `registerMiFeatureHandlers(io, socket)`
2. Registrar en `backend/src/socket/index.js`

### Paso 3 — Implementar en frontend

Opciones:

- **En un store Pinia** si el estado del socket debe ser compartido entre componentes
- **En el componente** si el socket solo se usa en esa vista

Si se añade lógica de socket a un store, documentar qué eventos gestiona en el store.

### Paso 4 — Verificar limpieza

Confirmar que todos los `socket.on(...)` tienen su `socket.off(...)` correspondiente en `onUnmounted` o al desconectar.

## Checklist antes de entregar

- [ ] Nombre del evento sigue formato `dominio:accion`
- [ ] Errores emitidos como `dominio:error { message }`, no excepciones
- [ ] Handler registrado en `socket/index.js`
- [ ] Frontend llama `socket.off()` en `onUnmounted`
- [ ] Si gestiona salas: usa `roomManager` en vez de estado ad-hoc
- [ ] `socket.user.id` usado para identificar al usuario, nunca el payload
