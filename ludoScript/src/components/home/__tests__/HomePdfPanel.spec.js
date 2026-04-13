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
