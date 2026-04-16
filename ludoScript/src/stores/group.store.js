import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { groupService } from "@/api/group.service";
import { useAuthStore } from "@/stores/auth.store";
import { socketService } from "@/api/socket.service";

export const useGroupStore = defineStore("group", () => {
  const group = ref(null); // Objeto del grupo con su lista de members
  const stats = ref([]); // Array de stats del ranking
  const loading = ref(false);
  const loadingStats = ref(false);
  const error = ref(null);

  // ── Estado de partida de grupo ────────────────────────────────────────────
  /** Código de sala activa (partida iniciada por el propietario) */
  const activeGameCode = ref(null);
  /** Invitación pendiente recibida vía socket: { code, initiatorUsername, groupName, settings } */
  const pendingGroupInvite = ref(null);
  let _notifListenersRegistered = false;

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

  // ── Notificaciones de partida de grupo (socket) ───────────────────────────
  /**
   * Conecta el socket y registra el listener group:game-invite.
   * Idempotente: si ya está registrado no lo duplica.
   */
  function connectNotifications() {
    if (_notifListenersRegistered) return;
    try {
      const socket = socketService.connect();
      socket.on("group:game-invite", (invite) => {
        pendingGroupInvite.value = invite;
        activeGameCode.value = invite.code;
      });
      _notifListenersRegistered = true;
    } catch {
      // Sin token — usuario no autenticado, no conectar
    }
  }

  /** Descarta la invitación pendiente (sin unirse) y limpia el código de sala activo. */
  function dismissInvite() {
    pendingGroupInvite.value = null;
    activeGameCode.value = null;
  }

  /**
   * El propietario inicia una partida de grupo.
   * Emite group:start-game y espera room:created.
   * @returns {Promise<string|null>} el código de sala, o null si hay error.
   */
  function startGroupGame({
    questionCount = 10,
    timePerQuestion = 20,
    category = null,
  } = {}) {
    return new Promise((resolve) => {
      try {
        const socket = socketService.connect();

        socket.once("room:created", ({ code }) => {
          activeGameCode.value = code;
          resolve(code);
        });

        socket.once("group:error", ({ message }) => {
          error.value = message;
          resolve(null);
        });

        socket.emit("group:start-game", {
          questionCount,
          timePerQuestion,
          category,
        });
      } catch (e) {
        error.value = "No se pudo conectar al servidor.";
        resolve(null);
      }
    });
  }

  return {
    group,
    stats,
    loading,
    loadingStats,
    error,
    activeGameCode,
    pendingGroupInvite,
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
    connectNotifications,
    dismissInvite,
    startGroupGame,
  };
});
