import { defineStore } from "pinia";
import { ref } from "vue";
import adminService from "@/api/admin.service";

export const useAdminStore = defineStore("admin", () => {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const pagination = ref({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const clearError = () => {
    error.value = null;
  };

  const fetchUsers = async (page = 1, limit = 20, search = "") => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.getUsers(page, limit, search);
      users.value = response.data.users;
      pagination.value = {
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total,
      };
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "Error al obtener usuarios";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id, userData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await adminService.updateUser(id, userData);
      // Update locally
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        Object.assign(users.value[index], response.data.user);
      }
      return response.data;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Error al actualizar usuario";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await adminService.deleteUser(id);
      // Remove locally
      users.value = users.value.filter((u) => u.id !== id);
      pagination.value.total -= 1;
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || "Error al eliminar usuario";
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    clearError,
    fetchUsers,
    updateUser,
    deleteUser,
  };
});
