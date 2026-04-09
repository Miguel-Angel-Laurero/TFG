import api from './axios'

export const groupService = {
  // GET /api/groups — get groups for current user
  getMyGroups: () => api.get('/groups'),

  // POST /api/groups — create a new group
  createGroup: (data) => api.post('/groups', data),

  // POST /api/groups/join — join a group by invite code
  joinGroup: (inviteCode) => api.post('/groups/join', { inviteCode }),

  // GET /api/groups/:id — get group details
  getGroup: (id) => api.get(`/groups/${id}`),

  // DELETE /api/groups/:id/leave — leave a group
  leaveGroup: (id) => api.delete(`/groups/${id}/leave`),

  // DELETE /api/groups/:id — delete a group (owner only)
  deleteGroup: (id) => api.delete(`/groups/${id}`),
}
