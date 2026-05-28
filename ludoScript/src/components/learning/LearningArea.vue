<template>
  <div class="min-h-full bg-blue-950/20">
    <!-- Page header -->
    <div class="bg-gradient-to-r from-blue-900/40 to-blue-900/60 border-b border-white/10 px-6 py-8">
      <div class="max-w-6xl mx-auto text-center relative">
        <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          🎓 Área de aprendizaje
        </h1>
        <p class="text-gray-400 mt-1 text-sm sm:text-base">
          Conceptos básicos de programación, explicados sin rodeos y con ejemplos que puedes tocar.
        </p>
      </div>
    </div>

    <!-- Desktop Navigation (Tabs) -->
    <div class="hidden lg:block border-b border-white/10 bg-gray-800/40">
      <div class="overflow-x-auto">
        <div class="flex gap-2 px-4 py-3 justify-center flex-wrap">
          <button
            v-for="concept in CONCEPTS"
            :key="concept.id"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200 border',
              selectedId === concept.id
                ? [concept.accentActive, concept.accentText, 'font-semibold']
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            ]"
            @click="selectedId = concept.id"
          >
            <span>{{ concept.emoji }}</span>
            <span>{{ concept.title }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Header -->
    <div class="lg:hidden w-full border-b border-white/10 bg-gray-800/40 px-4 py-3 flex items-center relative">
      <button
        class="text-gray-400 hover:text-white p-2 relative z-10"
        @click="isMobileMenuOpen = true"
      >
        <i class="pi pi-bars text-xl" />
      </button>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="text-white font-medium">Conceptos</span>
      </div>
    </div>

    <!-- Mobile Full-Screen Sidebar Modal -->
    <Transition name="slide-left">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-50 flex lg:hidden bg-gray-900 flex-col"
      >
        <div class="p-4 border-b border-white/10 flex items-center justify-between bg-gray-800/50">
          <span class="text-white font-bold tracking-widest text-sm uppercase text-gray-400">Conceptos</span>
          <button
            class="text-gray-400 hover:text-white p-2"
            @click="isMobileMenuOpen = false"
          >
            <i class="pi pi-times text-xl" />
          </button>
        </div>
        <div class="p-3 overflow-y-auto flex-1">
          <ConceptsSidebar
            :concepts="CONCEPTS"
            :selected-id="selectedId"
            @select="id => { selectedId = id; isMobileMenuOpen = false; }"
          />
        </div>
      </div>
    </Transition>

    <!-- Content Area -->
    <div class="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <Transition
        name="concept-fade"
        mode="out-in"
      >
        <ConceptDetail
          :key="selectedId"
          :concept="selectedConcept"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CONCEPTS } from '@/utils/learningConcepts.js'
import ConceptsSidebar from './ConceptsSidebar.vue'
import ConceptDetail from './ConceptDetail.vue'

const selectedId = ref(CONCEPTS[0].id)
const isMobileMenuOpen = ref(false)

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

.slide-left-enter-active,
.slide-left-leave-active {
    transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
    transform: translateX(-100%);
}
</style>
