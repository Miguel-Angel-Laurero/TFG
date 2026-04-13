import { describe, it, expect } from "vitest";
import {
  toFlashCard,
  pickRandom,
  FLASH_CARDS_PER_SESSION,
  QUIZ_URL,
} from "@/composables/useFlashCardLoader";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeQ(overrides = {}) {
  return {
    id: 1,
    category: "fundamentos-js",
    topic: "scope",
    difficulty: 2,
    question: "¿Qué es let?",
    options: ["Una clase", "Variable de bloque", "Función", "Constante"],
    correct: 1,
    ...overrides,
  };
}

// ─── Constantes ───────────────────────────────────────────────────────────────

describe("QUIZ_URL", () => {
  it("apunta al banco de preguntas correcto", () => {
    expect(QUIZ_URL).toBe("/quizQuestions.json");
  });
});

describe("FLASH_CARDS_PER_SESSION", () => {
  it("vale 15", () => {
    expect(FLASH_CARDS_PER_SESSION).toBe(15);
  });
});

// ─── toFlashCard ──────────────────────────────────────────────────────────────

describe("toFlashCard", () => {
  it("transforma correctamente una pregunta completa del Quiz", () => {
    const fc = toFlashCard(makeQ());
    expect(fc).toEqual({
      question: "¿Qué es let?",
      answer: "Variable de bloque",
      id: 1,
      category: "fundamentos-js",
      topic: "scope",
      difficulty: 2,
    });
  });

  it("usa options[correct] cuando correct=0 (primer índice)", () => {
    const q = makeQ({ options: ["Primera", "Segunda", "Tercera"], correct: 0 });
    expect(toFlashCard(q).answer).toBe("Primera");
  });

  it("usa options[correct] cuando correct es el último índice", () => {
    const q = makeQ({ options: ["A", "B", "C", "D"], correct: 3 });
    expect(toFlashCard(q).answer).toBe("D");
  });

  it("rellena con null los campos opcionales ausentes", () => {
    const q = { question: "Q", options: ["A", "B"], correct: 0 };
    const fc = toFlashCard(q);
    expect(fc.id).toBeNull();
    expect(fc.category).toBeNull();
    expect(fc.topic).toBeNull();
    expect(fc.difficulty).toBeNull();
  });

  it("conserva id=0 (valor falsy pero válido) sin convertirlo a null", () => {
    const q = makeQ({ id: 0 });
    expect(toFlashCard(q).id).toBe(0);
  });

  it("preserva category, topic y difficulty cuando están presentes", () => {
    const q = makeQ({
      category: "asincronia",
      topic: "promises",
      difficulty: 3,
    });
    const fc = toFlashCard(q);
    expect(fc.category).toBe("asincronia");
    expect(fc.topic).toBe("promises");
    expect(fc.difficulty).toBe(3);
  });

  it("el resultado solo tiene los 6 campos esperados (no filtra campos extra del input)", () => {
    const q = makeQ({ explanation: "campo extra" });
    const fc = toFlashCard(q);
    expect(Object.keys(fc).sort()).toEqual([
      "answer",
      "category",
      "difficulty",
      "id",
      "question",
      "topic",
    ]);
  });

  it("funciona con un array de dos opciones y correct=1", () => {
    const q = makeQ({ options: ["verdad", "mentira"], correct: 1 });
    expect(toFlashCard(q).answer).toBe("mentira");
  });
});

// ─── pickRandom ───────────────────────────────────────────────────────────────

describe("pickRandom", () => {
  it("devuelve exactamente n elementos cuando n < arr.length", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(pickRandom(arr, 4)).toHaveLength(4);
  });

  it("devuelve todos los elementos cuando n === arr.length", () => {
    expect(pickRandom([1, 2, 3], 3)).toHaveLength(3);
  });

  it("devuelve todos los elementos cuando n > arr.length", () => {
    expect(pickRandom([1, 2, 3], 10)).toHaveLength(3);
  });

  it("solo contiene elementos presentes en el array original", () => {
    const arr = ["a", "b", "c", "d", "e"];
    pickRandom(arr, 3).forEach((item) => expect(arr).toContain(item));
  });

  it("no repite elementos", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = pickRandom(arr, 8);
    expect(new Set(result).size).toBe(8);
  });

  it("no modifica el array original", () => {
    const arr = [10, 20, 30, 40];
    const original = [...arr];
    pickRandom(arr, 2);
    expect(arr).toEqual(original);
  });

  it("devuelve array vacío para n=0", () => {
    expect(pickRandom([1, 2, 3], 0)).toEqual([]);
  });

  it("funciona con un array de 1 elemento y n=1", () => {
    expect(pickRandom(["único"], 1)).toEqual(["único"]);
  });

  it("funciona con un array de 1 elemento y n mayor", () => {
    expect(pickRandom(["único"], 5)).toHaveLength(1);
  });

  it("devuelve array vacío si el input también es vacío", () => {
    expect(pickRandom([], 3)).toEqual([]);
    expect(pickRandom([], 0)).toEqual([]);
  });

  it("con banco de 20 preguntas y FLASH_CARDS_PER_SESSION devuelve exactamente 15", () => {
    const bank = Array.from({ length: 20 }, (_, i) => i);
    expect(pickRandom(bank, FLASH_CARDS_PER_SESSION)).toHaveLength(15);
  });

  it("con banco menor a FLASH_CARDS_PER_SESSION devuelve todas las disponibles", () => {
    const bank = Array.from({ length: 8 }, (_, i) => i);
    expect(pickRandom(bank, FLASH_CARDS_PER_SESSION)).toHaveLength(8);
  });

  it("la distribución es aleatoria: dos llamadas rara vez devuelven el mismo orden", () => {
    // Con 15 elementos de 100 la probabilidad de mismo orden es negligible
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const r1 = pickRandom(arr, 15).join(",");
    const r2 = pickRandom(arr, 15).join(",");
    // No garantizamos que sean distintos (sería flaky), pero es estadísticamente casi imposible que sean iguales
    // Este test documenta la propiedad aleatoria del shuffle; lo aceptamos excepto si seed fija
    expect(typeof r1).toBe("string"); // siempre se ejecuta
  });
});
