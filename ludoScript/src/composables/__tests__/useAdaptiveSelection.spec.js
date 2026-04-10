import { beforeEach, describe, expect, it } from "vitest";
import {
  calculateWeakCategories,
  hasPdfInStorage,
  loadPdfQuestionsFromStorage,
  savePdfQuestionsToStorage,
} from "@/composables/useAdaptiveSelection";

const makeQuestions = (n, start = 1) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + start,
    question: `Pregunta ${i + start}`,
  }));

describe("useAdaptiveSelection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("calculateWeakCategories", () => {
    it("filtra categorías con pocos intentos y ordena de más débil a más fuerte", () => {
      const stats = [
        { category: "arrays", correct: 2, total: 5 },
        { category: "scope", correct: 1, total: 5 },
        { category: "loops", correct: 3, total: 4 },
        { category: "async", correct: 7, total: 10 },
      ];

      expect(calculateWeakCategories(stats, 5)).toEqual([
        { category: "scope", errorRate: 0.8, correct: 1, total: 5 },
        { category: "arrays", errorRate: 0.6, correct: 2, total: 5 },
        { category: "async", errorRate: 0.3, correct: 7, total: 10 },
      ]);
    });
  });

  describe("savePdfQuestionsToStorage", () => {
    it("genera IDs activos sin repetir y los persiste para futuras tandas", () => {
      const questions = makeQuestions(20, 100);
      const flashCards = [{ id: "fc-1" }];

      const activeIds = savePdfQuestionsToStorage("pdf-1", questions, flashCards);
      const stored = loadPdfQuestionsFromStorage("pdf-1");

      expect(activeIds).toHaveLength(15);
      expect(new Set(activeIds).size).toBe(activeIds.length);
      expect(activeIds.every((id) => questions.some((q) => q.id === id))).toBe(
        true,
      );
      expect(hasPdfInStorage("pdf-1")).toBe(true);
      expect(stored).toEqual({
        questions,
        flashCards,
        activeIds,
      });
    });

    it("si hay menos de 15 preguntas, activa todas las disponibles", () => {
      const questions = makeQuestions(6);

      const activeIds = savePdfQuestionsToStorage("pdf-2", questions, []);

      expect(activeIds).toHaveLength(6);
      expect(new Set(activeIds)).toEqual(new Set(questions.map((q) => q.id)));
    });
  });
});
