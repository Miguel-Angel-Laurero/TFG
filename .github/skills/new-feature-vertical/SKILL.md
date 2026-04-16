---
name: new-feature-vertical
description: "**FEATURE VERTICAL SKILL** — Orquesta la creación de una feature completa full-stack en LudoScript: backend endpoint → service → store → componentes → ruta → menú. USA CUANDO: el usuario pida 'crea la feature de X completa', 'nuevo módulo de Y', 'necesito la pantalla de Z con todo'. NO USAR PARA: añadir solo un endpoint (usa new-backend-endpoint); añadir solo un store (usa create-pinia-store). PRODUCE: plan de archivos ordenado + delega la implementación de cada capa al skill correspondiente."
argument-hint: "Nombre de la feature, descripción de qué hace, qué datos gestiona y si necesita nueva entrada en el menú lateral"
---

# New Feature Vertical

Orquesta la creación completa de una feature full-stack: desde el endpoint backend hasta el menú lateral, delegando cada capa al skill especializado correspondiente.

## Cuándo se activa

- "crea la feature completa de X"
- "nuevo módulo de Y (con todo)"
- "necesito la pantalla de Z con backend y frontend"
- Cualquier petición que implique tocar backend **y** frontend para un nuevo dominio

## Procedimiento

### 0. Análisis previo (OBLIGATORIO antes de crear archivos)

Responde estas preguntas analizando el código existente:

| Pregunta                                              | Fuente                                         |
| ----------------------------------------------------- | ---------------------------------------------- |
| ¿Ya existe algún modelo relacionado?                  | `backend/src/models/`                          |
| ¿Ya existe algún endpoint relacionado?                | `backend/src/routes/`                          |
| ¿Ya existe algún store o service relacionado?         | `ludoScript/src/stores/` y `src/api/`          |
| ¿La vista es accesible para usuarios no autenticados? | Determina si necesita `meta: { requiresAuth }` |
| ¿Necesita entrada en el menú lateral?                 | Si es una sección principal de la app          |

---

### 1. Plan de archivos

Genera una lista de todos los archivos a crear/modificar antes de empezar:

```
CREAR:
  backend/src/controllers/{feature}.controller.js
  backend/src/routes/{feature}.routes.js
  [backend/src/models/{Feature}.model.js]       ← solo si modelo nuevo
  ludoScript/src/api/{feature}.service.js
  ludoScript/src/stores/{feature}.store.js
  ludoScript/src/views/{Feature}View.vue
  ludoScript/src/components/{feature}/{Componente}.vue

MODIFICAR:
  backend/src/routes/index.js                    ← registrar ruta
  [backend/src/models/index.js]                  ← si modelo nuevo
  [backend/src/utils/validators.js]              ← si hay validaciones
  ludoScript/src/router/router.js                ← añadir ruta
  [ludoScript/src/components/shared/Menu.vue]    ← si entra en el menú
```

Confirmar el plan con el usuario antes de implementar si hay dudas sobre el alcance.

---

### 2. Backend — aplicar skill `new-backend-endpoint`

Crear el endpoint siguiendo el patrón del skill dedicado.

**Orden obligatorio:**

1. Modelo (si es nuevo) → registrar en `models/index.js`
2. Controller
3. Route → registrar en `routes/index.js`
4. Validators (si hay POST/PUT con body)

---

### 3. Service API — aplicar skill `create-api-service`

Crear `ludoScript/src/api/{feature}.service.js` con las llamadas Axios.

Los métodos del service deben corresponder exactamente a los endpoints creados en el paso anterior.

---

### 4. Store Pinia — aplicar skill `create-pinia-store`

Crear `ludoScript/src/stores/{feature}.store.js` importando el service del paso anterior.

---

### 5. Vista y componentes — aplicar skill `nielsen-ui-design`

**Estructura de la vista** (`ludoScript/src/views/{Feature}View.vue`):

```vue
<template>
  <div class="h-screen flex flex-col">
    <header><Header /></header>
    <main class="flex-1 min-h-0 overflow-y-auto"><{Feature}Main /></main>
    <footer><Footer /></footer>
  </div>
</template>

<script setup>
import Header from "@/components/shared/Header.vue";
import Footer from "@/components/shared/Footer.vue";
import {Feature}Main from "@/components/{feature}/{Feature}Main.vue";
</script>
```

Los componentes del dominio van en `ludoScript/src/components/{feature}/`.

Cada componente aplica Nielsen: loading skeleton, estado vacío descriptivo, mensajes de error en lenguaje humano.

---

### 6. Router y menú

**Añadir ruta** en `ludoScript/src/router/router.js`:

```js
import {Feature}View from "@/views/{Feature}View.vue";

{ path: "/{feature}-view/", name: "{feature}", component: {Feature}View, meta: { requiresAuth: true } }
```

**Añadir al menú** (si procede) en `ludoScript/src/components/shared/Menu.vue`:

```js
{ label: "Nombre visible", icon: "pi pi-icono", route: "/{feature}-view/" }
```

---

### 7. Checklist de integración final

- [ ] El endpoint backend responde correctamente (probar con Postman o curl)
- [ ] El service Axios apunta a la misma ruta que el backend
- [ ] El store importa el service y usa el mismo nombre de método
- [ ] La vista usa `onMounted` para la carga inicial, no `async setup`
- [ ] Los estados loading/error del store se reflejan visualmente en el componente
- [ ] La ruta está registrada en `router.js` con el guard correcto
- [ ] Si hay entrada en el menú, el icono `pi pi-*` existe en PrimeVue
- [ ] No hay `console.log` de depuración en los archivos entregados
