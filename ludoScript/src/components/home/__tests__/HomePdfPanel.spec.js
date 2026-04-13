import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import HomePdfPanel from "@/components/home/HomePdfPanel.vue";

const { routerPush, pdfServiceMocks } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  pdfServiceMocks: {
    listPdfs: vi.fn(),
    uploadPdf: vi.fn(),
    deletePdf: vi.fn(),
    saveToCloud: vi.fn(),
  },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/api/pdf.service", () => ({
  pdfService: pdfServiceMocks,
}));

vi.mock("@/composables/useAdaptiveSelection", () => ({
  savePdfQuestionsToStorage: vi.fn(),
  loadPdfQuestionsFromStorage: vi.fn(),
  removePdfFromStorage: vi.fn(),
  hasPdfInStorage: vi.fn(() => false),
  isPdfSavedToCloud: vi.fn(() => false),
  markPdfAsSavedToCloud: vi.fn(),
}));

// ─── utilidades de codificación ──────────────────────────────────────────────
const MOJIBAKE_RE =
  /Ã[³­©±¡º¼\u0089\u008c\u008f\u0093-\u009f]|â[€\u0080-\u009f]|ðŸ|â•|â\u0080|â\u0094/;

function noMojibake(text) {
  return !MOJIBAKE_RE.test(text);
}

const defaultProps = {
  selectedFiles: [],
  pdfCount: 0,
  selectedPredefined: true,
  "onUpdate:selectedFiles": () => {},
  "onUpdate:pdfCount": () => {},
  "onUpdate:selectedPredefined": () => {},
};

// ─── Tests de codificación ───────────────────────────────────────────────────
describe("HomePdfPanel — codificación de textos (sin mojibake)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pdfServiceMocks.listPdfs.mockResolvedValue({ data: [] });
  });

  it("el título principal 'Documentos' se muestra sin corrupción", async () => {
    const wrapper = mount(HomePdfPanel, { props: defaultProps });
    await flushPromises();

    const heading = wrapper.find("h3");
    expect(heading.text()).toBe("Documentos");
    expect(noMojibake(heading.text())).toBe(true);
  });

  it("las etiquetas de sección 'PREDEFINIDOS' y 'APUNTES' no tienen mojibake", async () => {
    const wrapper = mount(HomePdfPanel, { props: defaultProps });
    await flushPromises();

    const labels = wrapper
      .findAll("span")
      .filter((s) => /predefinidos|apuntes/i.test(s.text()));

    expect(labels.length).toBeGreaterThanOrEqual(2);
    labels.forEach((label) => {
      expect(noMojibake(label.text())).toBe(true);
    });
  });

  it("el contenido predefinido muestra texto español con tildes sin mojibake", async () => {
    const wrapper = mount(HomePdfPanel, { props: defaultProps });
    await flushPromises();

    const texto = wrapper.text();
    // Tildes esperadas
    expect(texto).toContain("programacion");
    expect(texto).toContain("asincronia");
    // No deben aparecer secuencias mojibake en el HTML completo del componente
    expect(noMojibake(texto)).toBe(true);
  });

  it("el aviso 💡 contiene el emoji correcto y texto con tildes", async () => {
    const wrapper = mount(HomePdfPanel, { props: defaultProps });
    await flushPromises();

    const texto = wrapper.text();
    // Emoji correcto (no su versión mojibake ðŸ'¡)
    expect(texto).toContain("💡");
    expect(texto).not.toContain("ðŸ");
    // Texto del aviso con tilde
    expect(texto).toContain("súbelos");
    expect(texto).toContain("botón");

    expect(noMojibake(texto)).toBe(true);
  });

  it("el modal de borrado muestra '¿Eliminar?' y 'Se borrarán' con caracteres correctos", async () => {
    const PDF_MOCK = {
      id: 1,
      originalName: "mis-apuntes.pdf",
      createdAt: new Date().toISOString(),
    };
    pdfServiceMocks.listPdfs.mockResolvedValue({ data: [PDF_MOCK] });
    vi.mocked(
      (await import("@/composables/useAdaptiveSelection")).hasPdfInStorage,
    ).mockReturnValue(false);

    const wrapper = mount(HomePdfPanel, { props: defaultProps });
    await flushPromises();

    // Abrir modal de borrado
    const deleteBtn = wrapper.find("button[title='Eliminar PDF']");
    await deleteBtn.trigger("click");
    await flushPromises();

    const modalText = wrapper.text();
    expect(modalText).toContain("¿Eliminar");
    expect(modalText).toContain("borrarán");
    expect(modalText).toContain("Cancelar");
    expect(modalText).toContain("Eliminar");
    expect(noMojibake(modalText)).toBe(true);
  });

  it("el estado de subida muestra 'Procesando...' y 'Gemini' sin mojibake", async () => {
    // uploadPdf nunca resuelve para mantener el estado uploading
    pdfServiceMocks.uploadPdf.mockReturnValue(new Promise(() => {}));

    const wrapper = mount(HomePdfPanel, { props: defaultProps });
    await flushPromises();

    const input = wrapper.find('input[type="file"]');
    const file = new File(["pdf"], "tema.pdf", { type: "application/pdf" });
    Object.defineProperty(input.element, "files", {
      value: [file],
      configurable: true,
    });

    await input.trigger("change");
    await flushPromises();

    const texto = wrapper.text();
    expect(texto).toContain("Procesando");
    expect(noMojibake(texto)).toBe(true);
  });
});

describe("HomePdfPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pdfServiceMocks.listPdfs.mockResolvedValue({ data: [] });
  });

  it("muestra un CTA al modo tutorial local cuando Gemini no esta disponible", async () => {
    pdfServiceMocks.uploadPdf.mockRejectedValueOnce({
      response: {
        data: {
          code: "GEMINI_UNAVAILABLE",
          fallbackMode: "tutorial-local",
        },
      },
    });

    const wrapper = mount(HomePdfPanel, {
      props: {
        selectedFiles: [],
        pdfCount: 0,
        selectedPredefined: true,
        "onUpdate:selectedFiles": () => {},
        "onUpdate:pdfCount": () => {},
        "onUpdate:selectedPredefined": () => {},
      },
    });

    await flushPromises();

    const input = wrapper.find('input[type="file"]');
    const file = new File(["pdf"], "tema.pdf", { type: "application/pdf" });
    Object.defineProperty(input.element, "files", {
      value: [file],
      configurable: true,
    });

    await input.trigger("change");
    await flushPromises();

    expect(wrapper.text()).toContain(
      "Ahora mismo no se pueden generar preguntas desde PDF.",
    );

    const cta = wrapper.get('[data-testid="tutorial-local-cta"]');
    expect(cta.text()).toContain("Practicar modo tutorial local");

    await cta.trigger("click");

    expect(routerPush).toHaveBeenCalledWith({
      name: "inGame",
      query: { game: "Quiz", adaptive: "true" },
    });
  });
});
