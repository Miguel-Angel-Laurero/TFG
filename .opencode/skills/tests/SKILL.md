---
name: tests
description: "Escribe tests para cualquier módulo de LudoScript: componentes Vue (Vitest), stores Pinia, composables, o endpoints Express (Jest+Supertest). USA CUANDO: 'escribe tests para...', 'añade cobertura a...', 'tests de X'. PRODUCE: archivo de tests con happy path + edge cases."
---

# Tests (frontend y backend unificado)

## Cuándo se activa

- "escribe tests para este componente/endpoint/store/composable"
- "añade cobertura a este archivo"
- "cubre este módulo con tests"

## Setup

```bash
# Frontend (Vitest)
npm test --prefix ludoScript -- --run

# Backend (Jest)
npm test --prefix backend
```

---

## Tests de componente Vue (Vitest + Vue Test Utils)

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import MiComponente from "@/components/dominio/MiComponente.vue";

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
    expect(wrapper.text()).toContain("Test");
  });

  it("muestra spinner cuando loading es true", () => {
    // Sobreescribir mock para este test
  });

  it("muestra mensaje de error cuando error no es null", () => { });

  it("muestra estado vacío cuando no hay items", () => { });
});
```

## Tests de store Pinia (Vitest)

```js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useFeatureStore } from "@/stores/feature.store";

vi.mock("@/api/feature.service", () => ({
  featureService: { getAll: vi.fn(), create: vi.fn() },
}));

describe("useFeatureStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("carga items y actualiza estado", async () => {
    vi.mocked(featureService.getAll).mockResolvedValue({ data: [{ id: 1 }] });
    const store = useFeatureStore();
    const result = await store.fetchAll();
    expect(result).toEqual([{ id: 1 }]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it("asigna error y devuelve null cuando falla", async () => {
    vi.mocked(featureService.getAll).mockRejectedValue({
      response: { data: { message: "Error del servidor" } },
    });
    const store = useFeatureStore();
    const result = await store.fetchAll();
    expect(result).toBeNull();
    expect(store.error).toBe("Error del servidor");
    expect(store.loading).toBe(false);
  });
});
```

## Tests de composable (Vitest)

```js
import { describe, it, expect } from "vitest";
import { useMyComposable } from "@/composables/useMyComposable";

describe("useMyComposable", () => {
  it("inicializa estado correctamente", () => {
    const { valor, isReady } = useMyComposable();
    expect(valor.value).toBe(null);
    expect(isReady.value).toBe(false);
  });
});
```

## Tests de endpoint backend (Jest + Supertest)

```js
const request = require("supertest");
const app = require("../../server");

jest.mock("../models", () => ({
  NombreModelo: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { NombreModelo } = require("../models");

describe("GET /api/recursos", () => {
  beforeEach(() => jest.clearAllMocks());

  it("devuelve 200 con listado cuando token es válido", async () => {
    NombreModelo.findAll.mockResolvedValue([{ id: 1, nombre: "Item" }]);
    const res = await request(app)
      .get("/api/recursos")
      .set("Authorization", `Bearer ${makeToken()}`);
    expect(res.status).toBe(200);
  });

  it("devuelve 401 sin token", async () => {
    const res = await request(app).get("/api/recursos");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/recursos", () => {
  it("devuelve 201 con item creado", async () => {
    NombreModelo.create.mockResolvedValue({ id: 1, nombre: "Test" });
    const res = await request(app)
      .post("/api/recursos")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({ nombre: "Test" });
    expect(res.status).toBe(201);
  });

  it("devuelve 400 si falta campo requerido", async () => {
    const res = await request(app)
      .post("/api/recursos")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
```

## Casos a cubrir siempre

| Caso | HTTP | Test |
|------|------|------|
| Happy path autenticado | 200/201 | Petición válida → datos correctos |
| Sin token | 401 | Petición sin `Authorization` |
| Recurso no encontrado | 404 | ID que no existe en mock |
| Datos inválidos | 400 | Body vacío o incorrecto |
| Error de servidor | 500 | Mock que lanza error |

## Checklist de calidad

- [ ] Arrange / Act / Assert en cada test
- [ ] `beforeEach` limpia mocks y resetea Pinia
- [ ] Se testean estados: loading, datos, vacío, error
- [ ] Stores: verificar `loading` vuelve a `false` en `finally`
- [ ] Stores: acciones fallidas devuelven `null`
- [ ] Backend: campo `password` nunca aparece en respuestas
- [ ] Tests independientes entre sí
- [ ] Sin `console.log` en tests
