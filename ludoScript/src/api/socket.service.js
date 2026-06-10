import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_API_URL?.replace("/api", "") ??
  "http://localhost:3000";

let socket = null;
let retryCount = 0
const MAX_RETRIES = 5

/**
 * Conecta el socket autenticado con el JWT del usuario.
 * Si ya hay una conexión activa, la reutiliza.
 * Reintenta automáticamente si el servidor está dormido (Render free tier).
 */
function connect() {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token de autenticación");

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: MAX_RETRIES,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 15000,
  });

  socket.on("connect_error", () => {
    retryCount++
    if (retryCount <= MAX_RETRIES) {
      // Reintento silencioso — no alarmar al usuario
    }
  });

  socket.on("connect", () => {
    retryCount = 0
  });

  return socket;
}

/**
 * Desconecta el socket y lo elimina.
 */
function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  retryCount = 0
}

/**
 * Devuelve la instancia actual del socket (o null si no conectado).
 */
function getSocket() {
  return socket;
}

export const socketService = { connect, disconnect, getSocket };
