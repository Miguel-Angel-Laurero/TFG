<template>
    <article class="max-w-2xl mx-auto w-full">
        <!-- Concept header -->
        <div class="flex items-start gap-4 mb-8">
            <span class="text-5xl leading-none mt-1" aria-hidden="true">{{ concept.emoji }}</span>
            <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-white leading-tight">{{ concept.title }}</h2>
                <span
                    :class="['inline-block mt-2 text-xs font-mono font-bold px-2.5 py-1 rounded-full', concept.accentBadge]">
                    {{ concept.badgeTech }}
                </span>
            </div>
        </div>

        <!-- Plain-language explanation -->
        <section class="mb-8">
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                ¿Qué es esto?
            </h3>
            <p
                class="text-gray-200 text-base leading-relaxed bg-gray-800/60 rounded-xl p-5 border border-white/5 whitespace-pre-line">
                {{ concept.textPlain }}
            </p>
        </section>

        <!-- Interactive visual -->
        <section class="mb-8">
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Pruébalo
            </h3>
            <div :class="['rounded-2xl border p-5 sm:p-6', concept.accentBg, concept.accentBorder]">
                <Suspense>
                    <component :is="visualMap[concept.visualComponent]" />
                    <template #fallback>
                        <div class="flex items-center justify-center gap-2 text-gray-400 py-10">
                            <i class="pi pi-spin pi-spinner text-lg" />
                            <span class="text-sm">Cargando visualización…</span>
                        </div>
                    </template>
                </Suspense>
            </div>
        </section>

        <!-- Technical explanation (collapsible) -->
        <section class="mb-8">
            <button @click="showTech = !showTech"
                class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
                :aria-expanded="showTech">
                <i
                    :class="['pi text-xs transition-transform duration-200', showTech ? 'pi-chevron-down' : 'pi-chevron-right']" />
                La explicación técnica
                <span class="font-normal normal-case tracking-normal ml-1 text-gray-600">(para los curiosos)</span>
            </button>
            <Transition name="slide-down">
                <p v-if="showTech"
                    class="mt-3 text-gray-400 text-sm leading-relaxed font-mono bg-gray-950/60 rounded-xl p-4 border border-white/5 whitespace-pre-wrap">
                    {{ concept.textTech }}</p>
            </Transition>
        </section>

        <!-- Practice CTA -->
        <div class="pt-4 border-t border-white/10">
            <button @click="practice" :class="[
                'group flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm border transition-all duration-200 hover:brightness-125 hover:scale-[1.02] active:scale-100',
                concept.accentBg, concept.accentBorder, concept.accentText
            ]">
                <i class="pi pi-play-circle text-lg" />
                <span>Practicar este tema en el Quiz</span>
                <i
                    class="pi pi-arrow-right text-xs ml-auto opacity-60 transition-transform group-hover:translate-x-1" />
            </button>
        </div>
    </article>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    concept: { type: Object, required: true },
})

const router = useRouter()
const showTech = ref(false)

// Mapa estático de componentes: Vite puede analizar estos imports en build time
const visualMap = {
    VariableVisual: defineAsyncComponent(() => import('./visuals/VariableVisual.vue')),
    DataTypesVisual: defineAsyncComponent(() => import('./visuals/DataTypesVisual.vue')),
    ConditionalsVisual: defineAsyncComponent(() => import('./visuals/ConditionalsVisual.vue')),
    LoopsVisual: defineAsyncComponent(() => import('./visuals/LoopsVisual.vue')),
    FunctionsVisual: defineAsyncComponent(() => import('./visuals/FunctionsVisual.vue')),
    ArraysVisual: defineAsyncComponent(() => import('./visuals/ArraysVisual.vue')),
    ObjectsVisual: defineAsyncComponent(() => import('./visuals/ObjectsVisual.vue')),
}

function practice() {
    router.push({ path: '/in-game-view/', query: { game: 'Quiz' } })
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.25s ease;
    max-height: 500px;
    overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-4px);
    max-height: 0;
}
</style>
