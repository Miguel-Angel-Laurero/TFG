import api from './axios'

export const userService = {
  // GET /api/users
  getAll: () => api.get('/users'),

  // GET /api/users/:id
  getById: (id) => api.get(`/users/${id}`),

  // PUT /api/users/:id
  update: (id, data) => api.put(`/users/${id}`, data),

  // DELETE /api/users/:id
  remove: (id) => api.delete(`/users/${id}`),
}
