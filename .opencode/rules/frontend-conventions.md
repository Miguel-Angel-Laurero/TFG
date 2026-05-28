# Convenciones del frontend — LudoScript

## Stack y reglas base

- Vue 3 con `<script setup>` (Composition API). **NUNCA Options API.**
- Pinia Setup Stores para estado global.
- Tailwind CSS (clases utilitarias) + PrimeVue 4 (componentes UI, iconos `pi pi-*`).
- Dark theme: `bg-gray-900`, `bg-gray-800`, texto `text-white`/`text-gray-300`.
- Alias `@` → `ludoScript/src/`. Usar siempre `@/...` en imports.
- No usar `async` directamente en `<script setup>` — usar `onMounted`.

## Instancia Axios

`src/api/axios.js` exporta `api` (default):
- `baseURL`: `VITE_API_URL` o `/api` como fallback.
- Interceptor request: añade `Authorization: Bearer <token>`.
- Interceptor response: redirige a `/login-view/` en `401`.
- **Siempre** importar `api` desde `@/api/axios`.

## Patrón de servicio API

```js
import api from "@/api/axios";

export const recursoService = {
  getAll: () => api.get("/recursos"),
  getById: (id) => api.get(`/recursos/${id}`),
  create: (data) => api.post("/recursos", data),
  update: (id, data) => api.put(`/recursos/${id}`, data),
  remove: (id) => api.delete(`/recursos/${id}`),
};
```

Reglas: devolver la promesa completa (no desestructurar `.data`), sin `try/catch` en el service.

## Patrón de store Pinia (Setup Store)

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useExampleStore = defineStore("example", () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  function clearError() { error.value = null; }

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

Obligatorio: `loading`, `error`, `clearError()` en todos los stores. Acciones devuelven `data` o `null`.

## Patrón de vista (View)

```vue
<template>
  <div class="h-screen flex flex-col">
    <header><Header /></header>
    <main class="flex-1 min-h-0 overflow-y-auto"><MiComponente /></main>
    <footer><Footer /></footer>
  </div>
</template>
<script setup>
import Header from "@/components/shared/Header.vue";
import Footer from "@/components/shared/Footer.vue";
import MiComponente from "@/components/dominio/MiComponente.vue";
</script>
```

## Añadir ruta

En `src/router/router.js`:
```js
import MiView from "@/views/MiView.vue";
{ path: "/mi-ruta/", name: "mi-ruta", component: MiView, meta: { requiresAuth: true } }
```

## Añadir ítem al menú

En `src/components/shared/Menu.vue`, añadir al array:
```js
{ label: "Mi sección", icon: "pi pi-icon-name", route: "/mi-ruta/" }
```

## Consumo correcto de stores en componentes

```js
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth.store";

const store = useAuthStore();
const { items, loading, error } = storeToRefs(store);  // estado reactivo
const { fetchAll, clearError } = store;                 // acciones directas
```

## Errores API en componentes

```js
const result = await store.create(payload);
if (!result) {
  toast.add({ severity: "error", summary: store.error, life: 3000 });
  return;
}
// éxito — usar result
```

## Componentes reutilizables existentes

| Componente | Ubicación | Uso |
|---|---|---|
| `Header` | `components/shared/Header.vue` | Cabecera global con avatar y nav |
| `Footer` | `components/shared/Footer.vue` | Pie para vistas autenticadas |
| `FooterNoLogin` | `components/shared/FooterNoLogin.vue` | Pie para vistas públicas |
| `Menu` | `components/shared/Menu.vue` | Menú lateral de navegación |
| `ConfirmModal` | `components/clase/ConfirmModal.vue` | Modal de confirmación genérica |

## Sistema de composables de quiz — interdependencias

Los composables del quiz son interdependientes. Leer `useQuizController.js` antes de modificar cualquiera:

| Composable | Responsabilidad |
|---|---|
| `useQuizController` | Máquina de estados del quiz |
| `useQuizLoader` | Carga el pool de preguntas |
| `useAdaptiveSelection` | Prioriza categorías débiles |
| `useAdaptiveHistory` | Umbral de partidas para modo adaptativo |
| `useActivitySession` | Ciclo de vida genérico |
| `useActivityReward` | Calcula monedas/XP |
| `useCategoryStats` | Estadísticas por categoría |
