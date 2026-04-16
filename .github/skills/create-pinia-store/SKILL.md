---
name: create-pinia-store
description: "**PINIA STORE SKILL** — Crea un store Pinia con el patrón Setup Store de LudoScript: loading, error, clearError, acciones que retornan null en error. USA CUANDO: el usuario pida 'crea el store', 'necesito estado global para...', 'añade el store de Pinia para...'. NO USAR PARA: crear el service Axios (usa create-api-service); crear el componente (usa nielsen-ui-design). PRODUCE: archivo `src/stores/{feature}.store.js` completo con el patrón correcto y sin los errores comunes del proyecto."
argument-hint: "Nombre del dominio/feature (ej: 'invoice'), estado que necesita (lista de datos), y acciones (operaciones CRUD u otras)"
---

# Create Pinia Store

Crea un store Pinia usando el patrón Setup Store de LudoScript, incluyendo los estados de `loading` y `error` que el proyecto exige en todos los stores.

## Cuándo se activa

- "crea el store de X"
- "necesito estado global para Y"
- "añade el store de Pinia para Z"
- Al crear una feature nueva (paso 2 del vertical, después del service)

## Procedimiento

### 1. Identificar estado y acciones

Antes de escribir código:

| Pregunta                                   | Impacto                     |
| ------------------------------------------ | --------------------------- |
| ¿Qué datos persiste este store?            | Define los `ref`/`reactive` |
| ¿Qué acciones expone?                      | Define las funciones async  |
| ¿Hay datos derivados (calculados)?         | Define los `computed`       |
| ¿El store necesita inicializarse al login? | Añadir acción `init()`      |
| ¿Comparte datos con `authStore`?           | Importar `useAuthStore`     |

---

### 2. Crear el store

Archivo: `ludoScript/src/stores/{feature}.store.js`

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { {recurso}Service } from "@/api/{recurso}.service";

export const use{Feature}Store = defineStore("{feature}", () => {
  // ── Estado ─────────────────────────────────────────────────────────
  const items = ref([]);
  const current = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // ── Getters ────────────────────────────────────────────────────────
  const hasItems = computed(() => items.value.length > 0);

  // ── Utilidades ─────────────────────────────────────────────────────
  function clearError() {
    error.value = null;
  }

  // ── Acciones ───────────────────────────────────────────────────────
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await {recurso}Service.getAll();
      items.value = data;
      return data;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al cargar.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await {recurso}Service.getById(id);
      current.value = data;
      return data;
    } catch (e) {
      error.value = e.response?.data?.message ?? "No encontrado.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await {recurso}Service.create(payload);
      items.value.push(data);
      return data;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al crear.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function update(id, payload) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await {recurso}Service.update(id, payload);
      const idx = items.value.findIndex((i) => i.id === id);
      if (idx !== -1) items.value[idx] = data;
      return data;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al actualizar.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id) {
    loading.value = true;
    error.value = null;
    try {
      await {recurso}Service.remove(id);
      items.value = items.value.filter((i) => i.id !== id);
      return true;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al eliminar.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    // Estado
    items, current, loading, error,
    // Getters
    hasItems,
    // Acciones
    clearError, fetchAll, fetchById, create, update, remove,
  };
});
```

---

### 3. Errores comunes — verificar antes de entregar

| Error                                                      | Síntoma                                               | Corrección                                  |
| ---------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| Olvidar `clearError()` en el `return`                      | El componente no puede limpiar el error               | Añadirlo al return                          |
| No devolver `null` en el `catch`                           | El componente no sabe si falló                        | `return null` en cada catch                 |
| Devolver `data` directamente sin desestructurar `{ data }` | El store guarda `{ data: [...] }` en vez de `[...]`   | `const { data } = await service.method()`   |
| No usar `finally` para `loading`                           | Loading se queda en `true` si hay error               | Siempre `finally { loading.value = false }` |
| Usar Options Store en vez de Setup Store                   | Inconsistencia con el resto de stores                 | Siempre `defineStore("id", () => { ... })`  |
| No exponer `loading` y `error`                             | El componente no puede mostrar estados de carga/error | Siempre en el `return`                      |

---

### 4. Checklist de salida

- [ ] Usa Setup Store (`() => { ... }`), no Options Store (`{ state, actions }`)
- [ ] `loading` y `error` siempre presentes y en el `return`
- [ ] `clearError()` presente y en el `return`
- [ ] Cada acción async: `loading = true` al inicio, `finally { loading = false }`
- [ ] Cada `catch`: asigna `error.value` con mensaje legible, devuelve `null`
- [ ] Las acciones que devuelven datos exitosamente devuelven el dato (no `undefined`)
- [ ] El nombre del store y el export: `useFeatureStore` / `"feature"` (camelCase, sin guiones)
- [ ] El service importado desde `@/api/{recurso}.service`
