import api from "./axios";

const adminService = {
  getUsers(page = 1, limit = 20, search = "") {
    return api.get("/admin/users", {
      params: { page, limit, search },
    });
  },

  updateUser(id, userData) {
    return api.put(`/admin/users/${id}`, userData);
  },

  deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
  },
};

export default adminService;
