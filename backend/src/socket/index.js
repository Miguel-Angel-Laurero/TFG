const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");
const { registerGameHandlers } = require("./gameHandler");

/**
 * Inicializa Socket.io adjuntándolo al servidor HTTP de Express.
 * El middleware de autenticación valida el JWT antes de aceptar la conexión.
 *
 * @param {import("http").Server} httpServer
 * @param {string} clientUrl  URL del frontend (para CORS)
 */
function initSocket(httpServer, clientUrl) {
  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── Middleware JWT ──────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Unauthorized: token required"));
      }
      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error("Unauthorized: invalid or expired token"));
      }

      let username = payload.username;
      if (!username && payload.id) {
        const user = await User.findByPk(payload.id, {
          attributes: ["id", "username"],
        });
        if (!user) {
          return next(new Error("Unauthorized: user not found"));
        }
        username = user.username;
      }

      // Adjunta datos del usuario al socket para uso en handlers.
      // Si el JWT es antiguo y no incluye username, se recupera desde BD.
      socket.user = { id: payload.id, username };
      next();
    } catch (error) {
      next(new Error("Unauthorized: socket authentication failed"));
    }
  });

  // ── Handlers de eventos ────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 Socket conectado: ${socket.id} (user ${socket.user?.id})`);
    registerGameHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket desconectado: ${socket.id} — ${reason}`);
    });
  });

  console.log("✅ Socket.io inicializado");
  return io;
}

module.exports = { initSocket };
