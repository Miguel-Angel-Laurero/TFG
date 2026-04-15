---
description: "Convenciones del backend de LudoScript: patrón controller, cómo registrar modelos y rutas, uso de authMiddleware, validaciones, manejo de errores. Usa cuando: nuevo endpoint, nuevo modelo Sequelize, nueva ruta Express."
applyTo: "backend/**"
---

# Convenciones del backend — LudoScript

## Patrón de controller

Todos los controllers usan **try / catch / next(err)** y nunca lanzan directamente.

```js
// backend/src/controllers/example.controller.js
const { ModelName } = require("../models");

const myAction = async (req, res, next) => {
  try {
    const userId = req.user.id; // usuario autenticado inyectado por authMiddleware
    const { param } = req.params;
    const { field } = req.body;

    const record = await ModelName.findByPk(param);
    if (!record) return res.status(404).json({ message: "No encontrado" });

    res.json(record);
  } catch (err) {
    next(err); // errorHandler.middleware lo captura
  }
};

module.exports = { myAction };
```

- `req.user` tiene: `id`, `role` (inyectado por `authMiddleware`).
- Usar `403` para acceso denegado, `404` para no encontrado, `400` para datos inválidos.
- Nunca devolver el campo `password` en respuestas — usar `attributes: { exclude: ["password"] }` o desestructurar.

## Registrar un nuevo modelo Sequelize

1. **Crear** `backend/src/models/NombreModelo.model.js` con `sequelize.define(...)`.
2. **Añadir** en `backend/src/models/index.js`:

   ```js
   const NombreModelo = require("./NombreModelo.model");
   // ... después de los otros require

   // Asociaciones (si las hay)
   User.hasMany(NombreModelo, { foreignKey: "userId", onDelete: "CASCADE" });
   NombreModelo.belongsTo(User, { foreignKey: "userId" });

   // Añadir al module.exports:
   module.exports = { sequelize, ..., NombreModelo };
   ```

3. `sequelize.sync({ alter: true })` creará/alterará la tabla al arrancar en dev.

## Registrar una nueva ruta

1. **Crear** `backend/src/routes/nombre.routes.js`:

   ```js
   const router = require("express").Router();
   const auth = require("../middlewares/auth.middleware");
   const ctrl = require("../controllers/nombre.controller");

   router.get("/", auth, ctrl.getAll);
   router.post("/", auth, ctrl.create);
   router.put("/:id", auth, ctrl.update);

   module.exports = router;
   ```

2. **Registrar** en `backend/src/routes/index.js`:
   ```js
   router.use("/nombre-plural", require("./nombre.routes"));
   ```

## authMiddleware

- Archivo: `backend/src/middlewares/auth.middleware.js`
- Valida el JWT del header `Authorization: Bearer <token>`.
- Inyecta `req.user = { id, role }`.
- Devuelve `401` si el token falta o es inválido.
- Uso: `router.use(authMiddleware)` para proteger todas las rutas del fichero, o `router.get("/ruta", authMiddleware, ctrl.fn)` por ruta individual.

## Validaciones

- Los validadores se definen en `backend/src/utils/validators.js` con `express-validator`.
- El middleware `validate` (`backend/src/middlewares/validate.middleware.js`) recoge los errores y devuelve `400` con array de mensajes.
- Patrón: `router.post("/", validateBodyFn, validate, ctrl.create)`.

## Manejo de errores global

- `backend/src/middlewares/errorHandler.middleware.js` captura cualquier error pasado a `next(err)`.
- Devuelve `500` con `{ message: err.message }` en dev, mensaje genérico en prod.
- **Nunca** manejar el error directamente en el controller salvo para respuestas de negocio (403, 404, etc.).

## Autenticación — utils

- `backend/src/utils/jwt.js` — `signToken(payload)`, `verifyToken(token)`
- `backend/src/utils/bcrypt.js` — `hashPassword(plain)`, `comparePassword(plain, hash)`

## Ejemplo completo de ruta REST mínima

```js
// routes/item.routes.js
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/item.controller");

router.get("/", auth, ctrl.getAll); // GET  /api/items
router.get("/:id", auth, ctrl.getById); // GET  /api/items/:id
router.post("/", auth, ctrl.create); // POST /api/items

module.exports = router;
```
