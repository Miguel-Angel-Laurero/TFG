import api from "./axios";

export const gameService = {
  // GET /api/games/weekly — actividad de la semana actual del usuario autenticado
  getWeekly: () => api.get("/games/weekly"),
};
