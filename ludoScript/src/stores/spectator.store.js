import { defineStore } from "pinia";
import { ref } from "vue";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_API_URL?.replace("/api", "") ??
  "http://localhost:3000";

/**
 * Store para espectadores sin cuenta.
 * Usa un socket separado del socketService principal (sin token).
 */
export const useSpectatorStore = defineStore("spectator", () => {
  // ── Estado ────────────────────────────────────────────────────────────────
  /** 'idle' | 'lobby' | 'playing' | 'finished' | 'closed' */
  const gameStatus = ref("idle");
  const roomCode = ref(null);
  const currentQuestion = ref(null);
  // { questionIndex, totalQuestions, question, options[], category, difficulty, timeLimit }
  const revealedCorrectIndex = ref(null); // null mientras no se revela
  const scores = ref([]); // [{ userId, username, score, isHost }]
  const timerRemaining = ref(0);
  const timerTotal = ref(20);
  const finalRanking = ref([]);
  const lastExplanation = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isSpectating = ref(false);

  let _socket = null;

  // ── Utilidades ────────────────────────────────────────────────────────────
  function clearError() {
    error.value = null;
  }

  function _resetGame() {
    currentQuestion.value = null;
    revealedCorrectIndex.value = null;
    scores.value = [];
    timerRemaining.value = 0;
    finalRanking.value = [];
    lastExplanation.value = null;
  }

  // ── Conexión y escucha ────────────────────────────────────────────────────
  function joinAsSpectator(code) {
    if (_socket?.connected) {
      // Ya conectado — emitir directamente
      _socket.emit("spectator:join", { code: code.toUpperCase() });
      return;
    }

    loading.value = true;
    error.value = null;
    _resetGame();
    roomCode.value = code.toUpperCase();

    // Socket sin token para acceso de espectador
    _socket = io(SOCKET_URL, {
      auth: {}, // sin token → isGuest en el servidor
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    _socket.on("connect", () => {
      _socket.emit("spectator:join", { code: roomCode.value });
    });

    _socket.on("connect_error", (err) => {
      loading.value = false;
      error.value = "No se pudo conectar al servidor en tiempo real.";
      console.error("[spectator] connect_error:", err.message);
    });

    // ── spectator:joined — estado inicial de la sala ─────────────────────
    _socket.on("spectator:joined", (state) => {
      loading.value = false;
      isSpectating.value = true;
      gameStatus.value = state.status === "lobby" ? "lobby" : state.status;
      scores.value = state.players ?? [];
      currentQuestion.value = state.currentQuestion ?? null;
      timerTotal.value = state.settings?.timePerQuestion ?? 20;
    });

    // ── spectator:error ──────────────────────────────────────────────────
    _socket.on("spectator:error", ({ message }) => {
      loading.value = false;
      error.value = message;
    });

    // ── game:started ─────────────────────────────────────────────────────
    _socket.on("game:started", ({ settings }) => {
      gameStatus.value = "playing";
      timerTotal.value = settings?.timePerQuestion ?? 20;
      currentQuestion.value = null;
      revealedCorrectIndex.value = null;
    });

    // ── game:question ─────────────────────────────────────────────────────
    _socket.on("game:question", (q) => {
      currentQuestion.value = q;
      revealedCorrectIndex.value = null;
      lastExplanation.value = null;
      timerRemaining.value = q.timeLimit ?? timerTotal.value;
    });

    // ── game:timer ────────────────────────────────────────────────────────
    _socket.on("game:timer", ({ remaining, total }) => {
      timerRemaining.value = remaining;
      timerTotal.value = total;
    });

    // ── game:question-end ────────────────────────────────────────────────
    _socket.on(
      "game:question-end",
      ({ correctIndex, explanation, scores: s }) => {
        revealedCorrectIndex.value = correctIndex;
        lastExplanation.value = explanation ?? null;
        scores.value = s ?? scores.value;
      },
    );

    // ── game:finished ────────────────────────────────────────────────────
    _socket.on("game:finished", ({ ranking }) => {
      gameStatus.value = "finished";
      finalRanking.value = ranking ?? [];
    });

    // ── room:closed ──────────────────────────────────────────────────────
    _socket.on("room:closed", () => {
      gameStatus.value = "closed";
    });

    // ── room:players-updated ─────────────────────────────────────────────
    _socket.on("room:players-updated", ({ players }) => {
      scores.value = players;
    });
  }

  function disconnect() {
    if (_socket) {
      _socket.disconnect();
      _socket = null;
    }
    isSpectating.value = false;
    gameStatus.value = "idle";
    roomCode.value = null;
    _resetGame();
  }

  return {
    // Estado
    gameStatus,
    roomCode,
    currentQuestion,
    revealedCorrectIndex,
    scores,
    timerRemaining,
    timerTotal,
    finalRanking,
    lastExplanation,
    loading,
    error,
    isSpectating,
    // Acciones
    clearError,
    joinAsSpectator,
    disconnect,
  };
});
