import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { groupService } from "@/api/group.service";
import { useAuthStore } from "@/stores/auth.store";

export const useGroupStore = defineStore("group", () => {
  const group = ref(null); // Objeto del grupo con su lista de members
  const stats = ref([]); // Array de stats del ranking
  const loading = ref(false);
  const loadingStats = ref(false);
  const error = ref(null);

  const isMember = computed(() => !!group.value);
  const isOwner = computed(() => {
    const auth = useAuthStore();
    return group.value?.ownerId === auth.user?.id;
  });
  const memberCount = computed(() => group.value?.members?.length ?? 0);

  function clearError() {
    error.value = null;
  }

  // ── Obtener mi clase ──────────────────────────────────────────────────────
  async function fetchMyGroup() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await groupService.getMyGroup();
      group.value = data.group;
      if (data.group) loadingStats.value = true; // stats se cargarán justo después
    } catch (e) {
      if (e.response?.status === 404) {
        group.value = null; // No pertenece a ningún grupo — estado normal
      } else {
        error.value = e.response?.data?.message ?? "Error al cargar la clase.";
      }
    } finally {
      loading.value = false;
    }
  }

  // ── Crear clase ───────────────────────────────────────────────────────────
  async function createGroup(name, description = "") {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await groupService.create({ name, description });
      await fetchMyGroup(); // Recarga con los miembros incluidos
      return data.group;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al crear la clase.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  // ── Unirse con código ─────────────────────────────────────────────────────
  async function joinGroup(inviteCode) {
    loading.value = true;
    error.value = null;
    try {
      await groupService.join(inviteCode);
      await fetchMyGroup();
      return true;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al unirse a la clase.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ── Salir de la clase ─────────────────────────────────────────────────────
  async function leaveGroup() {
    loading.value = true;
    error.value = null;
    try {
      await groupService.leave();
      group.value = null;
      stats.value = [];
      loadingStats.value = false;
      return true;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al salir de la clase.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ── Transferir liderazgo ──────────────────────────────────────────────────
  async function transferLeadership(newOwnerId) {
    loading.value = true;
    error.value = null;
    try {
      await groupService.transfer(group.value.id, newOwnerId);
      await fetchMyGroup();
      return true;
    } catch (e) {
      error.value =
        e.response?.data?.message ?? "Error al transferir el liderazgo.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ── Expulsar miembro ──────────────────────────────────────────────────────
  async function kickMember(userId) {
    loading.value = true;
    error.value = null;
    try {
      await groupService.kick(group.value.id, userId);
      await fetchMyGroup();
      return true;
    } catch (e) {
      error.value =
        e.response?.data?.message ?? "Error al expulsar al miembro.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ── Disolver clase ────────────────────────────────────────────────────────
  async function dissolveGroup() {
    loading.value = true;
    error.value = null;
    try {
      await groupService.dissolve(group.value.id);
      group.value = null;
      stats.value = [];
      loadingStats.value = false;
      return true;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al disolver la clase.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // ── Ranking de stats ──────────────────────────────────────────────────────
  async function fetchStats() {
    if (!group.value) return;
    loading.value = true;
    loadingStats.value = true;
    error.value = null;
    try {
      const { data } = await groupService.getStats(group.value.id);
      stats.value = data.stats;
    } catch (e) {
      error.value =
        e.response?.data?.message ?? "Error al cargar las estadísticas.";
    } finally {
      loading.value = false;
      loadingStats.value = false;
    }
  }

  return {
    group,
    stats,
    loading,
    loadingStats,
    error,
    isMember,
    isOwner,
    memberCount,
    clearError,
    fetchMyGroup,
    createGroup,
    joinGroup,
    leaveGroup,
    transferLeadership,
    kickMember,
    dissolveGroup,
    fetchStats,
  };
});
