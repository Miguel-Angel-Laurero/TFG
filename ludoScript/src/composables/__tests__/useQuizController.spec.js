import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";

// ─── Mocks de módulos importados a nivel de módulo por useQuizController ──────
// Son necesarios para que el módulo cargue en Node sin errores.
vi.mock("@/api/categoryStats.service", () => ({ categoryStatsService: {} }));
vi.mock("@/api/game.service", () => ({ gameService: {} }));
vi.mock("@/composables/useSessionTracker", () => ({
  getSessionSummary: vi.fn(),
}));
vi.mock("@/composables/useAdaptiveSelection", () => ({
  calculateWeakCategories: (stats) => stats,
}));
vi.mock("vue-router", () => ({ useRouter: vi.fn(() => ({ push: vi.fn() })) }));

import { useQuizController } from "@/composables/useQuizController";

describe("useQuizController", () => {
  // Dependencias inyectadas en cada test
  let currentItem, currentIndex, totalItems, isLastItem;
  let next, restart, trackAnswer;
  let submitSession, resetSession, grantQuizReward, rankLabelRef;
  let gameSvc, categorySvc, getSessionSummaryFn, calcWeakCategories, router;

  // Crea un controlador con el estado actual del test
  function makeCtrl() {
    return useQuizController({
      currentItem,
      currentIndex,
      totalItems,
      isLastItem,
      next,
      restart,
      trackAnswer,
      submitSession,
      resetSession,
      grantQuizReward,
      rankLabelRef,
      gameService: gameSvc,
      categoryStatsService: categorySvc,
      getSessionSummaryFn,
      calcWeakCategories,
      router,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks(); // limpia call history; respeta implementaciones

    currentItem = ref({ correct: 1, category: "math", id: 42, difficulty: 2 });
    currentIndex = ref(0);
    totalItems = ref(2);
    isLastItem = computed(() => currentIndex.value + 1 >= totalItems.value);

    // next simula avanzar el índice como lo haría useActivitySession
    next = vi.fn((onReset) => {
      onReset?.();
      currentIndex.value++;
    });
    restart = vi.fn((onReset) => {
      onReset?.();
      currentIndex.value = 0;
    });
    trackAnswer = vi.fn();

    submitSession = vi.fn().mockResolvedValue(undefined);
    resetSession = vi.fn();
    grantQuizReward = vi.fn().mockResolvedValue(undefined);
    rankLabelRef = ref("Aprobado");

    gameSvc = { createGame: vi.fn().mockResolvedValue(undefined) };
    categorySvc = { getAll: vi.fn().mockResolvedValue({ data: [] }) };
    getSessionSummaryFn = vi.fn().mockReturnValue({ elapsedMin: 5 });
    calcWeakCategories = vi.fn((stats) => stats);
    router = { push: vi.fn() };
  });

  // ─── selectAnswer ─────────────────────────────────────────────────────────
  describe("selectAnswer", () => {
    it("registra true cuando el índice coincide con correct", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1); // correct = 1

      expect(ctrl.results.value[0]).toBe(true);
      expect(ctrl.answered.value).toBe(true);
      expect(trackAnswer).toHaveBeenCalledWith("math", true, 42, 2);
    });

    it("registra false cuando el índice no coincide con correct", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(0); // correct = 1

      expect(ctrl.results.value[0]).toBe(false);
      expect(trackAnswer).toHaveBeenCalledWith("math", false, 42, 2);
    });

    it("ignora la segunda llamada si ya está respondida (answered = true)", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1); // correcta
      ctrl.selectAnswer(0); // debe ignorarse

      expect(ctrl.selectedAnswer.value).toBe(1); // no cambia
      expect(trackAnswer).toHaveBeenCalledTimes(1);
    });
  });

  // ─── score ────────────────────────────────────────────────────────────────
  describe("score", () => {
    it("aplica la fórmula: aciertos - errores / 3", () => {
      const ctrl = makeCtrl();
      ctrl.results.value = [true, true, false]; // 2 aciertos, 1 error → 2 - 1/3 ≈ 1.667
      expect(ctrl.score.value).toBeCloseTo(5 / 3);
    });

    it("nunca devuelve un valor negativo", () => {
      const ctrl = makeCtrl();
      ctrl.results.value = [false, false, false]; // 0 - 1 → negativo sin el max(0)
      expect(ctrl.score.value).toBe(0);
    });

    it("vale 0 cuando no se ha respondido nada", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(3);
      expect(ctrl.score.value).toBe(0);
    });
  });

  // ─── handleNext ───────────────────────────────────────────────────────────
  describe("handleNext", () => {
    it("avanza sin llamar a servicios cuando NO es el último ítem", async () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1); // índice 0, no es el último
      await ctrl.handleNext();

      expect(submitSession).not.toHaveBeenCalled();
      expect(gameSvc.createGame).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(ctrl.answered.value).toBe(false); // reseteado por el callback de next
    });

    it("llama a todos los servicios al finalizar el último ítem", async () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);

      // Responder y avanzar la primera pregunta
      ctrl.selectAnswer(1);
      await ctrl.handleNext(); // currentIndex pasa a 1

      // Responder y finalizar la última pregunta (isLastItem = true)
      ctrl.selectAnswer(0); // respuesta incorrecta
      await ctrl.handleNext();

      expect(submitSession).toHaveBeenCalledTimes(1);
      expect(grantQuizReward).toHaveBeenCalledTimes(1);
      expect(gameSvc.createGame).toHaveBeenCalledWith(
        expect.objectContaining({
          gameName: "Quiz",
          duration: 5,
          result: "aprobado", // rankLabelRef.value.toLowerCase()
        }),
      );
      expect(categorySvc.getAll).toHaveBeenCalledTimes(1);
    });

    it("no bloquea el flujo si createGame falla", async () => {
      gameSvc.createGame.mockRejectedValueOnce(new Error("timeout"));

      currentIndex.value = 1; // ya en el último ítem
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      // submitSession y grantQuizReward siguen llamándose aunque createGame falle
      expect(submitSession).toHaveBeenCalled();
      expect(next).toHaveBeenCalled(); // el flujo continúa
    });

    it("guarda weakCategoriesAfterQuiz con lo que devuelve categoryStatsService", async () => {
      const fakeStats = [
        { category: "algebra", errorRate: 0.8, correct: 1, total: 5 },
      ];
      categorySvc.getAll.mockResolvedValueOnce({ data: fakeStats });

      currentIndex.value = 1; // último ítem
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      // calculateWeakCategories está mockeado como (stats) => stats
      expect(ctrl.weakCategoriesAfterQuiz.value).toEqual(fakeStats);
    });

    it("calcula categorías débiles con umbral 5 al terminar el quiz", async () => {
      const fakeStats = [
        { category: "scope", correct: 1, total: 5 },
        { category: "arrays", correct: 4, total: 6 },
      ];
      const weakCategories = [{ category: "scope", errorRate: 0.8 }];
      categorySvc.getAll.mockResolvedValueOnce({ data: fakeStats });
      calcWeakCategories.mockReturnValueOnce(weakCategories);

      currentIndex.value = 1; // último ítem
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      expect(calcWeakCategories).toHaveBeenCalledWith(fakeStats, 5);
      expect(ctrl.weakCategoriesAfterQuiz.value).toEqual(weakCategories);
    });
  });

  // ─── handleRestart ────────────────────────────────────────────────────────
  describe("handleRestart", () => {
    it("llama a resetSession y restart, limpia el estado interno", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      ctrl.handleRestart();

      expect(resetSession).toHaveBeenCalledTimes(1);
      expect(restart).toHaveBeenCalledTimes(1);

      // El callback de restart reinicia results, selectedAnswer y answered
      expect(ctrl.selectedAnswer.value).toBeNull();
      expect(ctrl.answered.value).toBe(false);
      expect(ctrl.results.value).toEqual([null, null]);
      expect(ctrl.weakCategoriesAfterQuiz.value).toEqual([]);
    });
  });

  describe("goToAdaptiveQuizFromResults", () => {
    it("redirige al quiz adaptativo para generar nuevas preguntas", () => {
      const ctrl = makeCtrl();

      ctrl.goToAdaptiveQuizFromResults();

      expect(router.push).toHaveBeenCalledWith({
        path: "/in-game-view/",
        query: { game: "Quiz", adaptive: "true" },
      });
    });
  });
});
