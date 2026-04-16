---
name: write-tests-backend
description: "**TESTS BACKEND SKILL** — Escribe tests para endpoints Express/Sequelize usando Jest + Supertest. USA CUANDO: el usuario pida 'escribe tests para este endpoint', 'tests del controller', 'tests de la API', 'tests del backend'. NO USAR PARA: tests de componentes Vue (usa write-tests-frontend). PRODUCE: archivo de tests completo con happy path, casos de error, autenticación y validaciones para el endpoint dado."
argument-hint: "Archivo del controller o route a testear, y qué operaciones/casos son más críticos (autenticación, validaciones, errores 404, etc.)"
---

# Write Tests Backend

Escribe tests de integración para endpoints Express/Sequelize usando Jest + Supertest siguiendo los patrones de LudoScript.

## Cuándo se activa

- "escribe tests para este endpoint / controller / route"
- "tests de la API de X"
- "cubre este controller con tests"

## Setup

```bash
# Desde backend/
npm test
# o
npx jest --watch
```

---

## Patrón: Tests de endpoint

```js
const request = require("supertest");
const app = require("../../server"); // o el express app exportado
const { NombreModelo } = require("../models");
const jwt = require("../utils/jwt");

// Mock de los modelos para no tocar la DB real
jest.mock("../models", () => ({
  NombreModelo: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Token de prueba válido
const makeToken = (userId = 1, role = "user") =>
  jwt.signToken({ id: userId, role });

describe("GET /api/recursos", () => {
  beforeEach(() => jest.clearAllMocks());

  it("devuelve 200 con el listado cuando el token es válido", async () => {
    const mockItems = [{ id: 1, nombre: "Item 1", userId: 1 }];
    NombreModelo.findAll.mockResolvedValue(mockItems);

    const res = await request(app)
      .get("/api/recursos")
      .set("Authorization", `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockItems);
    expect(NombreModelo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } }),
    );
  });

  it("devuelve 401 sin token", async () => {
    const res = await request(app).get("/api/recursos");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/recursos", () => {
  it("devuelve 201 con el item creado", async () => {
    const payload = { nombre: "Nuevo item" };
    const created = { id: 2, ...payload, userId: 1 };
    NombreModelo.create.mockResolvedValue(created);

    const res = await request(app)
      .post("/api/recursos")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
  });

  it("devuelve 400 si falta un campo requerido por el validator", async () => {
    const res = await request(app)
      .post("/api/recursos")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({}); // sin campos

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

describe("GET /api/recursos/:id", () => {
  it("devuelve 404 si el recurso no existe", async () => {
    NombreModelo.findOne.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/recursos/999")
      .set("Authorization", `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });

  it("no devuelve el campo password en la respuesta", async () => {
    NombreModelo.findOne.mockResolvedValue({
      id: 1,
      nombre: "Test",
      password: "hashed",
      userId: 1,
    });

    const res = await request(app)
      .get("/api/recursos/1")
      .set("Authorization", `Bearer ${makeToken()}`);

    expect(res.body).not.toHaveProperty("password");
  });
});
```

---

## Mock del authMiddleware (alternativa)

Si no quieres generar tokens reales, puedes mockear el middleware:

```js
jest.mock("../middlewares/auth.middleware", () => (req, _res, next) => {
  req.user = { id: 1, role: "user" }; // usuario de prueba fijo
  next();
});
```

---

## Casos a cubrir siempre

| Caso                    | HTTP    | Test que hay que escribir                   |
| ----------------------- | ------- | ------------------------------------------- |
| Happy path autenticado  | 200/201 | Petición válida con token → datos correctos |
| Sin token               | 401     | Petición sin `Authorization` header         |
| Token inválido          | 401     | Token malformado o expirado                 |
| Recurso no encontrado   | 404     | ID que no existe en el mock                 |
| Datos inválidos         | 400     | Body vacío o con campos incorrectos         |
| Error de servidor       | 500     | Mock del modelo que lanza un error          |
| Campo sensible excluido | —       | `password` no aparece en la respuesta       |

---

## Checklist de calidad

- [ ] `beforeEach(() => jest.clearAllMocks())` en cada `describe`
- [ ] Los modelos Sequelize están mockeados — no se toca la DB real en tests
- [ ] Se usa `makeToken()` (o mock de middleware) en lugar de hardcodear un JWT
- [ ] Se testea el happy path Y al menos un caso de error por endpoint
- [ ] Los assertions comprueban `res.status` Y `res.body` (no solo el status)
- [ ] Se verifica que el campo `password` nunca aparece en respuestas de usuario
- [ ] No hay `console.log` en los tests
- [ ] Los tests son independientes entre sí (`beforeEach` limpia el estado)
