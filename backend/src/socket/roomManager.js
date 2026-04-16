const path = require("path");
const fs = require("fs");
const Game = require("../models/Game.model");

// ── Preguntas: cargadas una sola vez al arrancar el servidor ────────────────
const QUESTIONS_PATH = path.join(
  __dirname,
  "../../../ludoScript/public/quizQuestions.json",
);
let ALL_QUESTIONS = [];
try {
  ALL_QUESTIONS = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));
  console.log(`✅ roomManager: ${ALL_QUESTIONS.length} preguntas cargadas`);
} catch (err) {
  console.error(
    "❌ roomManager: no se pudo cargar quizQuestions.json",
    err.message,
  );
}

// ── Constantes ──────────────────────────────────────────────────────────────
const ROOM_CODE_LENGTH = 6;
const ROOM_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 min
const POINTS_BASE = 1000;
const POINTS_MIN_CORRECT = 100;
const POINTS_DECAY_PER_SECOND = 40;

// ── Almacén en memoria ──────────────────────────────────────────────────────
/** @type {Map<string, Room>} */
const rooms = new Map();

/**
 * @typedef {Object} Player
 * @property {string} socketId
 * @property {string} username
 * @property {number} score
 * @property {boolean} answeredThisQuestion
 * @property {number|null} answerTime  — timestamp (ms) en que respondió
 */

/**
 * @typedef {Object} Room
 * @property {string}  code
 * @property {number}  hostId
 * @property {Map<number, Player>} players    — key: userId
 * @property {'lobby'|'playing'|'finished'} status
 * @property {number}  currentQuestionIndex
 * @property {Array}   questions              — subconjunto aleatorio
 * @property {NodeJS.Timeout|null} questionTimer
 * @property {NodeJS.Timeout|null} idleTimer
 * @property {number}  questionStartTime      — Date.now() cuando empezó la pregunta
 * @property {{ questionCount: number, timePerQuestion: number }} settings
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O,0,I,1 para evitar confusión
  let code;
  do {
    code = Array.from(
      { length: ROOM_CODE_LENGTH },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  } while (rooms.has(code));
  return code;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scheduleIdleCleanup(room, io) {
  if (room.idleTimer) clearTimeout(room.idleTimer);
  room.idleTimer = setTimeout(() => {
    console.log(`⏱️  Auto-limpieza sala idle: ${room.code}`);
    destroyRoom(room.code, io);
  }, ROOM_IDLE_TIMEOUT_MS);
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Crea una sala nueva. El creador es el host y primer jugador.
 */
function createRoom(hostId, username, socketId, settings) {
  const code = generateCode();
  const room = {
    code,
    hostId,
    players: new Map([
      [
        hostId,
        {
          socketId,
          username,
          score: 0,
          answeredThisQuestion: false,
          answerTime: null,
        },
      ],
    ]),
    status: "lobby",
    currentQuestionIndex: -1,
    questions: [],
    questionTimer: null,
    tickInterval: null,
    idleTimer: null,
    questionStartTime: 0,
    settings: {
      questionCount: settings?.questionCount ?? 10,
      timePerQuestion: settings?.timePerQuestion ?? 20,
    },
  };
  rooms.set(code, room);
  scheduleIdleCleanup(room, null); // io no disponible aún en create
  return room;
}

/**
 * Crea una sala de duelo 1v1 entre dos miembros de un grupo.
 * Los jugadores se unen por invitación; no hay host jugador.
 */
function createDuelRoom(inviterId, p1Id, p2Id, settings) {
  const code = generateCode();
  const room = {
    code,
    hostId: null,
    inviterId,
    type: "duel",
    allowedPlayerIds: new Set([p1Id, p2Id]),
    players: new Map(),
    status: "lobby",
    currentQuestionIndex: -1,
    questions: [],
    questionTimer: null,
    tickInterval: null,
    idleTimer: null,
    questionStartTime: 0,
    _inviteTimeout: null,
    settings: {
      questionCount: Math.min(Math.max(settings?.questionCount ?? 10, 3), 20),
      timePerQuestion: 20,
      category: settings?.category ?? null,
    },
  };
  rooms.set(code, room);
  scheduleIdleCleanup(room, null);
  return room;
}

/**
 * Une a un jugador a una sala de duelo. Valida allowedPlayerIds.
 * @returns {{ ok: true, room: Room } | { ok: false, error: string }}
 */
function joinDuelRoom(code, userId, username, socketId) {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "Duelo no encontrado" };
  if (room.type !== "duel") return { ok: false, error: "Código no válido" };
  if (room.status !== "lobby")
    return { ok: false, error: "El duelo ya ha comenzado" };
  if (!room.allowedPlayerIds.has(userId))
    return { ok: false, error: "No estás invitado a este duelo" };
  if (room.players.size >= 2)
    return { ok: false, error: "El duelo ya está completo" };

  room.players.set(userId, {
    socketId,
    username,
    score: 0,
    answeredThisQuestion: false,
    answerTime: null,
  });

  if (room.idleTimer) clearTimeout(room.idleTimer);
  return { ok: true, room };
}

/**
 * Une a un jugador a una sala existente.
 * @returns {{ ok: true, room: Room } | { ok: false, error: string }}
 */
function joinRoom(code, userId, username, socketId) {
  const room = rooms.get(code);
  if (!room) return { ok: false, error: "Sala no encontrada" };
  if (room.status !== "lobby")
    return { ok: false, error: "La partida ya ha comenzado" };
  if (room.players.size >= 10)
    return { ok: false, error: "La sala está llena (máx. 10)" };

  // Si el jugador ya estaba (reconexión), actualizar socketId
  if (room.players.has(userId)) {
    room.players.get(userId).socketId = socketId;
  } else {
    room.players.set(userId, {
      socketId,
      username,
      score: 0,
      answeredThisQuestion: false,
      answerTime: null,
    });
  }

  // Reiniciar idle timer porque hay actividad
  if (room.idleTimer) clearTimeout(room.idleTimer);

  return { ok: true, room };
}

/**
 * Elimina a un jugador de una sala (no destruye la sala).
 */
function leaveRoom(code, userId) {
  const room = rooms.get(code);
  if (room) room.players.delete(userId);
}

/**
 * Busca y abandona TODAS las salas donde esté el usuario (hosts incluidos).
 * Usado antes de crear una nueva sala.
 */
function leaveAllRooms(userId, socket, io) {
  for (const [code, room] of rooms) {
    if (room.players.has(userId)) {
      if (room.hostId === userId) {
        io?.to(code).emit("room:closed", {
          message: "El host abrió una nueva sala",
        });
        destroyRoom(code, io);
      } else {
        room.players.delete(userId);
        socket.leave(code);
      }
    }
  }
}

function getRoom(code) {
  return rooms.get(code) ?? null;
}

function getRoomByHost(userId) {
  for (const room of rooms.values()) {
    if (room.hostId === userId) return room;
  }
  return null;
}

function getRoomByPlayer(userId) {
  for (const room of rooms.values()) {
    if (room.players.has(userId)) return room;
  }
  return null;
}

/**
 * Devuelve array serializable de jugadores (sin datos internos).
 */
function getPlayersPublic(room) {
  return [...room.players.entries()].map(([userId, p]) => ({
    userId,
    username: p.username,
    score: p.score,
    isHost: userId === room.hostId,
  }));
}

/**
 * Destruye la sala: limpia timers y elimina del Map.
 */
function destroyRoom(code, io) {
  const room = rooms.get(code);
  if (!room) return;
  if (room.tickInterval) clearInterval(room.tickInterval);
  if (room.questionTimer) clearTimeout(room.questionTimer);
  if (room.idleTimer) clearTimeout(room.idleTimer);
  rooms.delete(code);
}

// ── Game loop ────────────────────────────────────────────────────────────────

/**
 * Inicia la partida: selecciona preguntas aleatorias y lanza el loop.
 */
function startGame(room, io) {
  if (ALL_QUESTIONS.length === 0) {
    io.to(room.code).emit("room:error", {
      message: "No hay preguntas disponibles en el servidor",
    });
    return;
  }

  const pool = room.settings.category
    ? ALL_QUESTIONS.filter((q) => q.category === room.settings.category)
    : ALL_QUESTIONS;

  if (pool.length === 0) {
    io.to(room.code).emit("room:error", {
      message: `No hay preguntas para la categoría "${room.settings.category}"`,
    });
    return;
  }

  room.status = "playing";
  const count = Math.min(room.settings.questionCount, pool.length);
  room.questions = shuffleArray(pool).slice(0, count);
  room.currentQuestionIndex = -1;

  io.to(room.code).emit("game:started", {
    totalQuestions: room.questions.length,
    settings: room.settings,
  });

  // Pequeño delay antes del primer pregunta para dar tiempo al cliente
  setTimeout(() => {
    advanceQuestion(room, io);
  }, 1500);
}

/**
 * Envía la siguiente pregunta o finaliza el juego.
 */
function advanceQuestion(room, io) {
  room.currentQuestionIndex += 1;

  if (room.currentQuestionIndex >= room.questions.length) {
    return endGame(room, io);
  }

  // Resetear estado de respuestas para esta pregunta
  for (const player of room.players.values()) {
    player.answeredThisQuestion = false;
    player.answerTime = null;
  }

  const q = room.questions[room.currentQuestionIndex];
  room.questionStartTime = Date.now();

  // Enviar pregunta SIN el índice correcto
  io.to(room.code).emit("game:question", {
    questionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    question: q.question,
    options: q.options,
    category: q.category,
    difficulty: q.difficulty,
    timeLimit: room.settings.timePerQuestion,
  });

  // Emitir ticks del timer cada segundo
  // Se guarda en room para poder cancelarlo si todos responden antes de tiempo
  if (room.tickInterval) clearInterval(room.tickInterval);
  let remaining = room.settings.timePerQuestion;
  room.tickInterval = setInterval(() => {
    remaining -= 1;
    io.to(room.code).emit("game:timer", {
      remaining,
      total: room.settings.timePerQuestion,
    });
    if (remaining <= 0) {
      clearInterval(room.tickInterval);
      room.tickInterval = null;
    }
  }, 1000);

  // Timer de fin de pregunta
  if (room.questionTimer) clearTimeout(room.questionTimer);
  room.questionTimer = setTimeout(() => {
    revealQuestion(room, io);
  }, room.settings.timePerQuestion * 1000);
}

/**
 * Revela la respuesta correcta y actualiza puntuaciones al acabar el tiempo
 * (o cuando todos han respondido → llamado también desde submitAnswer).
 */
function revealQuestion(room, io) {
  // Limpiar AMBOS timers para evitar el bug de doble contador
  if (room.tickInterval) {
    clearInterval(room.tickInterval);
    room.tickInterval = null;
  }
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  const q = room.questions[room.currentQuestionIndex];

  io.to(room.code).emit("game:question-end", {
    questionIndex: room.currentQuestionIndex,
    correctIndex: q.correct,
    explanation: q.explanation,
    scores: getPlayersPublic(room),
  });

  // Pausa entre pregunta y la siguiente
  setTimeout(() => {
    advanceQuestion(room, io);
  }, 2500);
}

/**
 * Procesa la respuesta de un jugador.
 */
function submitAnswer(room, userId, questionIndex, answerIndex, io) {
  // Validaciones de integridad
  if (questionIndex !== room.currentQuestionIndex) return;
  const player = room.players.get(userId);
  if (!player || player.answeredThisQuestion) return;

  player.answeredThisQuestion = true;
  player.answerTime = Date.now();

  const q = room.questions[room.currentQuestionIndex];
  const isCorrect = answerIndex === q.correct;

  let pointsEarned = 0;
  if (isCorrect) {
    const elapsed = (player.answerTime - room.questionStartTime) / 1000; // segundos
    pointsEarned = Math.max(
      POINTS_MIN_CORRECT,
      POINTS_BASE - Math.floor(elapsed * POINTS_DECAY_PER_SECOND),
    );
    player.score += pointsEarned;
  }

  // Feedback al jugador que respondió
  const playerSocket = io.sockets.sockets.get(player.socketId);
  if (playerSocket) {
    playerSocket.emit("game:answer-result", {
      correct: isCorrect,
      correctIndex: q.correct,
      pointsEarned,
      totalScore: player.score,
    });
  }

  // Si todos han respondido, revelar inmediatamente
  const allAnswered = [...room.players.values()].every(
    (p) => p.answeredThisQuestion,
  );
  if (allAnswered) {
    revealQuestion(room, io);
  }
}

/**
 * Finaliza la partida y emite el ranking final.
 */
function endGame(room, io) {
  room.status = "finished";

  const ranking = getPlayersPublic(room).sort((a, b) => b.score - a.score);

  io.to(room.code).emit("game:finished", { ranking });

  // Guardar resultados en BD de forma asíncrona (no bloquear el socket)
  _saveResults(room, ranking).catch((err) =>
    console.error(
      `❌ Error guardando resultados sala ${room.code}:`,
      err.message,
    ),
  );

  // Auto-destruir sala 60 segundos después de que termine
  setTimeout(() => {
    destroyRoom(room.code, io);
  }, 60_000);
}

/**
 * Guarda un registro en Game por cada jugador con su puntuación.
 */
async function _saveResults(room, ranking) {
  if (ranking.length === 0) return;

  const topScore = ranking[0].score;
  const duration = room.currentQuestionIndex * room.settings.timePerQuestion;

  const records = ranking.map((player, index) => {
    let result;
    if (index === 0) {
      result = "win";
    } else if (player.score === topScore) {
      result = "draw";
    } else {
      result = "loss";
    }

    return {
      userId: player.userId,
      gameName: "multiplayer-quiz",
      score: player.score,
      duration,
      result,
    };
  });

  await Game.bulkCreate(records);
  console.log(
    `💾 Resultados guardados para sala ${room.code} (${records.length} jugadores)`,
  );
}

/**
 * Devuelve el estado público de una sala para espectadores.
 * No incluye el índice correcto de la pregunta en curso.
 */
function getPublicState(room) {
  const q =
    room.status === "playing" &&
    room.currentQuestionIndex >= 0 &&
    room.questions[room.currentQuestionIndex];

  return {
    status: room.status,
    settings: room.settings,
    currentQuestionIndex: room.currentQuestionIndex,
    players: getPlayersPublic(room),
    currentQuestion: q
      ? {
          questionIndex: room.currentQuestionIndex,
          totalQuestions: room.questions.length,
          question: q.question,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty,
          timeLimit: room.settings.timePerQuestion,
        }
      : null,
  };
}

module.exports = {
  createRoom,
  createDuelRoom,
  joinRoom,
  joinDuelRoom,
  leaveRoom,
  leaveAllRooms,
  getRoom,
  getRoomByHost,
  getRoomByPlayer,
  getPlayersPublic,
  getPublicState,
  destroyRoom,
  startGame,
  submitAnswer,
};
