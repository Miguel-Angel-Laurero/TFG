---
name: debug-backend
description: "**DEBUG BACKEND SKILL** — Metodología sistemática para diagnosticar y resolver errores en Node.js/Express/Sequelize. USA CUANDO: el usuario pegue un stack trace de backend, un error 500, un error de Sequelize, un problema de autenticación JWT, o diga 'el endpoint no funciona', 'me da error en el servidor'. NO USAR PARA: errores en consola del navegador o en componentes Vue (usa debug-frontend). PRODUCE: diagnóstico de la causa raíz + fix aplicado directamente en el código."
argument-hint: "Pega el stack trace completo, el código del controller o middleware afectado, y los pasos para reproducir el error"
---

# Debug Backend

Metodología de 5 pasos para localizar y resolver errores en la capa Node.js/Express/Sequelize de LudoScript, sin adivinar.

## Cuándo se activa

- Stack trace en la consola del servidor (terminal `npm run dev`)
- Respuesta `500` o inesperada desde el backend
- Error de Sequelize (`SequelizeValidationError`, `SequelizeUniqueConstraintError`, etc.)
- Error de JWT/autenticación (`JsonWebTokenError`, `401`, `403`)
- Comportamiento incorrecto silencioso (devuelve datos erróneos sin lanzar error)

## Procedimiento

### 1. Leer el stack trace

Identificar en el stack trace:

- **El mensaje de error** (primera línea)
- **El archivo y línea** donde ocurrió (normalmente las primeras líneas que referencian `backend/src/`)
- **Si es un error de Sequelize**: qué query falló y por qué

**Errores de Sequelize frecuentes:**

| Error                                    | Causa más probable                                                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `SequelizeValidationError`               | Campo `allowNull: false` sin valor, o constraint violado                                                                   |
| `SequelizeUniqueConstraintError`         | Valor duplicado en campo con `unique: true`                                                                                |
| `SequelizeForeignKeyConstraintError`     | FK apunta a registro que no existe                                                                                         |
| `SequelizeConnectionError`               | DB no disponible o credenciales incorrectas                                                                                |
| `SequelizeDatabaseError: Unknown column` | El modelo tiene un campo que no existe en la tabla → solución: reiniciar servidor para que `sync({ alter: true })` lo cree |

---

### 2. Identificar la capa

Clasifica dónde ocurre el error:

| Capa                   | Síntoma                                      | Archivos a revisar                                          |
| ---------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| **Middleware de auth** | `401`/`403` inesperado, `req.user` undefined | `auth.middleware.js`, header `Authorization` en la petición |
| **Validator**          | `400` con array de errores                   | `validators.js`, el campo que falla                         |
| **Controller**         | `500` con stack en `src/controllers/`        | El controller específico, la línea del stack                |
| **Modelo/Query**       | Error de Sequelize                           | El modelo y sus constraints                                 |
| **Route**              | `404 Cannot GET/POST /api/xxx`               | `routes/index.js`, el archivo de rutas del recurso          |
| **Global**             | `500` sin contexto claro                     | `errorHandler.middleware.js`                                |

---

### 3. Leer el código afectado

Leer el archivo y la línea exacta del stack trace. Antes de proponer cualquier fix:

- ¿Está el `try/catch/next(err)` correctamente aplicado?
- ¿El campo que se accede existe en el modelo Sequelize?
- ¿Se usa `req.user.id` pero la ruta no tiene `authMiddleware`?
- ¿El `findOne`/`findAll` tiene los `where` correctos?
- ¿Se accede a una propiedad de un objeto que puede ser `null`?

---

### 4. Formular y aplicar el fix

Máximo 3 hipótesis ordenadas por probabilidad. Aplicar la más probable primero.

**Fixes más frecuentes en este proyecto:**

```js
// ❌ Acceso a propiedad de null sin guard
const item = await Model.findOne({ where: { id } });
item.update(data); // Error si item es null

// ✅ Guard explícito
if (!item) return res.status(404).json({ message: "No encontrado." });
await item.update(data);
```

```js
// ❌ Campo no incluido en el return del modelo
res.json(user); // Incluye password

// ✅ Excluir campo sensible
const { password, ...safe } = user.toJSON();
res.json(safe);
```

```js
// ❌ Ruta no registrada
// En routes/index.js falta:
router.use("/recursos", require("./recurso.routes"));
```

```js
// ❌ authMiddleware no aplicado en la ruta
router.get("/datos", ctrl.getDatos); // req.user es undefined

// ✅
router.get("/datos", authMiddleware, ctrl.getDatos);
```

---

### 5. Verificar

Después de aplicar el fix:

- [ ] El servidor arranca sin errores en consola
- [ ] La petición que fallaba ahora devuelve el código HTTP correcto
- [ ] El fix no introduce una regresión en otras rutas del mismo controller
- [ ] Si se modificó un modelo: reiniciar el servidor para que `sync({ alter: true })` aplique el cambio
- [ ] El stack trace desaparece completamente (no hay un error distinto en el mismo flujo)
