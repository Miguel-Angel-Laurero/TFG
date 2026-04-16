---
name: write-tests-frontend
description: "**TESTS FRONTEND SKILL** — Escribe tests para Vue 3 usando Vitest + Vue Test Utils siguiendo los patrones del proyecto. USA CUANDO: el usuario pida 'escribe tests para este componente', 'tests de Vue', 'tests del store de Pinia', 'tests del composable'. NO USAR PARA: tests de endpoints Express (usa write-tests-backend). PRODUCE: archivo de tests completo con casos happy path, casos de error y cobertura de estados del componente/store."
argument-hint: "Archivo a testear (componente .vue, store .store.js, o composable use*.js), y qué comportamientos son más críticos de cubrir"
---

# Write Tests Frontend

Escribe tests para Vue 3 usando Vitest + Vue Test Utils siguiendo las convenciones del proyecto LudoScript.

## Cuándo se activa

- "escribe tests para este componente Vue"
- "tests del store de Pinia"
- "tests del composable useXxx"
- "añade cobertura a este archivo"

## Setup del proyecto

```js
// vitest.config.js — ya configurado en el proyecto
// Comando para ejecutar: npm run test (desde ludoScript/)
```

---

## Patrón: Tests de componente Vue

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import MiComponente from "@/components/dominio/MiComponente.vue";

// Mock de los stores que usa el componente
vi.mock("@/stores/feature.store", () => ({
  useFeatureStore: () => ({
    items: [{ id: 1, nombre: "Test" }],
    loading: false,
    error: null,
    fetchAll: vi.fn(),
  }),
}));

describe("MiComponente", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renderiza el listado cuando hay items", () => {
    const wrapper = mount(MiComponente);
    expect(wrapper.find("[data-testid='item-list']").exists()).toBe(true);
    expect(wrapper.text()).toContain("Test");
  });

  it("muestra spinner cuando loading es true", async () => {
    // Sobreescribir el mock para este test
    vi.mocked(useFeatureStore).mockReturnValueOnce({
      items: [],
      loading: true,
      error: null,
      fetchAll: vi.fn(),
    });
    const wrapper = mount(MiComponente);
    expect(wrapper.find("[data-testid='spinner']").exists()).toBe(true);
  });

  it("muestra mensaje de error cuando error no es null", () => {
    // ...
  });

  it("muestra estado vacío cuando no hay items", () => {
    // ...
  });

  it("emite el evento correcto al hacer click en el botón", async () => {
    const wrapper = mount(MiComponente);
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("mi-evento")).toBeTruthy();
  });
});
```

---

## Patrón: Tests de store Pinia

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useFeatureStore } from "@/stores/feature.store";
import { featureService } from "@/api/feature.service";

// Mock del service
vi.mock("@/api/feature.service", () => ({
  featureService: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

describe("useFeatureStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("fetchAll", () => {
    it("carga los items y actualiza el estado", async () => {
      const mockData = [{ id: 1, nombre: "Item 1" }];
      vi.mocked(featureService.getAll).mockResolvedValue({ data: mockData });

      const store = useFeatureStore();
      await store.fetchAll();

      expect(store.items).toEqual(mockData);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it("asigna error y devuelve null cuando el servicio falla", async () => {
      vi.mocked(featureService.getAll).mockRejectedValue({
        response: { data: { message: "Error del servidor" } },
      });

      const store = useFeatureStore();
      const result = await store.fetchAll();

      expect(result).toBeNull();
      expect(store.error).toBe("Error del servidor");
      expect(store.loading).toBe(false);
      expect(store.items).toEqual([]); // no se modificó el estado anterior
    });

    it("pone loading a false incluso si hay error (finally)", async () => {
      vi.mocked(featureService.getAll).mockRejectedValue(new Error("Network"));
      const store = useFeatureStore();
      await store.fetchAll();
      expect(store.loading).toBe(false);
    });
  });
});
```

---

## Patrón: Tests de composable

```js
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useMyComposable } from "@/composables/useMyComposable";

describe("useMyComposable", () => {
  it("inicializa el estado correctamente", () => {
    const { valor, isReady } = useMyComposable();
    expect(valor.value).toBe(null);
    expect(isReady.value).toBe(false);
  });

  it("actualiza el estado tras la acción", async () => {
    const { valor, doAction } = useMyComposable();
    await doAction("nuevo-valor");
    expect(valor.value).toBe("nuevo-valor");
  });
});
```

---

## Checklist de calidad de tests

- [ ] **Arrange / Act / Assert**: cada test tiene las 3 fases claramente separadas
- [ ] Los mocks usan `vi.mock()` al nivel del módulo, no dentro de cada test
- [ ] `beforeEach` limpia los mocks con `vi.clearAllMocks()` y resetea Pinia con `setActivePinia(createPinia())`
- [ ] Se testean los 4 estados del componente: loading, datos, vacío y error
- [ ] Los tests de store verifican que `loading` vuelve a `false` en el `finally`
- [ ] Los tests de store verifican que acciones fallidas devuelven `null`
- [ ] Los tests no dependen entre sí (cada uno puede ejecutarse de forma aislada)
- [ ] No hay `console.log` en los tests
- [ ] Los selectores usan `data-testid` en vez de clases CSS (más estables ante refactors)
