const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");
const { registerGameHandlers } = require("./gameHandler");
const { registerDuelHandlers } = require("./duelHandler");
const { registerGroupGameHandlers } = require("./groupGameHandler");

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

      // Sin token → espectador invitado (acceso de solo lectura)
      if (!token) {
        socket.user = { id: null, username: "Espectador", isGuest: true };
        return next();
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

  // ── Mapa userId → socketId (para enviar invitaciones de duelo) ────────────
  /** @type {Map<number, string>} */
  const userSockets = new Map();

  // ── Handlers de eventos ────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(
      `🔌 Socket conectado: ${socket.id} (user ${socket.user?.id ?? "guest"})`,
    );

    // Registrar socket en el mapa solo para usuarios autenticados
    if (!socket.user.isGuest) {
      userSockets.set(socket.user.id, socket.id);
    }

    // Guests solo pueden usar spectator:join (registrado dentro de gameHandlers)
    registerGameHandlers(io, socket);

    if (!socket.user.isGuest) {
      registerDuelHandlers(io, socket, userSockets);
      registerGroupGameHandlers(io, socket, userSockets);
    }

    socket.on("disconnect", (reason) => {
      if (
        !socket.user.isGuest &&
        userSockets.get(socket.user?.id) === socket.id
      ) {
        userSockets.delete(socket.user.id);
      }
      console.log(`🔌 Socket desconectado: ${socket.id} — ${reason}`);
    });
  });

  console.log("✅ Socket.io inicializado");
  return io;
}

module.exports = { initSocket };
