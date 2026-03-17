<template>
    1. "Fix the Bug" (El Depurador)
En lugar de escribir código desde cero, presentas un pequeño bloque de código que tiene un solo error (un punto y coma ausente, una variable mal escrita o un error de lógica).

Mecánica: El usuario debe tocar la línea errónea y elegir la corrección entre tres opciones.

Por qué funciona: Desarrolla el "ojo clínico" necesario para la programación real.
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