// src/composables/useLoadingTimer.js
export function useLoadingTimer(loadingRef, minMs = 2000) {
  const withMinTime = async (loadFn) => {
    loadingRef.value = true;
    const startTime = Date.now();

    try {
      // 1. Ejecutamos la carga real
      await loadFn();
    } catch (error) {
      console.error("Error en la carga:", error);
    } finally {
      // 2. Calculamos cuánto tiempo ha pasado
      const duration = Date.now() - startTime;
      const remaining = minMs - duration;

      // 3. Si ha cargado muy rápido, esperamos lo que falte
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
      
      loadingRef.value = false;
    }
  };

  return { withMinTime };
}