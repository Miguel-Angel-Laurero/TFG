---
name: new-backend-endpoint
description: "**BACKEND ENDPOINT SKILL** — Crea un endpoint REST completo siguiendo las convenciones del proyecto: controller + route + validators + modelo opcional. USA CUANDO: el usuario pida 'crea un endpoint', 'añade una ruta', 'necesito una API para...', 'crea el controller de...'. NO USAR PARA: solo refactorizar un controller existente (usa Vue Refactoring Expert); solo crear un modelo sin ruta. PRODUCE: archivos listos para copiar, con todos los pasos de registro completados."
argument-hint: "Nombre del recurso en singular (ej: 'invoice'), operaciones necesarias (CRUD o específicas), y si necesita modelo nuevo o usa uno existente"
---

# New Backend Endpoint

Crea un endpoint REST completo respetando las convenciones de LudoScript: patrón try/catch/next, authMiddleware, validators y registro en el router raíz.

## Cuándo se activa

- "crea un endpoint / ruta / API para X"
- "necesito un controller que haga Y"
- "añade soporte backend para Z"
- "crea el CRUD de X"

## Procedimiento

### 1. Identificar el recurso

Antes de escribir código, determina:

| Pregunta                                                       | Impacto                                               |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| ¿Cuál es el nombre del recurso? (singular)                     | Nombra controller, route y model                      |
| ¿Qué operaciones se necesitan? (list/get/create/update/delete) | Determina qué métodos crear                           |
| ¿Requiere autenticación?                                       | Añade `authMiddleware` en la ruta                     |
| ¿Requiere modelo nuevo o usa uno existente?                    | Determina si hay que crear `NombreModelo.model.js`    |
| ¿El recurso pertenece a un usuario?                            | Añade `userId` en el modelo y filtro en el controller |

---

### 2. Crear el controller

Archivo: `backend/src/controllers/{recurso}.controller.js`

**Reglas obligatorias:**

- Siempre `try / catch (err) { next(err) }` — nunca `throw` directamente
- `req.user` viene del authMiddleware: `{ id, role }`
- Nunca devolver el campo `password` en ninguna respuesta
- Códigos HTTP: `200` OK, `201` Created, `400` Bad data, `401` Unauth, `403` Forbidden, `404` Not found

```js
const { NombreModelo } = require("../models");

// GET /recursos
exports.getAll = async (req, res, next) => {
  try {
    const items = await NombreModelo.findAll({
      where: { userId: req.user.id }, // si el recurso pertenece al usuario
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /recursos/:id
exports.getById = async (req, res, next) => {
  try {
    const item = await NombreModelo.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: "No encontrado." });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// POST /recursos
exports.create = async (req, res, next) => {
  try {
    const item = await NombreModelo.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /recursos/:id
exports.update = async (req, res, next) => {
  try {
    const item = await NombreModelo.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: "No encontrado." });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /recursos/:id
exports.remove = async (req, res, next) => {
  try {
    const item = await NombreModelo.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: "No encontrado." });
    await item.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
```

---

### 3. Crear el modelo (solo si es nuevo)

Archivo: `backend/src/models/{Nombre}.model.js`

```js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const NombreModelo = sequelize.define(
  "NombreModelo",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // ... campos del modelo
    userId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "nombre_tabla",
    timestamps: true,
  },
);

module.exports = NombreModelo;
```

**Después de crear el modelo, registrarlo en `backend/src/models/index.js`:**

```js
const NombreModelo = require("./Nombre.model");
// Añadir asociaciones si procede:
// User.hasMany(NombreModelo, { foreignKey: "userId" });
// NombreModelo.belongsTo(User, { foreignKey: "userId" });
module.exports = { ..., NombreModelo };
```

> `sequelize.sync({ alter: true })` adapta la tabla automáticamente al arrancar. No hay que crear migraciones.

---

### 4. Crear la ruta

Archivo: `backend/src/routes/{recurso}.routes.js`

```js
const { Router } = require("express");
const router = Router();
const ctrl = require("../controllers/{recurso}.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { validateCreate{Recurso} } = require("../utils/validators"); // si hay validaciones

// Todas las rutas protegidas:
router.use(authMiddleware);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validateCreate{Recurso}, validate, ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
```

**Registrar en `backend/src/routes/index.js`:**

```js
router.use("/{recurso-plural}", require("./{recurso}.routes"));
```

---

### 5. Añadir validators (si el endpoint recibe body)

En `backend/src/utils/validators.js`, añadir:

```js
const { body } = require("express-validator");

exports.validateCreate{Recurso} = [
  body("campo").notEmpty().withMessage("El campo es obligatorio."),
  body("otrocampo").isInt({ min: 0 }).withMessage("Debe ser un número positivo."),
];
```

---

### 6. Checklist de salida

Antes de entregar, confirmar:

- [ ] Controller: cada método tiene `try/catch/next(err)`
- [ ] Controller: ninguna respuesta devuelve el campo `password`
- [ ] Controller: los 404 comprueban que el recurso pertenece al usuario autenticado (no solo que existe)
- [ ] Route: `authMiddleware` aplicado en las rutas que lo requieren
- [ ] Route: registrada en `routes/index.js`
- [ ] Modelo: registrado en `models/index.js` con las asociaciones correctas
- [ ] Validators: aplicados antes del controller en las rutas con `body`
- [ ] Códigos HTTP correctos: 201 en create, 204 en delete, 404 si no existe
