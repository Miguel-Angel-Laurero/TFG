import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { socketService } from "@/api/socket.service";

/**
 * Store de duelo 1v1 en clase.
 *
 * Ciclo de vida del estado:
 *   idle → invited (al recibir duel:invitation)
 *   idle → waiting (al crear el duelo como owner y recibir duel:created)
 *   waiting → playing (al recibir game:started)
 *   playing → finished (al recibir game:finished)
 *   any → cancelled (rechazo o timeout)
 *
 * NOTA: los eventos game:question / game:timer / etc. son los mismos
 * que usa el multijugador. Como un usuario no puede estar en ambas
 * partidas simultáneamente, el estado fantasma en el otro store no
 * tiene efecto visual.
 */
export const useDuelStore = defineStore("claseDuel", () => {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const pendingInvitation = ref(null);
  // null | { duelCode, inviterUsername, category, questionCount, expiresInMs }

  const duelCode = ref(null);
  const duelStatus = ref("idle");
  // 'idle' | 'invited' | 'waiting' | 'playing' | 'finished' | 'cancelled'

  const players = ref([]);
  // [{ userId, username, score, isHost }]

  const currentQuestion = ref(null);
  const timerRemaining = ref(0);
  const timerTotal = ref(20);
  const lastAnswerResult = ref(null);
  const lastQuestionEnd = ref(null);
  const finalRanking = ref([]);
  const myScore = ref(0);
  const error = ref(null);

  // ── Getters ─────────────────────────────────────────────────────────────────
  const hasAnswered = computed(() => !!lastAnswerResult.value);

  // ── Utilidades ──────────────────────────────────────────────────────────────
  function clearError() {
    error.value = null;
  }

  function reset() {
    pendingInvitation.value = null;
    duelCode.value = null;
    duelStatus.value = "idle";
    players.value = [];
    currentQuestion.value = null;
    timerRemaining.value = 0;
    lastAnswerResult.value = null;
    lastQuestionEnd.value = null;
    finalRanking.value = [];
    myScore.value = 0;
    error.value = null;
    _listenersRegistered = false;
  }

  // ── Socket listeners ─────────────────────────────────────────────────────────
  let _listenersRegistered = false;

  /**
   * Conecta el socket (si no está conectado) y registra todos los listeners.
   * Idempotente: llamadas repetidas son seguras gracias a _listenersRegistered.
   */
  function setupListeners() {
    const socket = socketService.getSocket() ?? socketService.connect();
    if (_listenersRegistered) return socket;
    _listenersRegistered = true;

    // ── Eventos de invitación ────────────────────────────────────────────────

    socket.on("duel:invitation", (data) => {
      pendingInvitation.value = data;
      if (duelStatus.value === "idle") duelStatus.value = "invited";
    });

    socket.on("duel:created", (data) => {
      duelCode.value = data.duelCode;
      duelStatus.value = "waiting";
    });

    socket.on("duel:player-ready", () => {
      if (duelStatus.value === "invited") {
        duelStatus.value = "waiting";
      }
    });

    socket.on("duel:opponent-declined", (data) => {
      duelStatus.value = "cancelled";
      error.value = `${data.username} ha rechazado el duelo.`;
    });

    socket.on("duel:cancelled", (data) => {
      pendingInvitation.value = null;
      duelStatus.value = "cancelled";
      error.value = data.message;
    });

    socket.on("duel:error", (data) => {
      error.value = data.message;
    });

    // ── Game loop (mismos eventos que multiplayer) ────────────────────────────

    socket.on("game:started", () => {
      duelStatus.value = "playing";
      currentQuestion.value = null;
      lastAnswerResult.value = null;
      lastQuestionEnd.value = null;
    });

    socket.on("game:question", (data) => {
      currentQuestion.value = data;
      timerRemaining.value = data.timeLimit;
      timerTotal.value = data.timeLimit;
      lastAnswerResult.value = null;
      lastQuestionEnd.value = null;
    });

    socket.on("game:timer", (data) => {
      timerRemaining.value = data.remaining;
    });

    socket.on("game:answer-result", (data) => {
      lastAnswerResult.value = data;
      myScore.value = data.totalScore;
    });

    socket.on("game:question-end", (data) => {
      lastQuestionEnd.value = data;
      players.value = data.scores;
    });

    socket.on("game:finished", (data) => {
      duelStatus.value = "finished";
      finalRanking.value = data.ranking;
    });

    socket.on("disconnect", () => {
      if (duelStatus.value === "playing" || duelStatus.value === "waiting") {
        error.value = "Conexión perdida con el servidor.";
        duelStatus.value = "cancelled";
      }
      _listenersRegistered = false;
    });

    return socket;
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────

  /** Owner: envía invitación de duelo para dos miembros */
  function sendInvite({ player1Id, player2Id, category, questionCount }) {
    const socket = setupListeners();
    error.value = null;
    socket.emit("duel:invite", {
      player1Id,
      player2Id,
      category,
      questionCount,
    });
  }

  /** Invitado: acepta la invitación y navega a DuelView */
  function acceptDuel(code) {
    const socket = setupListeners();
    pendingInvitation.value = null;
    duelCode.value = code;
    socket.emit("duel:accept", { duelCode: code });
  }

  /** Invitado: rechaza la invitación */
  function declineDuel(code) {
    const socket = socketService.getSocket();
    if (socket) socket.emit("duel:decline", { duelCode: code });
    pendingInvitation.value = null;
    duelStatus.value = "idle";
  }

  /** Jugador: envía respuesta durante la partida */
  function sendAnswer(answerIndex) {
    if (!currentQuestion.value || lastAnswerResult.value) return;
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.emit("game:answer", {
      questionIndex: currentQuestion.value.questionIndex,
      answerIndex,
    });
  }

  return {
    pendingInvitation,
    duelCode,
    duelStatus,
    players,
    currentQuestion,
    timerRemaining,
    timerTotal,
    lastAnswerResult,
    lastQuestionEnd,
    finalRanking,
    myScore,
    error,
    hasAnswered,
    clearError,
    reset,
    setupListeners,
    sendInvite,
    acceptDuel,
    declineDuel,
    sendAnswer,
  };
});
