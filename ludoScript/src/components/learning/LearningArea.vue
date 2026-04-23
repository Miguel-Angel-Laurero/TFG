<template>
    <div class="min-h-full bg-gray-900">
        <!-- Page header -->
        <div class="bg-gradient-to-r from-gray-800/80 to-gray-900 border-b border-white/10 px-6 py-8">
            <div class="max-w-6xl mx-auto text-center relative">
                <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    🎓 Área de aprendizaje
                </h1>
                <p class="text-gray-400 mt-1 text-sm sm:text-base">
                    Conceptos básicos de programación, explicados sin rodeos y con ejemplos que puedes tocar.
                </p>
                <!-- Layout toggle -->
                <div
                    class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-800 border border-white/10 rounded-lg p-1">
                    <button @click="layout = 'tabs'"
                        :class="['px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5', layout === 'tabs' ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300']"
                        title="Vista con tabs arriba">
                        <i class="pi pi-table-cells text-xs" /> Tabs
                    </button>
                    <button @click="layout = 'sidebar'"
                        :class="['px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5', layout === 'sidebar' ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300']"
                        title="Vista con sidebar">
                        <i class="pi pi-layout text-xs" /> Sidebar
                    </button>
                </div>
            </div>
        </div>

        <!-- LAYOUT: TABS (conceptos arriba) -->
        <template v-if="layout === 'tabs'">
            <!-- Tab strip -->
            <div class="border-b border-white/10 bg-gray-800/40">
                <div class="overflow-x-auto">
                    <div class="flex gap-2 px-4 py-3 justify-center flex-wrap">
                        <button v-for="concept in CONCEPTS" :key="concept.id" @click="selectedId = concept.id" :class="[
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200 border',
                            selectedId === concept.id
                                ? [concept.accentActive, concept.accentText, 'font-semibold']
                                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                        ]">
                            <span>{{ concept.emoji }}</span>
                            <span>{{ concept.title }}</span>
                        </button>
                    </div>
                </div>
            </div>
            <!-- Full-width detail -->
            <div class="max-w-4xl mx-auto px-4 sm:px-8 py-8">
                <Transition name="concept-fade" mode="out-in">
                    <ConceptDetail :concept="selectedConcept" :key="selectedId" />
                </Transition>
            </div>
        </template>

        <!-- LAYOUT: SIDEBAR -->
        <template v-else>
            <div class="max-w-6xl mx-auto flex" style="min-height: calc(100vh - 240px)">
                <!-- Sidebar -->
                <aside class="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/10 py-4 px-3">
                    <p class="text-xs font-bold uppercase tracking-widest text-gray-500 px-3 mb-3">
                        Conceptos
                    </p>
                    <ConceptsSidebar :concepts="CONCEPTS" :selected-id="selectedId" @select="selectedId = $event" />
                </aside>
                <!-- Mobile tabs (sidebar mode) -->
                <div class="lg:hidden w-full border-b border-white/10 bg-gray-800/40 absolute left-0">
                    <div class="overflow-x-auto">
                        <div class="flex gap-2 px-4 py-3 justify-center flex-wrap">
                            <button v-for="concept in CONCEPTS" :key="concept.id" @click="selectedId = concept.id"
                                :class="[
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200 border',
                                    selectedId === concept.id
                                        ? [concept.accentActive, concept.accentText, 'font-semibold']
                                        : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                                ]">
                                <span>{{ concept.emoji }}</span>
                                <span>{{ concept.title }}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Detail panel -->
                <main class="flex-1 min-w-0 px-4 sm:px-8 py-8">
                    <Transition name="concept-fade" mode="out-in">
                        <ConceptDetail :concept="selectedConcept" :key="selectedId" />
                    </Transition>
                </main>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CONCEPTS } from '@/utils/learningConcepts.js'
import ConceptsSidebar from './ConceptsSidebar.vue'
import ConceptDetail from './ConceptDetail.vue'

const selectedId = ref(CONCEPTS[0].id)
const layout = ref('tabs') // 'tabs' | 'sidebar'

const selectedConcept = computed(() =>
    CONCEPTS.find((c) => c.id === selectedId.value)
)
</script>

<style scoped>
.concept-fade-enter-active,
.concept-fade-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}

.concept-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.concept-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
