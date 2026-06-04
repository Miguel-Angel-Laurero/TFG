---
name: frontend-store
description: "Crea un store Pinia con el patrón Setup Store de LudoScript: loading, error, clearError, acciones que retornan null en error. USA CUANDO: 'crea el store', 'necesito estado global para...', 'añade Pinia para...'. PRODUCE: archivo store completo listo para usar."
---

# Frontend Store (Pinia Setup Store)

Crea un store Pinia usando el patrón obligatorio de LudoScript.
**Patrón completo disponible en `frontend-conventions.md → "Patrón de store Pinia"`**.

> ⚠ Referencia obligatoria: leer `frontend-conventions.md` antes de codificar. Este skill solo documenta los errores comunes.

## Cuándo se activa

- "crea el store de X"
- "necesito estado global para Y"
- "añade el store de Pinia para Z"

## Procedimiento

### 1. Identificar estado y acciones

| Pregunta | Impacto |
|----------|---------|
| ¿Qué datos persiste? | `ref` / `reactive` |
| ¿Qué acciones expone? | funciones `async` |
| ¿Datos derivados? | `computed` |
| ¿Init al login? | método `init()` |
| ¿Comparte con `authStore`? | importar `useAuthStore` |

### 2. Crear el store

Archivo: `ludoScript/src/stores/{feature}.store.js`

Template mínimo (ver `frontend-conventions.md` para el completo):

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { featureService } from "@/api/feature.service";

export const useFeatureStore = defineStore("feature", () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  function clearError() { error.value = null; }

  async function fetchAll() {
    loading.value = true; error.value = null;
    try {
      const { data } = await featureService.getAll();
      items.value = data; return data;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al cargar."; return null;
    } finally { loading.value = false; }
  }

  return { items, loading, error, clearError, fetchAll };
});
```

### 3. Errores comunes

| Error | Síntoma | Corrección |
|-------|---------|------------|
| Olvidar `clearError()` en return | Componente no puede limpiar error | Añadir al return |
| No devolver `null` en catch | Componente no sabe si falló | `return null` |
| Devolver `data` sin desestructurar | Store guarda `{ data: [...] }` | `const { data } = await ...` |
| Sin `finally` para loading | Loading se queda en `true` | `finally { loading.value = false }` |
| Options en vez de Setup Store | Inconsistencia | `defineStore("id", () => { ... })` |

## Checklist

- [ ] Setup Store (`() => { ... }`), no Options Store
- [ ] `loading`, `error` y `clearError()` en return
- [ ] Cada acción: `try/catch/finally` con `loading`, `return null` en catch
- [ ] Nombre: `useFeatureStore` / `"feature"` (camelCase)
- [ ] Service importado desde `@/api/{recurso}.service`
