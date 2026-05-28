---
name: frontend-store
description: "Crea un store Pinia con el patrón Setup Store de LudoScript: loading, error, clearError, acciones que retornan null en error. USA CUANDO: 'crea el store', 'necesito estado global para...', 'añade Pinia para...'. PRODUCE: archivo store completo listo para usar."
---

# Frontend Store (Pinia Setup Store)

Crea un store Pinia usando el patrón obligatorio de LudoScript.

## Cuándo se activa

- "crea el store de X"
- "necesito estado global para Y"
- "añade el store de Pinia para Z"

## Procedimiento

### 1. Identificar estado y acciones

| Pregunta | Impacto |
|----------|---------|
| ¿Qué datos persiste? | Define los `ref`/`reactive` |
| ¿Qué acciones expone? | Define funciones async |
| ¿Hay datos derivados? | Define `computed` |
| ¿Necesita inicialización al login? | Añadir `init()` |
| ¿Comparte datos con `authStore`? | Importar `useAuthStore` |

### 2. Crear el store

Archivo: `ludoScript/src/stores/{feature}.store.js`

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { recursoService } from "@/api/recurso.service";

export const useFeatureStore = defineStore("feature", () => {
  const items = ref([]);
  const current = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const hasItems = computed(() => items.value.length > 0);

  function clearError() { error.value = null; }

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await recursoService.getAll();
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
      const { data } = await recursoService.getById(id);
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
      const { data } = await recursoService.create(payload);
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
      const { data } = await recursoService.update(id, payload);
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
      await recursoService.remove(id);
      items.value = items.value.filter((i) => i.id !== id);
      return true;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al eliminar.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { items, current, loading, error, hasItems, clearError, fetchAll, fetchById, create, update, remove };
});
```

### 3. Errores comunes a evitar

| Error | Síntoma | Corrección |
|-------|---------|------------|
| Olvidar `clearError()` en el `return` | Componente no puede limpiar error | Añadir al return |
| No devolver `null` en catch | Componente no sabe si falló | `return null` |
| Devolver `data` sin desestructurar `{ data }` | Store guarda `{ data: [...] }` | `const { data } = await service.method()` |
| No usar `finally` para `loading` | Loading se queda en `true` | `finally { loading.value = false }` |
| Options Store en vez de Setup Store | Inconsistencia | Siempre `defineStore("id", () => { ... })` |

## Checklist

- [ ] Setup Store (`() => { ... }`), no Options Store
- [ ] `loading` y `error` en el `return`
- [ ] `clearError()` en el `return`
- [ ] Cada acción: `loading = true` al inicio, `finally { loading = false }`
- [ ] Cada catch: `error.value` con mensaje, devuelve `null`
- [ ] Nombre: `useFeatureStore` / `"feature"` (camelCase)
- [ ] Service importado desde `@/api/{recurso}.service`
