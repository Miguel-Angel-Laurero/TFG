---
name: backend-endpoint
description: "Crea un endpoint REST completo en LudoScript: modelo Sequelize (si es nuevo) + controller + ruta + validators + servicio Axios frontend. USA CUANDO: 'crea un endpoint', 'añade una ruta', 'necesito API para...', 'crea el CRUD de...'. PRODUCE: todos los archivos necesarios en backend y frontend, registrados y listos."
---

# Backend Endpoint (modelo → controller → ruta → service)

Flujo completo para crear un endpoint REST en LudoScript, desde el modelo de base de datos hasta el servicio Axios del frontend.

## Cuándo se activa

- "crea un endpoint / ruta / API para X"
- "necesito un controller que haga Y"
- "crea el CRUD de X"
- "añade soporte backend para Z"

## Procedimiento

### 0. Análisis previo (OBLIGATORIO)

Antes de crear archivos, responder:

| Pregunta | Dónde mirar |
|----------|------------|
| ¿Ya existe modelo relacionado? | `backend/src/models/` |
| ¿Ya existe endpoint relacionado? | `backend/src/routes/` |
| ¿El recurso pertenece a un usuario? | Determina si filtrar por `userId` |
| ¿Requiere autenticación? | Determina si añadir `authMiddleware` |

### 1. Modelo Sequelize (solo si es nuevo)

Archivo: `backend/src/models/{Nombre}.model.js`

```js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const NombreModelo = sequelize.define("NombreModelo", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // ... campos del modelo
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "nombre_tabla",
  timestamps: true,
});

module.exports = NombreModelo;
```

Registrar en `backend/src/models/index.js`:
```js
const NombreModelo = require("./Nombre.model");
User.hasMany(NombreModelo, { foreignKey: "userId", onDelete: "CASCADE" });
NombreModelo.belongsTo(User, { foreignKey: "userId" });
module.exports = { ..., NombreModelo };
```

### 2. Controller

Archivo: `backend/src/controllers/{recurso}.controller.js`

Reglas obligatorias:
- Siempre `try / catch (err) { next(err) }` — nunca `throw`
- `req.user` del authMiddleware: `{ id, role }`
- Nunca devolver `password` en ninguna respuesta
- Códigos HTTP: `200` OK, `201` Created, `400` Bad data, `404` Not found

```js
const { NombreModelo } = require("../models");

exports.getAll = async (req, res, next) => {
  try {
    const items = await NombreModelo.findAll({ where: { userId: req.user.id } });
    res.json(items);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await NombreModelo.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: "No encontrado." });
    res.json(item);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await NombreModelo.create({ ...req.body, userId: req.user.id });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await NombreModelo.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: "No encontrado." });
    await item.update(req.body);
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await NombreModelo.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!item) return res.status(404).json({ message: "No encontrado." });
    await item.destroy();
    res.status(204).send();
  } catch (err) { next(err); }
};
```

### 3. Ruta

Archivo: `backend/src/routes/{recurso}.routes.js`

```js
const { Router } = require("express");
const router = Router();
const ctrl = require("../controllers/{recurso}.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");

router.use(authMiddleware);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
```

Registrar en `backend/src/routes/index.js`:
```js
router.use("/{recurso-plural}", require("./{recurso}.routes"));
```

### 4. Validators (si hay body)

En `backend/src/utils/validators.js`:
```js
exports.validateCreate{Recurso} = [
  body("campo").notEmpty().withMessage("El campo es obligatorio."),
];
```

Añadir a la ruta: `router.post("/", validateCreate{Recurso}, validate, ctrl.create);`

### 5. Servicio Axios frontend

Archivo: `ludoScript/src/api/{recurso}.service.js`

```js
import api from "@/api/axios";

export const {recurso}Service = {
  getAll: () => api.get("/{recurso-plural}"),
  getById: (id) => api.get(`/{recurso-plural}/${id}`),
  create: (data) => api.post("/{recurso-plural}", data),
  update: (id, data) => api.put(`/{recurso-plural}/${id}`, data),
  remove: (id) => api.delete(`/{recurso-plural}/${id}`),
};
```

Reglas: importar `api` desde `@/api/axios`, devolver la promesa completa, sin `try/catch`.

## Checklist de verificación

- [ ] Controller: cada método tiene `try/catch/next(err)`
- [ ] Controller: ninguna respuesta devuelve `password`
- [ ] Controller: 404 comprueba que el recurso pertenece al usuario
- [ ] Route: `authMiddleware` aplicado en rutas protegidas
- [ ] Route: registrada en `routes/index.js`
- [ ] Modelo: registrado en `models/index.js` con asociaciones
- [ ] Service: importa `api` desde `@/api/axios`
- [ ] Service: rutas coinciden con backend (mismo prefijo)
- [ ] Códigos HTTP correctos: 201 create, 204 delete, 404 not found
