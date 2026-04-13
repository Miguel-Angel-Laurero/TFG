import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FlashCardDeck from "@/components/minigames/FlashCardDeck.vue";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultProps = {
  card: {
    question: "¿Qué es var?",
    answer: "Declaración de variable en función/global",
  },
  currentIndex: 0,
  totalItems: 5,
  isFlipped: false,
  isLastItem: false,
};

function wrap(propsOverride = {}) {
  return mount(FlashCardDeck, { props: { ...defaultProps, ...propsOverride } });
}

// ─── Renderizado básico ───────────────────────────────────────────────────────

describe("FlashCardDeck — Renderizado", () => {
  it("muestra el texto de la pregunta", () => {
    expect(wrap().text()).toContain("¿Qué es var?");
  });

  it("muestra el texto de la respuesta", () => {
    expect(wrap().text()).toContain(
      "Declaración de variable en función/global",
    );
  });

  it('muestra el contador "currentIndex+1 / totalItems"', () => {
    expect(wrap({ currentIndex: 2, totalItems: 8 }).text()).toContain("3 / 8");
  });

  it('muestra "1 / 1" para la carta única', () => {
    expect(wrap({ currentIndex: 0, totalItems: 1 }).text()).toContain("1 / 1");
  });

  it('muestra "1 / 5" en el primer item por defecto', () => {
    expect(wrap().text()).toContain("1 / 5");
  });
});

// ─── Hint de volteo ───────────────────────────────────────────────────────────

describe("FlashCardDeck — Hint de volteo", () => {
  it("el hint es opacity-100 cuando la carta no está volteada", () => {
    const hint = wrap({ isFlipped: false }).find("p.text-xs");
    expect(hint.classes()).toContain("opacity-100");
    expect(hint.classes()).not.toContain("opacity-0");
  });

  it("el hint tiene opacity-0 y pointer-events-none cuando la carta está volteada", () => {
    const hint = wrap({ isFlipped: true }).find("p.text-xs");
    expect(hint.classes()).toContain("opacity-0");
    expect(hint.classes()).toContain("pointer-events-none");
  });
});

// ─── Visibilidad de botones ──────────────────────────────────────────────────

describe("FlashCardDeck — Visibilidad de botones", () => {
  it("el contenedor de botones tiene opacity-0 y pointer-events-none cuando no está volteada", () => {
    const btns = wrap({ isFlipped: false }).find(".flex.gap-4");
    expect(btns.classes()).toContain("opacity-0");
    expect(btns.classes()).toContain("pointer-events-none");
  });

  it("el contenedor de botones tiene opacity-100 cuando la carta está volteada", () => {
    const btns = wrap({ isFlipped: true }).find(".flex.gap-4");
    expect(btns.classes()).toContain("opacity-100");
    expect(btns.classes()).not.toContain("pointer-events-none");
  });

  it('el aria-label menciona "Siguiente" cuando no es el último item', () => {
    const buttons = wrap({ isFlipped: true, isLastItem: false }).findAll(
      "button",
    );
    expect(buttons[0].attributes("aria-label")).toContain("Siguiente");
    expect(buttons[1].attributes("aria-label")).toContain("Siguiente");
  });

  it('el aria-label menciona "Finalizar" cuando es el último item', () => {
    const buttons = wrap({ isFlipped: true, isLastItem: true }).findAll(
      "button",
    );
    expect(buttons[0].attributes("aria-label")).toContain("Finalizar");
    expect(buttons[1].attributes("aria-label")).toContain("Finalizar");
  });

  it("hay exactamente 2 botones de marcado", () => {
    expect(wrap({ isFlipped: true }).findAll("button")).toHaveLength(2);
  });
});

// ─── Emisión de eventos ───────────────────────────────────────────────────────

describe("FlashCardDeck — Eventos", () => {
  it('emite "flip" al hacer click en la carta', async () => {
    const w = wrap();
    await w.find('[style*="perspective"]').trigger("click");
    expect(w.emitted("flip")).toHaveLength(1);
  });

  it('emite exactamente un "flip" por click (no se duplica)', async () => {
    const w = wrap();
    const carta = w.find('[style*="perspective"]');
    await carta.trigger("click");
    await carta.trigger("click");
    expect(w.emitted("flip")).toHaveLength(2);
  });

  it('emite "mark-correct" al pulsar el primer botón (✓)', async () => {
    const w = wrap({ isFlipped: true });
    await w.findAll("button")[0].trigger("click");
    expect(w.emitted("mark-correct")).toHaveLength(1);
  });

  it('emite "mark-wrong" al pulsar el segundo botón (✗)', async () => {
    const w = wrap({ isFlipped: true });
    await w.findAll("button")[1].trigger("click");
    expect(w.emitted("mark-wrong")).toHaveLength(1);
  });

  it('no emite "mark-correct" ni "mark-wrong" al hacer click en la carta', async () => {
    const w = wrap();
    await w.find('[style*="perspective"]').trigger("click");
    expect(w.emitted("mark-correct")).toBeFalsy();
    expect(w.emitted("mark-wrong")).toBeFalsy();
  });

  it("el contenedor de botones tiene pointer-events-none cuando no está volteada (impide interacción CSS)", () => {
    // Verifica la clase CSS que impide la interacción cuando la carta no está volteada
    const btns = wrap({ isFlipped: false }).find(".flex.gap-4");
    expect(btns.classes()).toContain("pointer-events-none");
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("FlashCardDeck — Edge cases", () => {
  it("renderiza sin errores con pregunta y respuesta vacías", () => {
    expect(() => wrap({ card: { question: "", answer: "" } })).not.toThrow();
  });

  it("renderiza sin errores con texto muy largo (600 caracteres)", () => {
    const card = { question: "P".repeat(600), answer: "R".repeat(600) };
    expect(() => wrap({ card })).not.toThrow();
  });

  it("renderiza sin errores con currentIndex=0 y totalItems=0", () => {
    expect(() => wrap({ currentIndex: 0, totalItems: 0 })).not.toThrow();
  });

  it("renderiza sin errores con totalItems=1 e isLastItem=true", () => {
    expect(() =>
      wrap({ currentIndex: 0, totalItems: 1, isLastItem: true }),
    ).not.toThrow();
  });

  it('el botón ✗ no emite "mark-correct" por error', async () => {
    const w = wrap({ isFlipped: true });
    await w.findAll("button")[1].trigger("click");
    expect(w.emitted("mark-correct")).toBeFalsy();
    expect(w.emitted("mark-wrong")).toHaveLength(1);
  });

  it('el botón ✓ no emite "mark-wrong" por error', async () => {
    const w = wrap({ isFlipped: true });
    await w.findAll("button")[0].trigger("click");
    expect(w.emitted("mark-wrong")).toBeFalsy();
    expect(w.emitted("mark-correct")).toHaveLength(1);
  });
});
