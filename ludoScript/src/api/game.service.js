import api from './axios'

export const gameService = {
  // GET /api/games  (ranking general)
  getAll: () => api.get('/games'),

  // GET /api/games/my  (partidas del usuario autenticado)
  getMine: () => api.get('/games/my'),

  // GET /api/games/weekly  (actividad semanal del usuario autenticado)
  getWeekly: () => api.get('/games/weekly'),

  // GET /api/games/:id
  getById: (id) => api.get(`/games/${id}`),

  // POST /api/games
  create: (data) => api.post('/games', data),

  // PUT /api/games/:id
  update: (id, data) => api.put(`/games/${id}`, data),

  // DELETE /api/games/:id
  remove: (id) => api.delete(`/games/${id}`),
}
