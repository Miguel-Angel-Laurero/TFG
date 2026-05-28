---
name: debug
description: "Metodología sistemática para diagnosticar y resolver errores en backend (Node/Express/Sequelize) o frontend (Vue/Pinia/Axios). USA CUANDO: stack trace, error 500, componente no renderiza, store no actualiza, llamada API falla. PRODUCE: diagnóstico de causa raíz + fix aplicado."
---

# Debug (backend + frontend unificado)

Metodología de diagnóstico organizada por capa. Determina primero si el error es backend o frontend, luego aplica la sección correspondiente.

## Clasificación rápida

| Síntoma | Capa | Ir a |
|---------|------|------|
| Stack trace en terminal del servidor | Backend | Sección 1 |
| `Sequelize*Error` | Backend | Sección 1 |
| Respuesta 500 desde API | Backend | Sección 1 |
| Error en consola del navegador | Frontend | Sección 2 |
| Componente no se renderiza | Frontend | Sección 2 |
| Store no actualiza / reactividad rota | Frontend | Sección 2 |
| 401/404/400 en Network tab | Frontend | Sección 2D |

---

## Sección 1: Debug Backend

### Errores de Sequelize frecuentes

| Error | Causa más probable |
|-------|-------------------|
| `SequelizeValidationError` | Campo `allowNull: false` sin valor |
| `SequelizeUniqueConstraintError` | Valor duplicado en campo `unique: true` |
| `SequelizeForeignKeyConstraintError` | FK apunta a registro inexistente |
| `SequelizeConnectionError` | DB no disponible o credenciales incorrectas |
| `SequelizeDatabaseError: Unknown column` | Modelo tiene campo no existente en tabla → reiniciar servidor para `sync({ alter: true })` |

### Clasificación por capa

| Capa | Síntoma | Archivos a revisar |
|------|---------|-------------------|
| Auth middleware | `401`/`403` inesperado | `auth.middleware.js`, header `Authorization` |
| Validator | `400` con array de errores | `validators.js` |
| Controller | `500` con stack en `src/controllers/` | El controller específico |
| Modelo/Query | Error de Sequelize | El modelo y sus constraints |
| Route | `404 Cannot GET/POST /api/xxx` | `routes/index.js` |

### Fixes más frecuentes

```js
// ❌ Acceso a null sin guard
const item = await Model.findOne({ where: { id } });
item.update(data); // Error si item es null

// ✅ Guard explícito
if (!item) return res.status(404).json({ message: "No encontrado." });
await item.update(data);
```

```js
// ❌ Password expuesto
res.json(user);

// ✅ Excluir campo sensible
const { password, ...safe } = user.toJSON();
res.json(safe);
```

```js
// ❌ Ruta no registrada en routes/index.js
// ❌ authMiddleware no aplicado
router.get("/datos", ctrl.getDatos); // req.user es undefined

// ✅
router.get("/datos", authMiddleware, ctrl.getDatos);
```

---

## Sección 2: Debug Frontend

### 2A: Vue warnings / props

| Warning | Causa | Fix |
|---------|-------|-----|
| `Missing required prop` | Prop no pasada al componente | Pasar la prop o hacerla opcional |
| `Invalid prop type` | Tipo incorrecto | Revisar store vs tipo declarado |

### 2B: Componente no monta

1. ¿Error de importación en consola?
2. ¿`v-if="data"` y `data` es `null` al inicio?
3. ¿La ruta existe en `router.js`?
4. ¿El guard `requiresAuth` falla y redirige a login?

### 2C: Reactividad rota

```js
// ❌ Desestructurar store sin storeToRefs
const { items } = store; // pierde reactividad

// ✅
import { storeToRefs } from "pinia";
const { items } = storeToRefs(store);
const { fetchAll } = store; // acciones directas, sin storeToRefs
```

```js
// ❌ async en <script setup> bloquea mounting
const data = await store.fetchAll();

// ✅
onMounted(async () => { await store.fetchAll(); });
```

### 2D: Errores de red (Axios)

| Código | Causa en LudoScript | Fix |
|--------|---------------------|-----|
| `401` | Token expirado o no enviado | Verificar localStorage, interceptor redirige automáticamente |
| `403` | Recurso no pertenece al usuario | Revisar `where: { userId: req.user.id }` en controller |
| `404` | Ruta no registrada o path incorrecto | Comparar `routes/index.js` con URL del service |
| `400` | Validators rechazaron body | Ver array de errores en respuesta |
| `CORS` | Backend no permite origen | Verificar proxy Vite o `VITE_API_URL` |

### 2E: Vue Router

```js
// Rutas deben terminar en "/"
{ path: "/mi-feature-view/", ... }  // ✅
{ path: "/mi-feature-view", ... }   // puede fallar
```

## Checklist tras el fix

- [ ] El error desaparece completamente
- [ ] No se introdujeron nuevos warnings/errores
- [ ] Si se modificó modelo: reiniciar servidor para `sync({ alter: true })`
- [ ] Si es frontend: probar estados loading, datos, vacío, error
