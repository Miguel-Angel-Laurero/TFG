import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import UserInfo from "@/components/shared/UserInfo.vue";
import { QUIZ_CATEGORIES } from "@/utils/quizCategories";

const { authStore, serviceMocks } = vi.hoisted(() => ({
  authStore: {
    user: {
      username: "Ada",
      email: "ada@example.com",
      avatar: null,
      banner: null,
    },
    userData: {
      streak: 3,
      coins: 120,
      accuracy: 84,
      timeSpent: 12,
    },
    fetchMe: vi.fn(),
  },
  serviceMocks: {
    getMine: vi.fn(),
    getAll: vi.fn(),
  },
}));

vi.mock("@/stores/auth.store", () => ({
  useAuthStore: () => authStore,
}));

vi.mock("@/api/game.service", () => ({
  gameService: {
    getMine: serviceMocks.getMine,
  },
}));

vi.mock("@/api/categoryStats.service", () => ({
  categoryStatsService: {
    getAll: serviceMocks.getAll,
  },
}));

describe("UserInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.fetchMe.mockResolvedValue(undefined);
    serviceMocks.getMine.mockResolvedValue({
      data: [{ gameName: "Quiz" }, { gameName: "Flashcards" }, { gameName: "Quiz" }],
    });
    serviceMocks.getAll.mockResolvedValue({
      data: [
        { category: "fundamentos-js", total: 3 },
        { category: "objetos", total: 1 },
        { category: "asincronia", total: 0 },
      ],
    });
  });

  it("muestra el total de categorias desde QUIZ_CATEGORIES", async () => {
    const wrapper = mount(UserInfo);

    await flushPromises();

    expect(wrapper.text()).toContain(`2 / ${QUIZ_CATEGORIES.length}`);
  });
});
