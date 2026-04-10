const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
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
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized: token required"));
    }
    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error("Unauthorized: invalid or expired token"));
    }
    // Adjunta datos del usuario al socket para uso en handlers
    socket.user = { id: payload.id, username: payload.username };
    next();
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
