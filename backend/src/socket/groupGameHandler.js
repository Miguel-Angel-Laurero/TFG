const roomManager = require("./roomManager");
const { Group, GroupMember, User } = require("../models");

/**
 * Registra el handler group:start-game para que el propietario de una clase
 * pueda iniciar una partida multijugador y notificar automáticamente
 * a todos los miembros del grupo que estén conectados.
 *
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 * @param {Map<number, string>} userSockets — mapa userId → socketId
 */
function registerGroupGameHandlers(io, socket, userSockets) {
  const userId = socket.user.id;
  const username = socket.user.username;

  // ── group:start-game ─────────────────────────────────────────────────────
  socket.on(
    "group:start-game",
    async ({
      questionCount = 10,
      timePerQuestion = 20,
      category = null,
    } = {}) => {
      try {
        // 1. Verificar que el usuario es propietario de algún grupo
        const group = await Group.findOne({ where: { ownerId: userId } });
        if (!group) {
          return socket.emit("group:error", {
            message:
              "Solo el propietario de una clase puede iniciar una partida de grupo",
          });
        }

        // 2. Limpiar salas previas del host
        roomManager.leaveAllRooms(userId, socket, io);

        // 3. Crear sala
        const settings = {
          questionCount: Math.min(Math.max(questionCount, 3), 20),
          timePerQuestion: Math.min(Math.max(timePerQuestion, 5), 60),
          category: category ?? null,
        };
        const room = roomManager.createRoom(
          userId,
          username,
          socket.id,
          settings,
        );
        socket.join(room.code);

        // 4. Confirmar al propietario
        socket.emit("room:created", {
          code: room.code,
          players: roomManager.getPlayersPublic(room),
          settings: room.settings,
          isHost: true,
        });

        console.log(
          `🏫 Sala de grupo creada: ${room.code} por propietario ${userId} (grupo "${group.name}")`,
        );

        // 5. Notificar a todos los miembros conectados (excepto al propietario)
        const members = await GroupMember.findAll({
          where: { groupId: group.id },
          include: [{ model: User, as: "user", attributes: ["id"] }],
        });

        let notified = 0;
        for (const member of members) {
          const memberId = member.user?.id ?? member.userId;
          if (memberId === userId) continue; // saltar al propietario

          const memberSocketId = userSockets.get(memberId);
          if (memberSocketId) {
            io.to(memberSocketId).emit("group:game-invite", {
              code: room.code,
              initiatorUsername: username,
              groupName: group.name,
              settings: room.settings,
            });
            notified++;
          }
        }

        console.log(
          `📢 Invitaciones enviadas a ${notified} miembros de "${group.name}"`,
        );
      } catch (err) {
        console.error("[groupGameHandler] group:start-game error:", err);
        socket.emit("group:error", {
          message: "Error al iniciar la partida de grupo",
        });
      }
    },
  );
}

module.exports = { registerGroupGameHandlers };
