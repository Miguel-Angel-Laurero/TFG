import { ref } from 'vue';

const globalProgress = ref(0);
const gameFinished = ref(false);

export function useGameProgress() {
    const updateProgress = (value) => {
        globalProgress.value = Math.min(Math.max(value, 0), 100);
        if (globalProgress.value >= 100) gameFinished.value = true;
    };

    const resetProgress = () => {
        globalProgress.value = 0;
        gameFinished.value = false;
    };

    return {
        progress: globalProgress,
        gameFinished,
        updateProgress,
        resetProgress
    };
}