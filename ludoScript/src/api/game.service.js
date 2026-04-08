import api from "./axios";

export const gameService = {
  // GET /api/games/weekly — actividad de la semana actual del usuario autenticado
  getWeekly: () => api.get("/games/weekly"),
  // POST /api/games/ — crea una nueva partida con los resultados del quiz
  createGame: (data) => api.post("/games/", data),
};
