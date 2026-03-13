import api from './axios'

export const authService = {
  // POST /api/auth/login  → { token, user }
  login: (credentials) => api.post('/auth/login', credentials),

  // POST /api/auth/register  → { token, user }
  register: (data) => api.post('/auth/register', data),

  // GET /api/auth/me  → user (requiere token)
  me: () => api.get('/auth/me'),
}
