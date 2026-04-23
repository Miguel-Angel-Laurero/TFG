<template>
    <div class="space-y-5">
        <!-- Slider -->
        <div class="flex items-center gap-3 bg-gray-900/40 rounded-xl p-4">
            <label class="text-sm text-gray-300 shrink-0 font-mono">n =</label>
            <input type="range" v-model.number="n" min="0" max="10" class="flex-1 accent-yellow-500" />
            <span class="text-yellow-400 font-bold font-mono text-lg w-6 text-right">{{ n }}</span>
        </div>

        <!-- Flowchart -->
        <div class="flex flex-col items-center gap-0 select-none">
            <!-- Start node -->
            <div class="bg-gray-800 border border-white/20 text-gray-300 text-xs font-mono px-5 py-2 rounded-full">
                INICIO
            </div>
            <!-- Arrow -->
            <div class="w-0.5 h-6 bg-gray-600" />

            <!-- Condition diamond -->
            <div class="relative flex items-center justify-center">
                <div :class="[
                    'w-28 h-28 rotate-45 border-2 transition-all duration-300',
                    conditionResult ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'
                ]" />
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span class="text-xs font-mono text-gray-300 -rotate-0">n &gt; 5</span>
                    <span :class="['text-xs font-bold mt-0.5', conditionResult ? 'text-green-400' : 'text-red-400']">
                        {{ conditionResult ? 'true ✓' : 'false ✗' }}
                    </span>
                </div>
            </div>

            <!-- Two branches -->
            <div class="w-full flex justify-between items-start mt-0 relative" style="max-width: 360px">
                <!-- Horizontal connector line -->
                <div class="absolute top-0 left-[10%] right-[10%] h-0.5 bg-gray-700" />

                <!-- TRUE branch (left) -->
                <div class="flex flex-col items-center w-1/2">
                    <div class="w-0.5 h-6 bg-gray-600" />
                    <div :class="[
                        'text-xs text-green-400 font-bold mb-2 transition-all duration-300',
                        conditionResult ? 'opacity-100' : 'opacity-30'
                    ]">SÍ</div>
                    <div :class="[
                        'border-2 rounded-xl px-3 py-3 text-center text-xs font-mono transition-all duration-300 max-w-[120px]',
                        conditionResult
                            ? 'bg-green-500/20 border-green-500/70 text-green-300 shadow-lg shadow-green-500/10'
                            : 'bg-gray-800/40 border-gray-700 text-gray-600'
                    ]">
                        <p>console.log(</p>
                        <p class="font-bold">"mayor"</p>
                        <p>)</p>
                    </div>
                    <div class="w-0.5 h-4 bg-gray-700 mt-0" />
                    <div
                        :class="['text-lg transition-opacity duration-300', conditionResult ? 'opacity-100' : 'opacity-20']">
                        ✅</div>
                </div>

                <!-- FALSE branch (right) -->
                <div class="flex flex-col items-center w-1/2">
                    <div class="w-0.5 h-6 bg-gray-600" />
                    <div :class="[
                        'text-xs text-red-400 font-bold mb-2 transition-all duration-300',
                        !conditionResult ? 'opacity-100' : 'opacity-30'
                    ]">NO</div>
                    <div :class="[
                        'border-2 rounded-xl px-3 py-3 text-center text-xs font-mono transition-all duration-300 max-w-[120px]',
                        !conditionResult
                            ? 'bg-red-500/20 border-red-500/70 text-red-300 shadow-lg shadow-red-500/10'
                            : 'bg-gray-800/40 border-gray-700 text-gray-600'
                    ]">
                        <p>console.log(</p>
                        <p class="font-bold">"menor"</p>
                        <p>)</p>
                    </div>
                    <div class="w-0.5 h-4 bg-gray-700 mt-0" />
                    <div
                        :class="['text-lg transition-opacity duration-300', !conditionResult ? 'opacity-100' : 'opacity-20']">
                        🔴</div>
                </div>
            </div>
        </div>

        <!-- Code snippet -->
        <div class="rounded-xl overflow-hidden border border-white/10">
            <div class="bg-gray-950/80 px-4 py-2 border-b border-white/5">
                <span class="text-xs text-gray-500 font-mono">JavaScript</span>
            </div>
            <pre class="bg-gray-950/60 px-4 py-3 text-sm font-mono overflow-x-auto leading-relaxed"><code><span class="text-blue-400">const</span><span class="text-white"> n</span><span class="text-gray-400"> = </span><span class="text-orange-300">{{ n }}</span><span class="text-gray-500">;</span>
<span class="text-yellow-400">if</span><span class="text-gray-300"> (n </span><span class="text-yellow-400">&gt;</span><span class="text-orange-300"> 5</span><span class="text-gray-300">) {</span>
  <span :class="conditionResult ? 'text-green-400' : 'text-gray-600'">console.log("mayor"); </span><span class="text-gray-600">← {{ conditionResult ? 'se ejecuta ✓' : 'se salta ✗' }}</span>
<span class="text-gray-300">} </span><span class="text-yellow-400">else</span><span class="text-gray-300"> {</span>
  <span :class="!conditionResult ? 'text-red-400' : 'text-gray-600'">console.log("menor"); </span><span class="text-gray-600">← {{ !conditionResult ? 'se ejecuta ✓' : 'se salta ✗' }}</span>
<span class="text-gray-300">}</span></code></pre>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const n = ref(3)
const conditionResult = computed(() => n.value > 5)
</script>
