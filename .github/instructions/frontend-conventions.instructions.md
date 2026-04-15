---
description: "Convenciones del frontend de LudoScript (Vue 3 + Pinia + Tailwind): patrón de store, servicio Axios, cómo añadir rutas y menú, componentes reutilizables existentes. Usa cuando: nuevo componente Vue, nuevo store Pinia, nuevo servicio API, añadir ruta o menú."
applyTo: "ludoScript/src/**"
---

# Convenciones del frontend — LudoScript

## Stack

- **Vue 3** con `<script setup>` (Composition API)
- **Pinia** para estado global
- **Tailwind CSS** para estilos (clases utilitarias directamente en template)
- **PrimeVue** para componentes UI complejos (iconos: `pi pi-…`)
- **Vue Router** con rutas que requieren `meta: { requiresAuth: true }`

## Instancia Axios

`src/api/axios.js` exporta `api` (default).

- `baseURL`: `VITE_API_URL` en `.env` o `/api` como fallback.
- Interceptor de **request**: añade `Authorization: Bearer <token>` desde `localStorage`.
- Interceptor de **response**: redirige a `/login-view/` en `401` (excepto endpoints de auth).
- **Siempre** importar `api` desde `@/api/axios` en los servicios.

## Patrón de servicio API

Un fichero por recurso en `src/api/`:

```js
// src/api/example.service.js
import api from "@/api/axios";

export const exampleService = {
  getAll: () => api.get("/examples"),
  getById: (id) => api.get(`/examples/${id}`),
  create: (data) => api.post("/examples", data),
  update: (id, d) => api.put(`/examples/${id}`, d),
  remove: (id) => api.delete(`/examples/${id}`),
};
```

## Patrón de store Pinia

Setup store con `loading`, `error`, `clearError()`. Las acciones devuelven el dato útil o `null` en error.

```js
// src/stores/example.store.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { exampleService } from "@/api/example.service";

export const useExampleStore = defineStore("example", () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  function clearError() {
    error.value = null;
  }

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await exampleService.getAll();
      items.value = data;
      return data;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al cargar.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { items, loading, error, clearError, fetchAll };
});
```

## Patrón de vista (View)

Las vistas tienen la estructura `Header > main > Footer` y viven en `src/views/`:

```vue
<template>
  <div class="h-screen flex flex-col">
    <header><Header /></header>
    <main class="flex-1 min-h-0 overflow-y-auto">
      <MiComponente />
    </main>
    <footer><Footer /></footer>
  </div>
</template>

<script setup>
import Header from "@/components/shared/Header.vue";
import Footer from "@/components/shared/Footer.vue";
import MiComponente from "@/components/dominio/MiComponente.vue";
</script>
```

## Añadir una nueva ruta

Editar `src/router/router.js`:

```js
import MiView from "@/views/MiView.vue";

// Dentro del array de routes:
{ path: "/mi-ruta/", name: "mi-ruta", component: MiView, meta: { requiresAuth: true } }
```

Las rutas públicas no llevan `meta.requiresAuth`.

## Añadir ítem al menú lateral

Editar `src/components/shared/Menu.vue` — añadir objeto al array de items:

```js
{ label: "Mi sección", icon: "pi pi-icon-name", route: "/mi-ruta/" }
```

Los iconos disponibles son de PrimeIcons (`pi pi-…`). Ver [https://primevue.org/icons/](https://primevue.org/icons/).

## Componentes reutilizables existentes

| Componente      | Ubicación                             | Uso                                                                |
| --------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `ConfirmModal`  | `components/clase/ConfirmModal.vue`   | Modal de confirmación genérica (title, message, @confirm, @cancel) |
| `TransferModal` | `components/clase/TransferModal.vue`  | Selector de miembro para acciones de transferencia                 |
| `Header`        | `components/shared/Header.vue`        | Cabecera global con avatar y nav                                   |
| `Footer`        | `components/shared/Footer.vue`        | Pie de página para vistas autenticadas                             |
| `FooterNoLogin` | `components/shared/FooterNoLogin.vue` | Pie para vistas públicas                                           |
| `Menu`          | `components/shared/Menu.vue`          | Menú lateral de navegación                                         |

## Stores existentes

| Store                 | Archivo                | Estado principal                                   |
| --------------------- | ---------------------- | -------------------------------------------------- |
| `useAuthStore`        | `auth.store.js`        | `user`, `userData`, `token`, `ready`, `isLoggedIn` |
| `useRewardsStore`     | `rewards.store.js`     | `streak`, `claimed`, `todayReward`                 |
| `useGroupStore`       | `group.store.js`       | `group`, `stats`, `isMember`, `isOwner`            |
| `useEquipmentStore`   | `equipment.store.js`   | `equipped`, `selectedSlot`, `itemPool`             |
| `useTransactionStore` | `transaction.store.js` | `coins` (computed desde authStore)                 |
| `useMultiplayerStore` | `multiplayer.store.js` | `status`, `players`, `currentQuestion`             |
| `useUserStore`        | `user.store.js`        | `users`, `current`                                 |
| `useShopStore`        | `shop.store.js`        | `searchQuery`, `selectedCategories`                |

## Alias de rutas

El alias `@` apunta a `ludoScript/src/`. Usar siempre `@/...` en imports en lugar de rutas relativas.

## Convenciones clave

- `<script setup>` siempre. No usar Options API.
- Lógica reutilizable en composables (`src/composables/useXxx.js`).
- No usar `async` en `<script setup>` — usar `onMounted` para cargas iniciales.
- Los errores de API se leen con `e.response?.data?.message ?? "Mensaje de fallback"`.
- El usuario autenticado se obtiene de `useAuthStore().user` y `useAuthStore().userData`.
