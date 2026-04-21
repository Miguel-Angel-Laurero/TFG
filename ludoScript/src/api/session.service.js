import api from "@/api/axios";

export const sessionService = {
  // Guarda una sesión de quiz en la nube
  // sessionData: { timestamp, pdfId?, stats }
  saveSession: (sessionData) => api.post("/sessions", sessionData),

  // Devuelve la sesión más reciente del usuario autenticado
  getLastSession: () => api.get("/sessions/last"),

  // Devuelve las N sesiones más recientes (default 14, max 50)
  getRecentSessions: (limit = 14) =>
    api.get("/sessions/recent", { params: { limit } }),
};
