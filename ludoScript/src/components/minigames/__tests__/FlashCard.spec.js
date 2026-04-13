import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import { ref, computed, nextTick } from "vue";

// ─── Mocks de módulos ────────────────────────────────────────────────────────
// IMPORTANTE: vi.mock se eleva al inicio del fichero. Los factories solo deben
// usar vi.fn() directamente, sin referenciar variables del scope del test.

vi.mock("vue-router", () => ({ useRoute: vi.fn() }));
vi.mock("@/composables/useActivitySession", () => ({
  useActivitySession: vi.fn(),
}));
vi.mock("@/composables/useActivityReward", () => ({
  useActivityReward: vi.fn(),
}));
vi.mock("@/composables/useCategoryStats", () => ({
  useCategoryStats: vi.fn(),
}));
vi.mock("@/api/axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@/composables/useLoadingTimer", () => ({ useLoadingTimer: vi.fn() }));

// Importamos los mocks después de declararlos (Vitest los reemplaza antes)
import { useRoute } from "vue-router";
import { useActivitySession } from "@/composables/useActivitySession";
import { useActivityReward } from "@/composables/useActivityReward";
import { useCategoryStats } from "@/composables/useCategoryStats";
import api from "@/api/axios";
import { useLoadingTimer } from "@/composables/useLoadingTimer";

// Componentes hijo (importados solo para usarlos como referencia en findComponent)
import FlashCardDeck from "@/components/minigames/FlashCardDeck.vue";
import ActivityFinished from "@/components/minigames/ActivityFinished.vue";

// Componente bajo prueba (se importa al final para que los mocks estén listos)
import FlashCard from "@/components/minigames/FlashCard.vue";

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** Genera un banco de n preguntas con estructura uniforme para facilitar assertions. */
function makeBank(n = 20) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    category: "fundamentos-js",
    topic: "scope",
    difficulty: 1,
    question: `Pregunta ${i + 1}`,
    options: ["Opción A", "Opción B", "Opción C", "Opción D"],
    correct: 0, // answer siempre será 'Opción A'
  }));
}

/** Genera flashcards de PDF ya procesadas (sin necesidad de transformación). */
function makePdfCards(n = 3) {
  return Array.from({ length: n }, (_, i) => ({
    question: `PDF Q${i + 1}`,
    answer: `PDF A${i + 1}`,
  }));
}

// ─── Fábrica de sesión reactiva ───────────────────────────────────────────────

function makeSession() {
  const sessionItems = ref([]);
  const currentIndex = ref(0);
  const finished = ref(false);

  const currentItem = computed(
    () => sessionItems.value[currentIndex.value] ?? null,
  );
  const totalItems = computed(() => sessionItems.value.length);
  const isLastItem = computed(() => currentIndex.value + 1 >= totalItems.value);

  const loadDirect = vi.fn(async (items) => {
    sessionItems.value = items;
  });

  const next = vi.fn((onReset) => {
    onReset?.();
    if (currentIndex.value + 1 >= sessionItems.value.length) {
      finished.value = true;
    } else {
      currentIndex.value++;
    }
  });

  const restart = vi.fn((onReset) => {
    onReset?.();
    currentIndex.value = 0;
    finished.value = false;
  });

  return {
    finished,
    currentIndex,
    currentItem,
    totalItems,
    isLastItem,
    loadDirect,
    next,
    restart,
    // Expuesto para manipular estado en tests
    _items: sessionItems,
  };
}

// ─── Estado compartido entre tests ───────────────────────────────────────────

let session;
let mockGrantReward;
let mockTrackAnswer;
let mockSubmitSession;
let mockResetSession;

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Ruta sin query params por defecto
  useRoute.mockReturnValue({ query: {} });

  // Sesión reactiva fresca
  session = makeSession();
  useActivitySession.mockReturnValue(session);

  // Recompensas
  mockGrantReward = vi.fn().mockResolvedValue(undefined);
  useActivityReward.mockReturnValue({
    grantReward: mockGrantReward,
    earnedReward: ref(0),
  });

  // Stats de categoría
  mockTrackAnswer = vi.fn();
  mockSubmitSession = vi.fn().mockResolvedValue(undefined);
  mockResetSession = vi.fn();
  useCategoryStats.mockReturnValue({
    trackAnswer: mockTrackAnswer,
    submitSession: mockSubmitSession,
    resetSession: mockResetSession,
  });

  // LoadingTimer: invoca fn() inmediatamente y pone loadingManual=false
  useLoadingTimer.mockImplementation((loadingRef) => ({
    withMinTime: vi.fn(async (fn) => {
      await fn();
      loadingRef.value = false;
    }),
  }));

  // fetch global: devuelve banco de 20 preguntas
  global.fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue(makeBank(20)),
  });

  // api.get: implementación vacía por defecto
  api.get.mockResolvedValue({ data: [] });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

async function mountAndLoad() {
  const wrapper = shallowMount(FlashCard);
  await flushPromises();
  return wrapper;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("FlashCard — Estado de carga", () => {
  it("muestra FlashCardDeck una vez completada la carga", async () => {
    const wrapper = await mountAndLoad();
    expect(wrapper.findComponent(FlashCardDeck).exists()).toBe(true);
  });

  it("no muestra ActivityFinished al inicio (finished=false)", async () => {
    const wrapper = await mountAndLoad();
    expect(wrapper.findComponent(ActivityFinished).exists()).toBe(false);
  });

  it("muestra ActivityFinished cuando finished cambia a true", async () => {
    const wrapper = await mountAndLoad();
    session.finished.value = true;
    await nextTick();
    expect(wrapper.findComponent(ActivityFinished).exists()).toBe(true);
    expect(wrapper.findComponent(FlashCardDeck).exists()).toBe(false);
  });
});

describe("FlashCard — Carga de preguntas (sin query params)", () => {
  it("hace fetch a quizQuestions.json", async () => {
    await mountAndLoad();
    expect(global.fetch).toHaveBeenCalledWith("/quizQuestions.json");
  });

  it("llama a loadDirect con exactamente 15 cards cuando el banco tiene 20", async () => {
    await mountAndLoad();
    expect(session.loadDirect).toHaveBeenCalledTimes(1);
    expect(session.loadDirect.mock.calls[0][0]).toHaveLength(15);
  });

  it("las cards transformadas tienen answer=options[correct] del banco", async () => {
    // El banco de prueba tiene correct=0, options[0]='Opción A'
    await mountAndLoad();
    const cards = session.loadDirect.mock.calls[0][0];
    cards.forEach((card) => expect(card.answer).toBe("Opción A"));
  });

  it("las cards tienen los campos id, category, topic, difficulty", async () => {
    await mountAndLoad();
    const cards = session.loadDirect.mock.calls[0][0];
    cards.forEach((card) => {
      expect(card).toHaveProperty("id");
      expect(card).toHaveProperty("category");
      expect(card).toHaveProperty("topic");
      expect(card).toHaveProperty("difficulty");
    });
  });

  it("no llama a api.get cuando no hay pdfIds en la ruta", async () => {
    await mountAndLoad();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("carga todas las preguntas disponibles si el banco tiene menos de 15", async () => {
    global.fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue(makeBank(8)),
    });
    await mountAndLoad();
    expect(session.loadDirect.mock.calls[0][0]).toHaveLength(8);
  });

  it("llama a loadDirect con array vacío si fetch lanza error", async () => {
    global.fetch.mockRejectedValue(new Error("Network error"));
    await mountAndLoad();
    expect(session.loadDirect).toHaveBeenCalledWith([]);
  });

  it("no propaga el error si fetch falla", async () => {
    global.fetch.mockRejectedValue(new Error("Network error"));
    await expect(mountAndLoad()).resolves.not.toThrow();
  });
});

describe("FlashCard — Carga con pdfId en query params", () => {
  it("?pdfId=42 llama a api.get con la ruta correcta", async () => {
    useRoute.mockReturnValue({ query: { pdfId: "42" } });
    api.get.mockResolvedValue({ data: makePdfCards() });
    await mountAndLoad();
    expect(api.get).toHaveBeenCalledWith("/pdfs/42/flashcards");
  });

  it("?pdfId=42 NO incluye el banco de quizQuestions", async () => {
    useRoute.mockReturnValue({ query: { pdfId: "42" } });
    api.get.mockResolvedValue({ data: makePdfCards() });
    await mountAndLoad();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("?pdfId=42 carga las cards del PDF en loadDirect", async () => {
    useRoute.mockReturnValue({ query: { pdfId: "42" } });
    const pdfCards = makePdfCards(3);
    api.get.mockResolvedValue({ data: pdfCards });
    await mountAndLoad();
    expect(session.loadDirect).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ question: "PDF Q1" })]),
    );
  });

  it("?pdfId=42&includePredefined=true incluye ambas fuentes", async () => {
    useRoute.mockReturnValue({
      query: { pdfId: "42", includePredefined: "true" },
    });
    api.get.mockResolvedValue({ data: makePdfCards(2) });
    await mountAndLoad();
    expect(api.get).toHaveBeenCalledWith("/pdfs/42/flashcards");
    expect(global.fetch).toHaveBeenCalledWith("/quizQuestions.json");
    // 2 del PDF + 15 del banco = 17
    expect(session.loadDirect.mock.calls[0][0]).toHaveLength(17);
  });

  it("?pdfIds=1,2 hace dos llamadas a la API", async () => {
    useRoute.mockReturnValue({ query: { pdfIds: "1,2" } });
    api.get.mockResolvedValue({ data: [] });
    await mountAndLoad();
    expect(api.get).toHaveBeenCalledWith("/pdfs/1/flashcards");
    expect(api.get).toHaveBeenCalledWith("/pdfs/2/flashcards");
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("si la API del PDF devuelve data no-array, trata como array vacío", async () => {
    useRoute.mockReturnValue({ query: { pdfId: "5" } });
    api.get.mockResolvedValue({ data: null });
    await mountAndLoad();
    expect(session.loadDirect).toHaveBeenCalledWith([]);
  });

  it("si la API del PDF falla, continúa sin propagar error", async () => {
    useRoute.mockReturnValue({ query: { pdfId: "99" } });
    api.get.mockRejectedValue(new Error("401 Unauthorized"));
    await expect(mountAndLoad()).resolves.not.toThrow();
    expect(session.loadDirect).toHaveBeenCalled();
  });
});

describe("FlashCard — Interacción: mark-correct y mark-wrong", () => {
  it("mark-correct llama a trackAnswer con isCorrect=true y los datos del item", async () => {
    const wrapper = await mountAndLoad();
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-correct");
    await flushPromises();
    expect(mockTrackAnswer).toHaveBeenCalledWith(
      "fundamentos-js",
      true,
      expect.any(Number),
      1,
      "scope",
    );
  });

  it("mark-wrong llama a trackAnswer con isCorrect=false y los datos del item", async () => {
    const wrapper = await mountAndLoad();
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-wrong");
    await flushPromises();
    expect(mockTrackAnswer).toHaveBeenCalledWith(
      "fundamentos-js",
      false,
      expect.any(Number),
      1,
      "scope",
    );
  });

  it("mark-correct llama a next para avanzar", async () => {
    const wrapper = await mountAndLoad();
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-correct");
    await flushPromises();
    expect(session.next).toHaveBeenCalledTimes(1);
  });

  it("mark-wrong también llama a next para avanzar", async () => {
    const wrapper = await mountAndLoad();
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-wrong");
    await flushPromises();
    expect(session.next).toHaveBeenCalledTimes(1);
  });

  it("flip alterna isFlipped de false a true", async () => {
    const wrapper = await mountAndLoad();
    const deck = wrapper.findComponent(FlashCardDeck);
    expect(deck.props("isFlipped")).toBe(false);
    deck.vm.$emit("flip");
    await nextTick();
    expect(deck.props("isFlipped")).toBe(true);
  });

  it("isFlipped se resetea a false al avanzar a la siguiente carta", async () => {
    const wrapper = await mountAndLoad();
    const deck = wrapper.findComponent(FlashCardDeck);
    deck.vm.$emit("flip");
    await nextTick();
    expect(deck.props("isFlipped")).toBe(true);
    deck.vm.$emit("mark-correct");
    await flushPromises();
    expect(deck.props("isFlipped")).toBe(false);
  });

  it("trackAnswer no es llamado antes de marcar", async () => {
    await mountAndLoad();
    expect(mockTrackAnswer).not.toHaveBeenCalled();
  });
});

describe("FlashCard — Último item: submitSession y grantReward", () => {
  it("en el último item, llama a submitSession y grantReward", async () => {
    const wrapper = await mountAndLoad();
    // Mover al último item manipulando el índice de la sesión
    session.currentIndex.value = session.totalItems.value - 1;
    await nextTick();
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-correct");
    await flushPromises();
    expect(mockSubmitSession).toHaveBeenCalledTimes(1);
    expect(mockGrantReward).toHaveBeenCalledTimes(1);
  });

  it("submitSession se llama antes que grantReward", async () => {
    const wrapper = await mountAndLoad();
    session.currentIndex.value = session.totalItems.value - 1;
    await nextTick();
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-correct");
    await flushPromises();
    const submitOrder = mockSubmitSession.mock.invocationCallOrder[0];
    const rewardOrder = mockGrantReward.mock.invocationCallOrder[0];
    expect(submitOrder).toBeLessThan(rewardOrder);
  });

  it("en items intermedios, submitSession y grantReward NO se llaman", async () => {
    const wrapper = await mountAndLoad();
    // Index 0 con 15 cards no es el último
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-correct");
    await flushPromises();
    expect(mockSubmitSession).not.toHaveBeenCalled();
    expect(mockGrantReward).not.toHaveBeenCalled();
  });

  it("mark-wrong también dispara submitSession y grantReward en el último item", async () => {
    const wrapper = await mountAndLoad();
    session.currentIndex.value = session.totalItems.value - 1;
    await nextTick();
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-wrong");
    await flushPromises();
    expect(mockSubmitSession).toHaveBeenCalledTimes(1);
    expect(mockGrantReward).toHaveBeenCalledTimes(1);
  });

  it("en el banco con una sola pregunta, la primera carta ya es la última", async () => {
    global.fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue(makeBank(1)),
    });
    const wrapper = await mountAndLoad();
    // Con 1 pregunta, index 0 es el último
    expect(session.isLastItem.value).toBe(true);
    wrapper.findComponent(FlashCardDeck).vm.$emit("mark-correct");
    await flushPromises();
    expect(mockSubmitSession).toHaveBeenCalledTimes(1);
    expect(mockGrantReward).toHaveBeenCalledTimes(1);
  });
});

describe("FlashCard — Reinicio", () => {
  it("restart llama a resetSession y reinicia la sesión", async () => {
    const wrapper = await mountAndLoad();
    session.finished.value = true;
    await nextTick();
    wrapper.findComponent(ActivityFinished).vm.$emit("restart");
    await nextTick();
    expect(mockResetSession).toHaveBeenCalledTimes(1);
    expect(session.restart).toHaveBeenCalledTimes(1);
  });

  it("después del restart, isFlipped vuelve a false", async () => {
    const wrapper = await mountAndLoad();
    // Voltear la carta
    wrapper.findComponent(FlashCardDeck).vm.$emit("flip");
    await nextTick();
    expect(wrapper.findComponent(FlashCardDeck).props("isFlipped")).toBe(true);
    // Forzar finished y reiniciar
    session.finished.value = true;
    await nextTick();
    wrapper.findComponent(ActivityFinished).vm.$emit("restart");
    await nextTick();
    session.finished.value = false;
    await nextTick();
    expect(wrapper.findComponent(FlashCardDeck).props("isFlipped")).toBe(false);
  });

  it("resetSession se llama antes que restart", async () => {
    const wrapper = await mountAndLoad();
    session.finished.value = true;
    await nextTick();
    wrapper.findComponent(ActivityFinished).vm.$emit("restart");
    await nextTick();
    const resetOrder = mockResetSession.mock.invocationCallOrder[0];
    const restartOrder = session.restart.mock.invocationCallOrder[0];
    expect(resetOrder).toBeLessThan(restartOrder);
  });
});
