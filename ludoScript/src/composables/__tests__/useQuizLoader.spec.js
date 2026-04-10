import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// vi.hoisted eleva esta declaración al mismo nivel que vi.mock,
// evitando el error de "Cannot access before initialization".
const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));

// ─── Mock: axios (usado por useActivitySession y loadAdaptiveMode) ─────────────
vi.mock("@/api/axios", () => ({ default: { get: apiGet } }));

// ─── Mock: useAdaptiveSelection ───────────────────────────────────────────────
// Funciones puras sin aleatoriedad para resultados deterministas en los tests.
let mockStorage = {};
vi.mock("@/composables/useAdaptiveSelection", () => ({
  pickRandomIds: (questions, n) => questions.slice(0, n).map((q) => q.id),
  filterByIds: (questions, ids) => {
    const set = new Set(ids);
    return questions.filter((q) => set.has(q.id));
  },
  hasPdfInStorage: (id) => !!mockStorage[id],
  loadPdfQuestionsFromStorage: (id) => mockStorage[id] ?? null,
}));

import { useQuizLoader } from "@/composables/useQuizLoader";

// Helper: array de N preguntas con IDs secuenciales desde `start`
const makeQuestions = (n, start = 1) =>
  Array.from({ length: n }, (_, i) => ({ id: i + start }));

describe("useQuizLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // limpia call history pero respeta implementaciones
    mockStorage = {};
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // restaura fetch nativo tras cada test
  });

  // ─── loadStaticMode ─────────────────────────────────────────────────────────
  describe("loadStaticMode", () => {
    it("carga hasta 15 preguntas del banco estático", async () => {
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

  // ─── loadPdfLocalMode ────────────────────────────────────────────────────────
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

  // ─── loadMixedMode ───────────────────────────────────────────────────────────
  describe("loadMixedMode", () => {
    it("combina hasta 10 del PDF con 5 del banco estático (total 15)", async () => {
      // 12 preguntas PDF con IDs 100-111
      const pdfQuestions = makeQuestions(12, 100);
      mockStorage = {
        pdf1: {
          questions: pdfQuestions,
          activeIds: pdfQuestions.map((q) => q.id),
          flashCards: [],
        },
      };
      // 10 preguntas estáticas con IDs 1-10
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(10) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadMixedMode("pdf1");

      expect(loader.totalItems.value).toBe(15); // 10 pdf + 5 static
    });

    it("usa solo las preguntas PDF si falla el fetch estático", async () => {
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

  // ─── loadAdaptiveMode ────────────────────────────────────────────────────────
  describe("loadAdaptiveMode", () => {
    it("carga como máximo 15 preguntas de la API y guarda categorías débiles", async () => {
      const questions = makeQuestions(20, 200);
      apiGet.mockResolvedValueOnce({
        status: 200,
        data: {
          questions,
          weakCategories: [{ category: "algebra", errorRate: 0.6 }],
        },
      });

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadAdaptiveMode();

      expect(loader.totalItems.value).toBe(15);
      expect([...loader.items.value.map((q) => q.id)].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 15 }, (_, i) => i + 200),
      );
      expect(loader.adaptiveWeakCategories.value).toHaveLength(1);
      expect(loader.adaptiveWeakCategories.value[0].category).toBe("algebra");
    });

    it("cae al modo estático si la API responde 204", async () => {
      apiGet.mockResolvedValueOnce({ status: 204, data: {} });
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(5) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadAdaptiveMode();

      expect(loader.totalItems.value).toBe(5);
    });

    it("cae al modo estático si la API responde sin preguntas", async () => {
      apiGet.mockResolvedValueOnce({
        status: 200,
        data: { questions: [], weakCategories: [{ category: "scope" }] },
      });
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(4) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadAdaptiveMode();

      expect(loader.totalItems.value).toBe(4);
      expect(loader.adaptiveWeakCategories.value).toEqual([]);
    });

    it("cae al modo estático si la API lanza un error de red", async () => {
      apiGet.mockRejectedValueOnce(new Error("network"));
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ json: async () => makeQuestions(5) }),
      );

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.loadAdaptiveMode();

      expect(loader.totalItems.value).toBe(5);
    });
  });

  describe("initFromRoute", () => {
    it("prioriza el modo adaptativo cuando route.query.adaptive es true", async () => {
      apiGet.mockResolvedValueOnce({
        status: 200,
        data: {
          questions: makeQuestions(3, 300),
          weakCategories: [{ category: "arrays", errorRate: 0.7 }],
        },
      });

      const loader = useQuizLoader({ jsonUrl: "/quizQuestions.json" });
      await loader.initFromRoute({
        query: { adaptive: "true", pdfId: "pdf1", includePredefined: "true" },
      });

      expect([...loader.items.value.map((q) => q.id)].sort((a, b) => a - b)).toEqual([
        300, 301, 302,
      ]);
      expect(loader.adaptiveWeakCategories.value).toEqual([
        { category: "arrays", errorRate: 0.7 },
      ]);
      expect(loader.loadError.value).toBe(false);
    });
  });
});
