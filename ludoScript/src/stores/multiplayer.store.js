import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { socketService } from "@/api/socket.service";

/**
 * Store Pinia para la sala multijugador.
 * Toda la lógica de mutación de estado viene impulsada por eventos de socket;
 * los componentes solo leen estado y emiten acciones.
 */
export const useMultiplayerStore = defineStore("multiplayer", () => {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const roomCode = ref(null);
  const isHost = ref(false);
  const players = ref([]); // [{ userId, username, score, isHost }]
  const settings = ref({ questionCount: 10, timePerQuestion: 20 });

  /** 'idle' | 'lobby' | 'playing' | 'finished' | 'closed' */
  const status = ref("idle");

  const currentQuestion = ref(null);
  // { questionIndex, totalQuestions, question, options, category, difficulty, timeLimit }

  const timerRemaining = ref(0);
  const timerTotal = ref(20);

  /** null | { correct: bool, correctIndex, pointsEarned, totalScore } */
  const lastAnswerResult = ref(null);

  /** null | { questionIndex, correctIndex, explanation, scores[] } */
  const lastQuestionEnd = ref(null);

  /** Array de { userId, username, score, isHost } ordenado por score */
  const finalRanking = ref([]);

  const error = ref(null);
  const myScore = ref(0);

  // ── Getters ──────────────────────────────────────────────────────────────────
  const isConnected = computed(() => !!roomCode.value);
  const hasAnswered = computed(() => !!lastAnswerResult.value);

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * Conecta el socket y registra todos los listeners de la sala.
   */
  function connectSocket() {
    const socket = socketService.connect();
    _registerListeners(socket);
    return socket;
  }

  /**
   * Emite room:create al servidor.
   */
  function createRoom(options = {}) {
    const socket = socketService.getSocket() ?? socketService.connect();
    _registerListeners(socket);
    error.value = null;
    socket.emit("room:create", options);
  }

  /**
   * Emite room:join al servidor.
   */
  function joinRoom(code) {
    const socket = socketService.getSocket() ?? socketService.connect();
    _registerListeners(socket);
    error.value = null;
    socket.emit("room:join", { code });
  }

  /**
   * Host inicia la partida.
   */
  function startGame() {
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.emit("game:start");
  }

  /**
   * Envía la respuesta del jugador.
   */
  function sendAnswer(answerIndex) {
    if (!currentQuestion.value || lastAnswerResult.value) return; // ya respondió
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.emit("game:answer", {
      questionIndex: currentQuestion.value.questionIndex,
      answerIndex,
    });
  }

  /**
   * Abandona la sala y desconecta el socket.
   */
  function leaveRoom() {
    const socket = socketService.getSocket();
    if (socket) socket.emit("room:leave");
    socketService.disconnect();
    resetState();
  }

  // ── Eventos entrantes ────────────────────────────────────────────────────────
  let _listenersRegistered = false;

  function _registerListeners(socket) {
    if (_listenersRegistered) return;
    _listenersRegistered = true;

    socket.on("room:created", (data) => {
      roomCode.value = data.code;
      isHost.value = true;
      players.value = data.players;
      settings.value = data.settings;
      status.value = "lobby";
    });

    socket.on("room:joined", (data) => {
      roomCode.value = data.code;
      isHost.value = data.isHost;
      players.value = data.players;
      settings.value = data.settings;
      status.value = "lobby";
    });

    socket.on("room:players-updated", (data) => {
      players.value = data.players;
    });

    socket.on("room:error", (data) => {
      error.value = data.message;
    });

    socket.on("room:closed", (data) => {
      error.value = data.message;
      status.value = "closed";
      socketService.disconnect();
      _listenersRegistered = false;
    });

    socket.on("game:started", (data) => {
      status.value = "playing";
      settings.value = { ...settings.value, ...data.settings };
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
      players.value = data.scores; // scores es getPlayersPublic
    });

    socket.on("game:finished", (data) => {
      status.value = "finished";
      finalRanking.value = data.ranking;
    });

    socket.on("game:player-disconnected", (data) => {
      // El store ya actualiza players via room:players-updated;
      // esto es solo para que los componentes puedan mostrar un aviso
    });

    socket.on("disconnect", () => {
      if (status.value !== "finished" && status.value !== "closed") {
        error.value = "Conexión perdida con el servidor";
      }
      _listenersRegistered = false;
    });
  }

  function resetState() {
    roomCode.value = null;
    isHost.value = false;
    players.value = [];
    status.value = "idle";
    currentQuestion.value = null;
    timerRemaining.value = 0;
    lastAnswerResult.value = null;
    lastQuestionEnd.value = null;
    finalRanking.value = [];
    error.value = null;
    myScore.value = 0;
    _listenersRegistered = false;
  }

  return {
    // state
    roomCode,
    isHost,
    players,
    settings,
    status,
    currentQuestion,
    timerRemaining,
    timerTotal,
    lastAnswerResult,
    lastQuestionEnd,
    finalRanking,
    error,
    myScore,
    // getters
    isConnected,
    hasAnswered,
    // actions
    connectSocket,
    createRoom,
    joinRoom,
    startGame,
    sendAnswer,
    leaveRoom,
    resetState,
  };
});
