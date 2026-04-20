import { ref } from 'vue';

const globalProgress = ref(0);
const gameFinished = ref(false);
const globalScore = ref(0);

export function useGameProgress() {
    const updateProgress = (value) => {
        globalProgress.value = Math.min(Math.max(value, 0), 100);
        if (globalProgress.value >= 100) gameFinished.value = true;
    };

    const updateScore = (value) => {
        globalScore.value = value;
    };

    const resetProgress = () => {
        globalProgress.value = 0;
        gameFinished.value = false;
        globalScore.value = 0;
    };

    return {
        progress: globalProgress,
        gameFinished,
        score: globalScore,
        updateProgress,
        updateScore,
        resetProgress
    };
}