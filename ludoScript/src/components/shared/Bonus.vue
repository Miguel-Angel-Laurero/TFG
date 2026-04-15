<template>
    <div class="mt-2 text-center">
        <div v-if="hasBonus" class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
            <p class="text-emerald-400 font-bold">¡Multiplicador de Bonus Activo!</p>
            <p class="text-3xl font-black text-emerald-300">x{{ currentMultiplier }}</p>
        </div>
        
        <div v-else class="text-white/20 text-[0.65rem] uppercase tracking-widest">
            Próximo bonus en aumento: {{ actualPercentage }}%
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- Estado ---
const basePercentage = 95;
const increment = 5;
const multipliers = [1.2, 1.5, 2, 4, 8];

const actualPercentage = ref(basePercentage);
const hasBonus = ref(false);
const currentMultiplier = ref(1);

// --- Lógica ---
function calculateBonus() {
    const randomIndex = Math.floor(Math.random() * multipliers.length);
    currentMultiplier.value = multipliers[randomIndex];
}

function checkBonusProbability() {
    const rand = Math.random() * 100;

    if (rand <= actualPercentage.value) {
        hasBonus.value = true;
        calculateBonus();
        // Opcional: reiniciar probabilidad tras ganar
        actualPercentage.value = basePercentage;
    } else {
        hasBonus.value = false;
        // Incrementamos la "suerte" para la próxima vez
        actualPercentage.value = Math.min(actualPercentage.value + increment, 100);
    }
}

// Ejecutar la lógica al cargar el componente
onMounted(() => {
    checkBonusProbability();
});
</script>