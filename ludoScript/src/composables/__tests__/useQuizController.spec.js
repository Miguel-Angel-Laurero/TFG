import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";

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
  let currentItem;
  let currentIndex;
  let totalItems;
  let isLastItem;
  let next;
  let restart;
  let trackAnswer;
  let submitSession;
  let resetSession;
  let grantQuizReward;
  let rankLabelRef;
  let gameSvc;
  let categorySvc;
  let getSessionSummaryFn;
  let calcWeakCategories;
  let router;

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
    vi.clearAllMocks();

    currentItem = ref({
      correct: 1,
      category: "math",
      id: 42,
      difficulty: 2,
      topic: "closures",
    });
    currentIndex = ref(0);
    totalItems = ref(2);
    isLastItem = computed(() => currentIndex.value + 1 >= totalItems.value);

    next = vi.fn((onReset) => {
      onReset?.();
      currentIndex.value += 1;
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

  describe("selectAnswer", () => {
    it("registra true cuando el indice coincide con correct", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);

      expect(ctrl.results.value[0]).toBe(true);
      expect(ctrl.answered.value).toBe(true);
      expect(trackAnswer).toHaveBeenCalledWith(
        "math",
        true,
        42,
        2,
        "closures",
      );
    });

    it("registra false cuando el indice no coincide con correct", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(0);

      expect(ctrl.results.value[0]).toBe(false);
      expect(trackAnswer).toHaveBeenCalledWith(
        "math",
        false,
        42,
        2,
        "closures",
      );
    });

    it("ignora la segunda llamada si ya esta respondida", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      ctrl.selectAnswer(0);

      expect(ctrl.selectedAnswer.value).toBe(1);
      expect(trackAnswer).toHaveBeenCalledTimes(1);
    });
  });

  describe("score", () => {
    it("aplica la formula de puntuacion", () => {
      const ctrl = makeCtrl();
      ctrl.results.value = [true, true, false];
      expect(ctrl.score.value).toBeCloseTo(5 / 3);
    });

    it("nunca devuelve un valor negativo", () => {
      const ctrl = makeCtrl();
      ctrl.results.value = [false, false, false];
      expect(ctrl.score.value).toBe(0);
    });

    it("vale 0 cuando no se ha respondido nada", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(3);
      expect(ctrl.score.value).toBe(0);
    });
  });

  describe("handleNext", () => {
    it("avanza sin llamar a servicios cuando no es el ultimo item", async () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      expect(submitSession).not.toHaveBeenCalled();
      expect(gameSvc.createGame).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(ctrl.answered.value).toBe(false);
    });

    it("llama a los servicios al finalizar el ultimo item", async () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);

      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      ctrl.selectAnswer(0);
      await ctrl.handleNext();

      expect(submitSession).toHaveBeenCalledTimes(1);
      expect(grantQuizReward).toHaveBeenCalledTimes(1);
      expect(gameSvc.createGame).toHaveBeenCalledWith(
        expect.objectContaining({
          gameName: "Quiz",
          duration: 5,
          result: "aprobado",
        }),
      );
      expect(categorySvc.getAll).toHaveBeenCalledTimes(1);
    });

    it("no bloquea el flujo si createGame falla", async () => {
      gameSvc.createGame.mockRejectedValueOnce(new Error("timeout"));

      currentIndex.value = 1;
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      expect(submitSession).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it("guarda weakCategoriesAfterQuiz con lo que devuelve categoryStatsService", async () => {
      const fakeStats = [
        { category: "algebra", errorRate: 0.8, correct: 1, total: 5 },
      ];
      categorySvc.getAll.mockResolvedValueOnce({ data: fakeStats });

      currentIndex.value = 1;
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      expect(ctrl.weakCategoriesAfterQuiz.value).toEqual(fakeStats);
    });

    it("calcula categorias debiles con umbral 5 al terminar el quiz", async () => {
      const fakeStats = [
        { category: "scope", correct: 1, total: 5 },
        { category: "arrays", correct: 4, total: 6 },
      ];
      const weakCategories = [{ category: "scope", errorRate: 0.8 }];
      categorySvc.getAll.mockResolvedValueOnce({ data: fakeStats });
      calcWeakCategories.mockReturnValueOnce(weakCategories);

      currentIndex.value = 1;
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      await ctrl.handleNext();

      expect(calcWeakCategories).toHaveBeenCalledWith(fakeStats, 5);
      expect(ctrl.weakCategoriesAfterQuiz.value).toEqual(weakCategories);
    });
  });

  describe("handleRestart", () => {
    it("llama a resetSession y restart, limpia el estado interno", () => {
      const ctrl = makeCtrl();
      ctrl.initResults(2);
      ctrl.selectAnswer(1);
      ctrl.handleRestart();

      expect(resetSession).toHaveBeenCalledTimes(1);
      expect(restart).toHaveBeenCalledTimes(1);
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