// useGameProgress.js
import { ref } from 'vue';  // ← sin getCurrentInstance ni onUnmounted

const globalProgress = ref(0);
const gameFinished = ref(false);
const globalScore = ref(0);

export function useGameProgress() {
    const updateProgress = (value) => {
        globalProgress.value = Math.min(Math.max(value, 0), 100);
        if (globalProgress.value >= 100) gameFinished.value = true;
    };

    const finishGame = (finalScore) => {
        globalScore.value = finalScore;
        console.log(console.log("la nota actualizada es ", globalScore.value))
        gameFinished.value = true;
    };

    const resetProgress = () => {
        console.log("la nota es ", globalScore.value)
        globalProgress.value = 0;
        gameFinished.value = false;
        globalScore.value = 0;
        console.log("la nota ahora es ", globalScore.value)
    };

    return {
        progress: globalProgress,
        gameFinished,
        score: globalScore,
        updateProgress,
        finishGame,
        resetProgress
    };
}