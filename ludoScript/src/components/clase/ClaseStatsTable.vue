<template>
    <div class="bg-slate-800/60 rounded-xl border border-white/5 overflow-hidden">

        <!-- Selector de métrica de ordenación -->
        <!-- H6: opciones visibles, no ocultas en un dropdown -->
        <div class="flex gap-1 p-3 border-b border-white/5 flex-wrap">
            <button v-for="opt in sortOptions" :key="opt.key" @click="sortBy = opt.key" :class="sortBy === opt.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'"
                class="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium">
                {{ opt.label }}
            </button>
        </div>

        <!-- Lista de miembros ordenada -->
        <!-- H1: estado vacío claro -->
        <div v-if="!sortedStats.length" class="text-center text-slate-500 py-8 text-sm">
            No hay miembros en la clase todavía.
        </div>

        <div v-else class="divide-y divide-white/5">
            <div v-for="(member, idx) in sortedStats" :key="member.userId" class="px-3 py-2">
                <ClaseMemberCard :member="member" :rank="idx + 1" :is-owner="member.userId === ownerId"
                    :is-current-user="member.userId === currentUserId"
                    :can-manage="isOwner && member.userId !== currentUserId" @kick="$emit('kick', $event)"
                    @transfer="$emit('transfer', $event)" />

                <!-- Categorías (acordeón) — H7: solo accesible si el usuario quiere ver más -->
                <div v-if="member.categoryStats?.length" class="mt-1 pl-12">
                    <button @click="toggleExpanded(member.userId)"
                        class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        {{ expanded.has(member.userId) ? '▲ Ocultar categorías' : '▼ Ver por categorías' }}
                    </button>
                    <div v-if="expanded.has(member.userId)" class="mt-2 flex flex-wrap gap-2">
                        <div v-for="cat in member.categoryStats" :key="cat.category"
                            class="text-xs bg-slate-700/60 border border-white/5 rounded-lg px-2 py-1">
                            <span class="text-slate-400">{{ formatCategory(cat.category) }}</span>
                            <span class="ml-1 text-white font-medium">
                                {{ cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0 }}%
                            </span>
                            <span class="ml-1" :class="difficultyColor(cat.unlockedDifficulty)">
                                {{ difficultyLabel(cat.unlockedDifficulty) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ClaseMemberCard from './ClaseMemberCard.vue';

const props = defineProps({
    stats: { type: Array, default: () => [] },
    ownerId: { type: Number, default: null },
    currentUserId: { type: Number, default: null },
    isOwner: { type: Boolean, default: false },
});

defineEmits(['kick', 'transfer']);

const sortBy = ref('accuracy');
const expanded = ref(new Set());

const sortOptions = [
    { key: 'accuracy', label: '🎯 Precisión' },
    { key: 'streak', label: '🔥 Racha' },
    { key: 'timeSpent', label: '⏱ Tiempo' },
];

const sortedStats = computed(() => {
    return [...props.stats].sort((a, b) => (b[sortBy.value] ?? 0) - (a[sortBy.value] ?? 0));
});

function toggleExpanded(userId) {
    const s = new Set(expanded.value);
    s.has(userId) ? s.delete(userId) : s.add(userId);
    expanded.value = s;
}

function formatCategory(cat) {
    return cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function difficultyLabel(level) {
    return ['', 'Básico', 'Medio', 'Avanzado'][level] ?? '';
}

function difficultyColor(level) {
    return ['', 'text-slate-400', 'text-yellow-400', 'text-emerald-400'][level] ?? 'text-slate-400';
}
</script>
