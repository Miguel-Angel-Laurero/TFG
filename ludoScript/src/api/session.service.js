import api from "@/api/axios";

export const sessionService = {
  // Guarda una sesión de quiz en la nube
  // sessionData: { timestamp, pdfId?, stats }
  saveSession: (sessionData) => api.post("/sessions", sessionData),

  // Devuelve la sesión más reciente del usuario autenticado
  getLastSession() {
    try {
      const response = api.get("/sessions/last");
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No hay sesiones previas, iniciando limpia.");
        return null; // Retornas null en lugar de lanzar un error
      }
      throw error; // Si es otro error (500, 403), sí lo lanzas
    }
  },

  // Devuelve las N sesiones más recientes (default 14, max 50)
  getRecentSessions: (limit = 14) =>
    api.get("/sessions/recent", { params: { limit } }),
};
