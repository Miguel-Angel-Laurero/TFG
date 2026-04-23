<template>
    <nav class="space-y-0.5" aria-label="Conceptos de programación">
        <button v-for="concept in concepts" :key="concept.id" @click="$emit('select', concept.id)" :class="[
            'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 border',
            selectedId === concept.id
                ? [concept.accentActive, concept.accentText, 'shadow-sm']
                : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
        ]">
            <span class="text-xl shrink-0 leading-none">{{ concept.emoji }}</span>
            <div class="min-w-0">
                <p class="text-sm font-semibold leading-tight truncate">{{ concept.title }}</p>
                <p class="text-xs opacity-60 leading-tight mt-0.5 truncate font-mono">{{ concept.badgeTech }}</p>
            </div>
            <i v-if="selectedId === concept.id" class="pi pi-chevron-right text-xs ml-auto shrink-0" />
        </button>
    </nav>
</template>

<script setup>
defineProps({
    concepts: { type: Array, required: true },
    selectedId: { type: String, required: true },
})
defineEmits(['select'])
</script>
