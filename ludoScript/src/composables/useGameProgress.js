import { ref } from 'vue';

// Definimos el estado fuera de la función para que todos los que lo usen compartan el mismo valor
const globalProgress = ref(0);

export function useGameProgress() {
    const updateProgress = (value) => {
        // Aseguramos que el valor esté entre 0 y 100
        globalProgress.value = Math.min(Math.max(value, 0), 100);
    };

    const resetProgress = () => {
        globalProgress.value = 0;
    };

    return {
        progress: globalProgress,
        updateProgress,
        resetProgress
    };
}