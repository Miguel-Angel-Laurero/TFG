# Convenciones del backend — LudoScript

## Patrón de controller

Todos los controllers usan **try / catch / next(err)**. Nunca lanzan directamente.

```js
const { ModelName } = require("../models");

exports.myAction = async (req, res, next) => {
  try {
    const userId = req.user.id; // inyectado por authMiddleware
    const { param } = req.params;
    const { field } = req.body;

    const record = await ModelName.findByPk(param);
    if (!record) return res.status(404).json({ message: "No encontrado" });

    res.json(record);
  } catch (err) {
    next(err);
  }
};
```

- `req.user` tiene: `id`, `role` (inyectado por `authMiddleware`).
- Códigos HTTP: `200` OK, `201` Created, `400` Bad data, `401` Unauth, `403` Forbidden, `404` Not found.
- Nunca devolver `password` — usar `attributes: { exclude: ["password"] }` o desestructurar.
- Si el recurso pertenece al usuario, filtrar siempre: `where: { userId: req.user.id }`.

## Registrar un nuevo modelo Sequelize

1. Crear `backend/src/models/NombreModelo.model.js` con `sequelize.define(...)`.
2. Añadir en `backend/src/models/index.js`:
   ```js
   const NombreModelo = require("./NombreModelo.model");
   // Asociaciones:
   User.hasMany(NombreModelo, { foreignKey: "userId", onDelete: "CASCADE" });
   NombreModelo.belongsTo(User, { foreignKey: "userId" });
   module.exports = { sequelize, ..., NombreModelo };
   ```
3. `sequelize.sync({ alter: true })` crea/actualiza la tabla al arrancar en dev.

## Registrar una nueva ruta

1. Crear `backend/src/routes/nombre.routes.js`:
   ```js
   const router = require("express").Router();
   const auth = require("../middlewares/auth.middleware");
   const ctrl = require("../controllers/nombre.controller");
   router.get("/", auth, ctrl.getAll);
   router.post("/", auth, ctrl.create);
   module.exports = router;
   ```
2. Registrar en `backend/src/routes/index.js`:
   ```js
   router.use("/nombre-plural", require("./nombre.routes"));
   ```

## authMiddleware

- Archivo: `backend/src/middlewares/auth.middleware.js`
- Valida JWT del header `Authorization: Bearer <token>`.
- Inyecta `req.user = { id, role }`. Devuelve `401` si falta o es inválido.

## Validaciones

- Definir en `backend/src/utils/validators.js` con `express-validator`.
- Middleware `validate` (en `middlewares/validate.middleware.js`) devuelve `400` con array de errores.
- Patrón: `router.post("/", validateBodyFn, validate, ctrl.create)`.

## Manejo de errores global

- `backend/src/middlewares/errorHandler.middleware.js` captura `next(err)`.
- `500` con `{ message: err.message }` en dev, mensaje genérico en prod.

## Auth utils

- `backend/src/utils/jwt.js` — `signToken(payload)`, `verifyToken(token)`
- `backend/src/utils/bcrypt.js` — `hashPassword(plain)`, `comparePassword(plain, hash)`
