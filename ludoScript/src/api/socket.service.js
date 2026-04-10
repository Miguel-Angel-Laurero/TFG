import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_API_URL?.replace("/api", "") ??
  "http://localhost:3000";

let socket = null;

/**
 * Conecta el socket autenticado con el JWT del usuario.
 * Si ya hay una conexión activa, la reutiliza.
 */
function connect() {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token de autenticación");

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect_error", (err) => {
    console.error("[socket] error de conexión:", err.message);
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
}

/**
 * Devuelve la instancia actual del socket (o null si no conectado).
 */
function getSocket() {
  return socket;
}

export const socketService = { connect, disconnect, getSocket };
