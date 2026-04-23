<template>
    <div class="space-y-5">
        <!-- N slider -->
        <div class="flex items-center gap-3 bg-gray-900/40 rounded-xl p-4">
            <label class="text-sm text-gray-300 shrink-0 font-mono">Iteraciones:</label>
            <input type="range" v-model.number="total" min="1" max="10" class="flex-1 accent-purple-500"
                :disabled="running" />
            <span class="text-purple-400 font-bold font-mono text-lg w-4 text-right">{{ total }}</span>
        </div>

        <!-- Visual counter area -->
        <div class="bg-gray-900/60 rounded-2xl p-5 flex flex-col items-center gap-4">
            <!-- Progress bar -->
            <div class="w-full bg-gray-700/50 rounded-full h-2.5">
                <div class="bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    :style="{ width: `${progress}%` }" />
            </div>

            <!-- Big counter -->
            <div class="text-center">
                <p class="text-xs text-gray-500 font-mono mb-1">i =</p>
                <p class="text-7xl font-bold font-mono tabular-nums text-purple-400 transition-all duration-200"
                    :class="{ 'scale-110': blink }">
                    {{ current >= total ? '✅' : current }}
                </p>
                <p v-if="current >= total" class="text-sm text-purple-300 mt-1">Bucle completado</p>
            </div>

            <!-- Index boxes -->
            <div class="flex flex-wrap gap-1.5 justify-center">
                <div v-for="i in total" :key="i - 1" :class="[
                    'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono border transition-all duration-300',
                    (i - 1) < current
                        ? 'bg-purple-500/30 border-purple-500/60 text-purple-300 scale-105'
                        : 'bg-gray-800/60 border-gray-700 text-gray-600'
                ]">
                    {{ i - 1 }}
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div class="flex gap-2 justify-center">
            <button @click="reset"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-800 border border-white/10 text-gray-300 hover:text-white text-sm font-bold transition-colors">
                <i class="pi pi-replay" /> Reset
            </button>
            <button @click="toggle" :class="[
                'flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-all border',
                running
                    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30'
                    : current >= total
                        ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-purple-600 border-purple-500 text-white hover:bg-purple-500'
            ]" :disabled="current >= total && !running">
                <i :class="running ? 'pi pi-pause' : 'pi pi-play'" />
                {{ running ? 'Pausa' : current >= total ? 'Fin' : 'Play' }}
            </button>
        </div>

        <!-- Code snippet -->
        <div class="rounded-xl overflow-hidden border border-white/10">
            <div class="bg-gray-950/80 px-4 py-2 border-b border-white/5">
                <span class="text-xs text-gray-500 font-mono">JavaScript — for loop</span>
            </div>
            <pre class="bg-gray-950/60 px-4 py-3 text-sm font-mono overflow-x-auto leading-relaxed"><code><span class="text-yellow-400">for</span><span class="text-gray-300"> (</span><span class="text-blue-400">let </span><span class="text-white">i</span><span class="text-gray-400"> = </span><span class="text-orange-300">0</span><span class="text-gray-300">; i </span><span class="text-yellow-400">&lt;</span><span class="text-orange-300"> {{ total }}</span><span class="text-gray-300">; i++) {</span>
  <span :class="running || current > 0 ? 'text-purple-300' : 'text-gray-600'">console.log(i); </span><span class="text-gray-600">← iteración actual: <span class="text-purple-400">{{ Math.min(current, total - 1) }}</span></span>
<span class="text-gray-300">}</span>
<span class="text-gray-600">// Total de iteraciones: {{ total }}</span></code></pre>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const total = ref(5)
const current = ref(0)
const running = ref(false)
const blink = ref(false)
let timer = null

const progress = computed(() => (current.value / total.value) * 100)

function toggle() {
    if (running.value) {
        pause()
    } else if (current.value < total.value) {
        play()
    }
}

function play() {
    running.value = true
    timer = setInterval(() => {
        if (current.value < total.value) {
            current.value++
            // Trigger blink animation
            blink.value = true
            setTimeout(() => { blink.value = false }, 150)
        } else {
            pause()
        }
    }, 600)
}

function pause() {
    running.value = false
    clearInterval(timer)
    timer = null
}

function reset() {
    pause()
    current.value = 0
}

watch(total, () => {
    reset()
})

onUnmounted(() => {
    clearInterval(timer)
})
</script>
