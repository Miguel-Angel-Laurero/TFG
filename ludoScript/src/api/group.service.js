import api from "./axios";

export const groupService = {
  // POST /api/groups — crear clase
  create: (data) => api.post("/groups", data),

  // POST /api/groups/join — unirse con código
  join: (inviteCode) => api.post("/groups/join", { inviteCode }),

  // GET /api/groups/me — mi clase
  getMyGroup: () => api.get("/groups/me"),

  // GET /api/groups/:id/stats — ranking de miembros
  getStats: (id) => api.get(`/groups/${id}/stats`),

  // DELETE /api/groups/me/leave — salir de la clase
  leave: () => api.delete("/groups/me/leave"),

  // POST /api/groups/:id/transfer — transferir liderazgo
  transfer: (id, newOwnerId) =>
    api.post(`/groups/${id}/transfer`, { newOwnerId }),

  // DELETE /api/groups/:id/members/:userId — expulsar miembro
  kick: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),

  // DELETE /api/groups/:id — disolver clase
  dissolve: (id) => api.delete(`/groups/${id}`),
};
