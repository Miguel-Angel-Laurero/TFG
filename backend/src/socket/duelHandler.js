const roomManager = require("./roomManager");
const { GroupMember, Group } = require("../models");

/**
 * Registra handlers de duelo 1v1 para un socket dado.
 *
 * Eventos C→S:
 *   duel:invite   { player1Id, player2Id, category, questionCount }
 *   duel:accept   { duelCode }
 *   duel:decline  { duelCode }
 *
 * Eventos S→C:
 *   duel:created           { duelCode }
 *   duel:invitation        { duelCode, inviterUsername, category, questionCount, expiresInMs }
 *   duel:player-ready      { username, readyCount }
 *   duel:opponent-declined { username }
 *   duel:cancelled         { message }
 *   duel:error             { message, [offlinePlayers] }
 *
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 * @param {Map<number, string>} userSockets  userId → socketId
 */
function registerDuelHandlers(io, socket, userSockets) {
  const userId = socket.user.id;
  const username = socket.user.username;

  // ── duel:invite ─────────────────────────────────────────────────────────────
  socket.on(
    "duel:invite",
    async ({ player1Id, player2Id, category, questionCount = 10 } = {}) => {
      try {
        const p1Id = Number(player1Id);
        const p2Id = Number(player2Id);

        if (!p1Id || !p2Id) {
          return socket.emit("duel:error", {
            message: "Debes seleccionar dos jugadores.",
          });
        }
        if (p1Id === p2Id) {
          return socket.emit("duel:error", {
            message: "Los dos jugadores deben ser distintos.",
          });
        }
        if (!category || typeof category !== "string") {
          return socket.emit("duel:error", {
            message: "Debes seleccionar una categoría.",
          });
        }

        // Verificar que el emisor es propietario de su grupo
        const membership = await GroupMember.findOne({ where: { userId } });
        if (!membership) {
          return socket.emit("duel:error", {
            message: "No perteneces a ninguna clase.",
          });
        }
        const group = await Group.findByPk(membership.groupId);
        if (!group || group.ownerId !== userId) {
          return socket.emit("duel:error", {
            message: "Solo el propietario puede iniciar un duelo.",
          });
        }

        // Verificar que ambos jugadores pertenecen al mismo grupo
        const [p1m, p2m] = await Promise.all([
          GroupMember.findOne({ where: { userId: p1Id, groupId: group.id } }),
          GroupMember.findOne({ where: { userId: p2Id, groupId: group.id } }),
        ]);
        if (!p1m || !p2m) {
          return socket.emit("duel:error", {
            message: "Ambos jugadores deben ser miembros de tu clase.",
          });
        }

        // Verificar que ambos están conectados
        const socket1Id = userSockets.get(p1Id);
        const socket2Id = userSockets.get(p2Id);
        const offline = [];
        if (!socket1Id) offline.push(p1Id);
        if (!socket2Id) offline.push(p2Id);
        if (offline.length > 0) {
          return socket.emit("duel:error", {
            message:
              "Uno o ambos jugadores no están conectados en este momento.",
            offlinePlayers: offline,
          });
        }

        // Crear sala de duelo
        const count = Math.min(Math.max(Number(questionCount) || 10, 3), 20);
        const room = roomManager.createDuelRoom(userId, p1Id, p2Id, {
          category: category.trim(),
          questionCount: count,
        });

        const INVITE_TIMEOUT_MS = 60_000;

        // Auto-cancelar tras 60 s si no se acepta
        room._inviteTimeout = setTimeout(() => {
          const r = roomManager.getRoom(room.code);
          if (r && r.status === "lobby") {
            const cancelMsg = {
              message: "La invitación al duelo ha caducado.",
            };
            [p1Id, p2Id].forEach((pid) => {
              const sid = userSockets.get(pid);
              if (sid) {
                const s = io.sockets.sockets.get(sid);
                if (s) s.emit("duel:cancelled", cancelMsg);
              }
            });
            const inviterSid = userSockets.get(userId);
            if (inviterSid) {
              const inviterSocket = io.sockets.sockets.get(inviterSid);
              if (inviterSocket)
                inviterSocket.emit("duel:cancelled", {
                  message: "El duelo caducó sin que ambos jugadores aceptaran.",
                });
            }
            roomManager.destroyRoom(room.code, io);
          }
        }, INVITE_TIMEOUT_MS);

        // Enviar invitación a los dos jugadores
        const invitationPayload = {
          duelCode: room.code,
          inviterUsername: username,
          category,
          questionCount: count,
          expiresInMs: INVITE_TIMEOUT_MS,
        };
        [socket1Id, socket2Id].forEach((sid) => {
          const s = io.sockets.sockets.get(sid);
          if (s) s.emit("duel:invitation", invitationPayload);
        });

        // Confirmar al propietario
        socket.emit("duel:created", { duelCode: room.code });
        console.log(`⚔️  Duelo creado: ${room.code} por user ${userId}`);
      } catch (err) {
        console.error("❌ duel:invite error:", err.message);
        socket.emit("duel:error", { message: "Error al crear el duelo." });
      }
    },
  );

  // ── duel:accept ─────────────────────────────────────────────────────────────
  socket.on("duel:accept", ({ duelCode } = {}) => {
    if (!duelCode) {
      return socket.emit("duel:error", {
        message: "Código de duelo requerido.",
      });
    }

    const result = roomManager.joinDuelRoom(
      duelCode,
      userId,
      username,
      socket.id,
    );
    if (!result.ok) {
      return socket.emit("duel:error", { message: result.error });
    }

    const room = result.room;
    socket.join(duelCode);
    const readyCount = room.players.size;

    io.to(duelCode).emit("duel:player-ready", { username, readyCount });
    console.log(`✅ User ${userId} aceptó duelo ${duelCode} (${readyCount}/2)`);

    // Arrancar automáticamente cuando los dos han aceptado
    if (readyCount === 2) {
      if (room._inviteTimeout) {
        clearTimeout(room._inviteTimeout);
        room._inviteTimeout = null;
      }
      roomManager.startGame(room, io);
    }
  });

  // ── duel:decline ────────────────────────────────────────────────────────────
  socket.on("duel:decline", ({ duelCode } = {}) => {
    if (!duelCode) return;
    const room = roomManager.getRoom(duelCode);
    if (!room || room.type !== "duel") return;

    if (room._inviteTimeout) {
      clearTimeout(room._inviteTimeout);
      room._inviteTimeout = null;
    }

    const cancelMsg = `${username} ha rechazado el duelo.`;

    // Notificar al jugador que ya había aceptado (si lo hay)
    for (const [pid, player] of room.players.entries()) {
      if (pid !== userId) {
        const s = io.sockets.sockets.get(player.socketId);
        if (s) s.emit("duel:cancelled", { message: cancelMsg });
      }
    }

    // Notificar al otro invitado que aún no respondió
    for (const pid of room.allowedPlayerIds) {
      if (pid !== userId && !room.players.has(pid)) {
        const sid = userSockets.get(pid);
        if (sid) {
          const s = io.sockets.sockets.get(sid);
          if (s) s.emit("duel:cancelled", { message: cancelMsg });
        }
      }
    }

    // Notificar al propietario (invitante)
    const inviterSid = userSockets.get(room.inviterId);
    if (inviterSid) {
      const inviterSocket = io.sockets.sockets.get(inviterSid);
      if (inviterSocket)
        inviterSocket.emit("duel:opponent-declined", { username });
    }

    roomManager.destroyRoom(duelCode, io);
    console.log(`❌ Duelo ${duelCode} rechazado por user ${userId}`);
  });
}

module.exports = { registerDuelHandlers };
