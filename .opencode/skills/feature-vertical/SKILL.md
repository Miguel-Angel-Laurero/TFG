---
name: feature-vertical
description: "Orquesta la creación de una feature full-stack completa en LudoScript: endpoint backend → service → store → vista → componentes → ruta → menú. USA CUANDO: 'crea la feature de X completa', 'nuevo módulo de Y', 'necesito la pantalla de Z con todo'. Delega cada capa a las skills especializadas."
---

# Feature Vertical (orquestador full-stack)

Orquesta la creación de una feature completa: desde el endpoint backend hasta el menú lateral.

## Cuándo se activa

- "crea la feature completa de X"
- "nuevo módulo de Y (con todo)"
- "necesito la pantalla de Z con backend y frontend"

## Procedimiento

### 0. Análisis previo (OBLIGATORIO)

| Pregunta | Fuente |
|----------|--------|
| ¿Ya existe algún modelo relacionado? | `backend/src/models/` |
| ¿Ya existe algún endpoint relacionado? | `backend/src/routes/` |
| ¿Ya existe algún store o service relacionado? | `ludoScript/src/stores/` y `src/api/` |
| ¿La vista es accesible sin autenticación? | Determina `meta: { requiresAuth }` |
| ¿Necesita entrada en el menú lateral? | Si es sección principal |

### 1. Plan de archivos

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
  ludoScript/src/router/router.js                ← añadir ruta
  [ludoScript/src/components/shared/Menu.vue]    ← si entra en el menú
```

### 2. Backend → skill `backend-endpoint`

Crear en orden: modelo → controller → ruta → validators.

### 3. Service API

Crear `ludoScript/src/api/{feature}.service.js` con las llamadas Axios correspondientes a los endpoints.

### 4. Store Pinia → skill `frontend-store`

Crear `ludoScript/src/stores/{feature}.store.js` importando el service.

### 5. Vista y componentes

Estructura de la vista:
```vue
<template>
  <div class="h-screen flex flex-col">
    <header><Header /></header>
    <main class="flex-1 min-h-0 overflow-y-auto"><FeatureMain /></main>
    <footer><Footer /></footer>
  </div>
</template>
<script setup>
import Header from "@/components/shared/Header.vue";
import Footer from "@/components/shared/Footer.vue";
import FeatureMain from "@/components/feature/FeatureMain.vue";
</script>
```

Componentes del dominio en `ludoScript/src/components/{feature}/`.

### 6. Router y menú

Router (`ludoScript/src/router/router.js`):
```js
import FeatureView from "@/views/FeatureView.vue";
{ path: "/feature-view/", name: "feature", component: FeatureView, meta: { requiresAuth: true } }
```

Menú (`ludoScript/src/components/shared/Menu.vue`):
```js
{ label: "Nombre visible", icon: "pi pi-icono", route: "/feature-view/" }
```

### 7. Checklist de integración

- [ ] Endpoint backend responde correctamente
- [ ] Service Axios apunta a la misma ruta que el backend
- [ ] Store importa el service correcto
- [ ] Vista usa `onMounted` para carga inicial, no `async setup`
- [ ] Estados loading/error del store reflejados visualmente
- [ ] Ruta registrada con guard correcto
- [ ] Menú con icono PrimeVue válido (`pi pi-*`)
- [ ] Sin `console.log` de depuración en archivos finales
