---
name: frontend-composable
description: "Crea un composable Vue 3 con el/los patrones de LudoScript: async (loading/error/null), reactivo puro, integración (store+API+router) o ciclo de vida (onMounted/onUnmounted). USA CUANDO: 'crea un composable', 'necesito lógica reutilizable', 'extrae lógica a useXxx'. PRODUCE: archivo composable completo listo para importar."
---

# Frontend Composable

Crea un composable Vue 3 siguiendo los patrones del proyecto.

## Cuándo se activa

- "crea un composable para X"
- "necesito lógica reutilizable para Y"
- "extrae la lógica de Z a un composable"
- "haz un useXxx que..."

## 1. Elegir el patrón

| Patrón | Cuándo usarlo | Ejemplo real |
|--------|--------------|-------------|
| **Async** | Llama a API, store o servicio con loading/error | `useActivityReward`, `useCategoryStats` |
| **Reactivo puro** | Solo computa estado interno (refs, computed, watch) | `useAvatarSize`, `useQuizOptions` |
| **Integración** | Orquesta store + router + PrimeVue + API | `useTransaction`, `useGameExit` |
| **Ciclo de vida** | DOM events, timers, ResizeObserver, sockets | `useAvatarSize`, `useScrollDown` |

## 2. Template por patrón

### Async (el más común)

```js
import { ref, computed, onMounted } from "vue";

export function useMiComposable() {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isEmpty = computed(() => data.value && data.value.length === 0);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const { data: result } = await api.get("/ruta");
      data.value = result;
      return result;
    } catch (e) {
      error.value = e.response?.data?.message ?? "Error al cargar.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, isEmpty, load };
}
```

### Reactivo puro

```js
import { ref, computed, watch } from "vue";

export function useAvatarSize(containerRef, slotOverrides = {}) {
  const containerH = ref(300);
  const slotSize = computed(() => Math.max(40, Math.floor(containerH.value * 0.25)));

  return { slotSize };
}
```

### Integración (store + router + PrimeVue)

```js
import { useRouter } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useAuthStore } from "@/stores/auth.store";

export function useGameExit() {
  const router = useRouter();
  const confirm = useConfirm();

  function confirmExit() {
    confirm.require({
      message: "¿Seguro?",
      header: "Salir",
      accept: () => router.push("/"),
    });
  }

  return { confirmExit };
}
```

### Ciclo de vida (limpieza obligatoria)

```js
import { ref, onMounted, onUnmounted } from "vue";

export function useResizeObserver(elRef) {
  const width = ref(0);
  let ro;

  onMounted(() => {
    ro = new ResizeObserver(([entry]) => { width.value = entry.contentRect.width; });
    ro.observe(elRef.value);
  });

  onUnmounted(() => ro?.disconnect());

  return { width };
}
```

## 3. Errores comunes

| Error | Síntoma | Corrección |
|-------|---------|------------|
| Olvidar limpiar listener en `onUnmounted` | Memory leaks, dobles ejecuciones | `socket.off()`, `ro?.disconnect()`, `clearInterval()` |
| Devolver refs sin `.value` en template | El template desempaqueta automático | Devolver la `ref`, no `ref.value` |
| `onMounted` dentro de condicional | Los hooks lifecycle deben llamarse secuencialmente | Mover fuera de `if`/`for` |
| Composable async sin loading/error | Componente no sabe si está cargando | Añadir `loading` + `error` |
| Import cíclico entre composables | Runtime error | Extraer dependencia común a un tercer composable |

## Checklist

- [ ] Nombre: `useXxx` (PascalCase después de `use`)
- [ ] Archivo: `composables/useXxx.js`
- [ ] Async: `loading`, `error`, `finally { loading = false }`, `return null` en catch
- [ ] Ciclo de vida: `socket.off()` / `ro?.disconnect()` / `clear*()` en `onUnmounted`
- [ ] No hooks lifecycle dentro de condicionales
- [ ] Return explícito de solo lo necesario (tip: el componente usa `const { ... } = useXxx()`)
- [ ] Sin `console.log` de depuración
