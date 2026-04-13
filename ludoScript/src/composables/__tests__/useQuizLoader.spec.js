import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { apiGet, categoryStatsGet } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  categoryStatsGet: vi.fn(),
}));

vi.mock("@/api/axios", () => ({ default: { get: apiGet } }));
vi.mock("@/api/categoryStats.service", () => ({
  categoryStatsService: { getAll: categoryStatsGet },
}));

let mockStorage = {};
vi.mock("@/composables/useAdaptiveSelection", () => ({
  pickRandomIds: (questions, n) => questions.slice(0, n).map((q) => q.id),
  filterByIds: (questions, ids) => {
    const set = new Set(ids);
    return questions.filter((q) => set.has(q.id));
  },
  selectAdaptiveQuestions: (questions) => ({
    questions: questions.slice(0, 15),
    weakCategories: [{ category: "fundamentos-js", errorRate: 0.6 }],
  }),
  hasPdfInStorage: (id) => !!mockStorage[id],
  loadPdfQuestionsFromStorage: (id) => mockStorage[id] ?? null,
}));

import { useQuizLoader } from "@/composables/useQuizLoader";

const makeQuestions = (n, start = 1) =>
  Array.from({ length: n }, (_, i) => ({ id: i + start }));

describe("useQuizLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = {};
    categoryStatsGet.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("loadStaticMode", () => {
    it("carga hasta 15 preguntas del banco estatico", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(20) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadStaticMode();

      expect(loader.totalItems.value).toBe(15);
      expect(loader.currentItem.value).toBeDefined();
    });

    it("carga menos de 15 si el banco tiene menos preguntas", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(5) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadStaticMode();

      expect(loader.totalItems.value).toBe(5);
    });

    it("activa loadError y deja 0 preguntas si fetch falla", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadStaticMode();

      expect(loader.loadError.value).toBe(true);
      expect(loader.totalItems.value).toBe(0);
    });
  });

  describe("loadPdfLocalMode", () => {
    it("activa loadError si no hay datos en storage", async () => {
      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadPdfLocalMode("pdf-inexistente");

      expect(loader.loadError.value).toBe(true);
      expect(loader.totalItems.value).toBe(0);
    });

    it("carga solo las preguntas con IDs activos", async () => {
      const questions = makeQuestions(6);
      mockStorage = {
        pdf1: { questions, activeIds: [1, 2, 3], flashCards: [] },
      };

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadPdfLocalMode("pdf1");

      expect(loader.loadError.value).toBe(false);
      expect(loader.totalItems.value).toBe(3);
    });

    it("llama a setPdfSource con el id del PDF", async () => {
      const setPdfSource = vi.fn();
      mockStorage = {
        pdf1: {
          questions: makeQuestions(3),
          activeIds: [1, 2, 3],
          flashCards: [],
        },
      };

      const loader = useQuizLoader({
        jsonUrl: "/quizQuestions.json",
        setPdfSource,
      });
      await loader.loadPdfLocalMode("pdf1");

      expect(setPdfSource).toHaveBeenCalledWith("pdf1");
    });
  });

  describe("loadMixedMode", () => {
    it("combina hasta 10 del PDF con 5 del banco estatico", async () => {
      const pdfQuestions = makeQuestions(12, 100);
      mockStorage = {
        pdf1: {
          questions: pdfQuestions,
          activeIds: pdfQuestions.map((q) => q.id),
          flashCards: [],
        },
      };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(10) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadMixedMode("pdf1");

      expect(loader.totalItems.value).toBe(15);
    });

    it("usa solo las preguntas PDF si falla el fetch estatico", async () => {
      const pdfQuestions = makeQuestions(8, 100);
      mockStorage = {
        pdf1: {
          questions: pdfQuestions,
          activeIds: pdfQuestions.map((q) => q.id),
          flashCards: [],
        },
      };
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadMixedMode("pdf1");

      expect(loader.totalItems.value).toBe(8);
    });

    it("activa loadError si no hay storage del PDF", async () => {
      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadMixedMode("pdf-inexistente");

      expect(loader.loadError.value).toBe(true);
      expect(loader.totalItems.value).toBe(0);
    });
  });

  describe("loadAdaptiveMode", () => {
    it("carga hasta 15 preguntas del banco local y guarda categorias debiles", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(20, 200) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadAdaptiveMode();

      expect(loader.totalItems.value).toBe(15);
      expect(
        [...loader.items.value.map((q) => q.id)].sort((a, b) => a - b),
      ).toEqual(Array.from({ length: 15 }, (_, i) => i + 200));
      expect(loader.adaptiveWeakCategories.value).toEqual([
        { category: "fundamentos-js", errorRate: 0.6 },
      ]);
      expect(categoryStatsGet).toHaveBeenCalledTimes(1);
    });

    it("cae al modo estatico si falla la carga adaptativa", async () => {
      categoryStatsGet.mockRejectedValueOnce(new Error("auth"));
      vi.stubGlobal(
        "fetch",
        vi.fn()
          .mockResolvedValueOnce({ json: async () => makeQuestions(6, 20) })
          .mockResolvedValueOnce({ json: async () => makeQuestions(4) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadAdaptiveMode();

      expect(loader.totalItems.value).toBe(4);
      expect(loader.adaptiveWeakCategories.value).toEqual([]);
    });
  });

  describe("initFromRoute", () => {
    it("prioriza el modo adaptativo cuando route.query.adaptive es true", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(3, 300) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.initFromRoute({
        query: { adaptive: "true", pdfId: "pdf1", includePredefined: "true" },
      });

      expect(
        [...loader.items.value.map((q) => q.id)].sort((a, b) => a - b),
      ).toEqual([300, 301, 302]);
      expect(loader.adaptiveWeakCategories.value).toEqual([
        { category: "fundamentos-js", errorRate: 0.6 },
      ]);
      expect(loader.loadError.value).toBe(false);
    });
  });
});