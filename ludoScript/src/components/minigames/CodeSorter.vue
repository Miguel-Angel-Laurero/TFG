<template>
2. "Code Sorter" (Ordena el Algoritmo)
Inspirado en los ejercicios de "Parsons Problems". Entregas las líneas de un algoritmo o una función totalmente desordenadas.

Mecánica: El usuario debe arrastrar y soltar las líneas en el orden correcto para que el código sea funcional.

Ideal para: Aprender estructuras de control (if, for, while) y la jerarquía del código.
</template>
<script setup>
    import { useGameProgress } from '@/composables/useGameProgress';

const { updateProgress } = useGameProgress();

// Ejemplo: al completar una tarea del juego
const onTaskComplete = (tasksDone, totalTasks) => {
    const percentage = (tasksDone / totalTasks) * 100;
    updateProgress(percentage);
};
</script>