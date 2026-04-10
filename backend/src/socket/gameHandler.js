const roomManager = require("./roomManager");

/**
 * Registra todos los handlers de eventos de sala y juego para un socket dado.
 *
 * Convención de errores: todos los errores de negocio se emiten como
 * `room:error { message }` — nunca se lanza una excepción al cliente.
 *
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 */
function registerGameHandlers(io, socket) {
  const userId = socket.user.id;
  const username = socket.user.username;

  // ── room:create ─────────────────────────────────────────────────────────────
  socket.on(
    "room:create",
    ({ questionCount = 10, timePerQuestion = 20 } = {}) => {
      // Si el usuario ya tiene una sala abierta, la limpiamos primero
      roomManager.leaveAllRooms(userId, socket, io);

      const room = roomManager.createRoom(userId, username, socket.id, {
        questionCount: Math.min(Math.max(questionCount, 3), 20),
        timePerQuestion: Math.min(Math.max(timePerQuestion, 5), 60),
      });

      socket.join(room.code);
      socket.emit("room:created", {
        code: room.code,
        players: roomManager.getPlayersPublic(room),
        settings: room.settings,
        isHost: true,
      });
      console.log(`🏠 Sala creada: ${room.code} por user ${userId}`);
    },
  );

  // ── room:join ──────────────────────────────────────────────────────────────
  socket.on("room:join", ({ code } = {}) => {
    if (!code) {
      return socket.emit("room:error", { message: "Código de sala requerido" });
    }

    const result = roomManager.joinRoom(
      code.toUpperCase(),
      userId,
      username,
      socket.id,
    );
    if (!result.ok) {
      return socket.emit("room:error", { message: result.error });
    }

    socket.join(code.toUpperCase());
    const room = result.room;

    socket.emit("room:joined", {
      code: room.code,
      players: roomManager.getPlayersPublic(room),
      settings: room.settings,
      isHost: room.hostId === userId,
    });

    // Notificar al resto de la sala
    socket.to(room.code).emit("room:players-updated", {
      players: roomManager.getPlayersPublic(room),
    });

    console.log(`🚪 User ${userId} se unió a sala ${room.code}`);
  });

  // ── room:leave ─────────────────────────────────────────────────────────────
  socket.on("room:leave", () => {
    _handleLeave(socket, userId, username, io);
  });

  // ── game:start ─────────────────────────────────────────────────────────────
  socket.on("game:start", () => {
    const room = roomManager.getRoomByHost(userId);
    if (!room) {
      return socket.emit("room:error", {
        message: "No eres el host de ninguna sala",
      });
    }
    if (room.status !== "lobby") {
      return socket.emit("room:error", {
        message: "La partida ya ha comenzado",
      });
    }
    if (room.players.size < 1) {
      return socket.emit("room:error", {
        message: "Se necesita al menos 1 jugador",
      });
    }

    roomManager.startGame(room, io);
  });

  // ── game:answer ────────────────────────────────────────────────────────────
  socket.on("game:answer", ({ questionIndex, answerIndex } = {}) => {
    if (answerIndex === undefined || questionIndex === undefined) {
      return socket.emit("room:error", {
        message: "Datos de respuesta incompletos",
      });
    }

    const room = roomManager.getRoomByPlayer(userId);
    if (!room || room.status !== "playing") return;

    roomManager.submitAnswer(room, userId, questionIndex, answerIndex, io);
  });

  // ── disconnect ─────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    _handleLeave(socket, userId, username, io);
  });
}

/**
 * Lógica compartida de abandono/desconexión.
 */
function _handleLeave(socket, userId, username, io) {
  const room = roomManager.getRoomByPlayer(userId);
  if (!room) return;

  const isHost = room.hostId === userId;
  roomManager.leaveRoom(room.code, userId);
  socket.leave(room.code);

  if (isHost) {
    // El host cierra la sala para todos
    io.to(room.code).emit("room:closed", {
      message: "El host ha abandonado la sala",
    });
    roomManager.destroyRoom(room.code, io);
    console.log(`🗑️  Sala ${room.code} cerrada por host ${userId}`);
  } else {
    const updatedRoom = roomManager.getRoom(room.code);
    if (updatedRoom) {
      io.to(room.code).emit("room:players-updated", {
        players: roomManager.getPlayersPublic(updatedRoom),
      });
      io.to(room.code).emit("game:player-disconnected", { username });
    }
    console.log(`👋 User ${userId} salió de sala ${room.code}`);
  }
}

module.exports = { registerGameHandlers };
