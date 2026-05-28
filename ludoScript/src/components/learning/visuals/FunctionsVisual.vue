<template>
  <div class="space-y-5">
    <!-- Function selector -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="fn in FUNCTIONS"
        :key="fn.id"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all',
          selected.id === fn.id
            ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
            : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
        ]"
        @click="selectFn(fn)"
      >
        {{ fn.signature }}
      </button>
    </div>

    <!-- Machine visual -->
    <div class="flex flex-col sm:flex-row items-center gap-3 bg-gray-900/60 rounded-2xl p-4">
      <!-- Params inputs -->
      <div class="flex flex-col gap-2 items-center sm:items-end">
        <div
          v-for="(param, i) in selected.params"
          :key="param.name"
          class="flex items-center gap-2"
        >
          <label class="text-xs text-gray-400 font-mono w-4 text-right">{{ param.name }}:</label>
          <input
            v-model="paramValues[i]"
            :type="param.type === 'number' ? 'number' : 'text'"
            :placeholder="param.placeholder"
            class="w-24 bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-orange-500 transition-colors"
            @input="clearResult"
          >
        </div>
        <div class="text-gray-600 text-xs text-right font-mono">
          parámetros →
        </div>
      </div>

      <!-- Arrow in -->
      <i class="pi pi-arrow-right text-orange-500/50 text-xl hidden sm:block" />
      <i class="pi pi-arrow-down text-orange-500/50 text-xl sm:hidden" />

      <!-- Function "machine" -->
      <div class="flex-1 bg-gray-800 border-2 border-orange-500/40 rounded-2xl p-4 text-center min-w-[130px]">
        <p class="text-xs text-gray-500 mb-1 font-mono">
          función
        </p>
        <p class="text-orange-400 font-bold font-mono text-sm">
          ⚙️ {{ selected.name }}
        </p>
        <p class="text-xs text-gray-600 mt-1 font-mono">
          {{ selected.internals }}
        </p>
      </div>

      <!-- Arrow out -->
      <i class="pi pi-arrow-right text-orange-500/50 text-xl hidden sm:block" />
      <i class="pi pi-arrow-down text-orange-500/50 text-xl sm:hidden" />

      <!-- Output -->
      <div class="flex flex-col items-center sm:items-start gap-2">
        <button
          class="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors active:scale-95"
          @click="execute"
        >
          <i class="pi pi-play" /> Ejecutar
        </button>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 font-mono">→ return:</span>
          <Transition name="pop">
            <span
              v-if="result !== null"
              :key="result"
              class="font-mono font-bold text-green-400 text-base bg-green-500/10 border border-green-500/30 px-3 py-0.5 rounded-lg"
            >
              {{ result }}
            </span>
            <span
              v-else
              class="text-gray-600 font-mono text-sm"
            >?</span>
          </Transition>
        </div>
        <p
          v-if="errorMsg"
          class="text-xs text-red-400 font-mono"
        >
          {{ errorMsg }}
        </p>
        <div class="text-gray-600 text-xs font-mono">
          ← resultado
        </div>
      </div>
    </div>

    <!-- Code snippet -->
    <div class="rounded-xl overflow-hidden border border-white/10">
      <div class="bg-gray-950/80 px-4 py-2 border-b border-white/5">
        <span class="text-xs text-gray-500 font-mono">JavaScript</span>
      </div>
      <pre class="bg-gray-950/60 px-4 py-3 text-sm font-mono overflow-x-auto leading-relaxed"><code><span class="text-yellow-400">function</span><span class="text-orange-400"> {{ selected.name }}</span><span class="text-gray-300">(</span><span class="text-white">{{ selected.params.map(p => p.name).join(', ') }}</span><span class="text-gray-300">) {</span>
  <span class="text-yellow-400">return</span><span class="text-green-300"> {{ selected.body }}</span><span class="text-gray-500">;</span>
<span class="text-gray-300">}</span>

<span class="text-gray-600">// Llamada:</span>
<span class="text-orange-400">{{ selected.name }}</span><span class="text-gray-300">({{ callArgs }})</span><span class="text-gray-500">;</span>
<span
v-if="result !== null"
      class="text-gray-600"
      >// → {{ result }}</span></code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const FUNCTIONS = [
    {
        id: 'suma',
        name: 'suma',
        signature: 'suma(a, b)',
        internals: 'a + b',
        body: 'a + b',
        params: [
            { name: 'a', type: 'number', placeholder: '3' },
            { name: 'b', type: 'number', placeholder: '4' },
        ],
        compute: (vals) => {
            const a = parseFloat(vals[0])
            const b = parseFloat(vals[1])
            if (isNaN(a) || isNaN(b)) return { error: 'Introduce dos números' }
            return { result: a + b }
        },
    },
    {
        id: 'cuadrado',
        name: 'cuadrado',
        signature: 'cuadrado(n)',
        internals: 'n * n',
        body: 'n * n',
        params: [
            { name: 'n', type: 'number', placeholder: '5' },
        ],
        compute: (vals) => {
            const n = parseFloat(vals[0])
            if (isNaN(n)) return { error: 'Introduce un número' }
            return { result: n * n }
        },
    },
    {
        id: 'saludo',
        name: 'saludo',
        signature: 'saludo(nombre)',
        internals: '"Hola, " + nombre',
        body: '"Hola, " + nombre',
        params: [
            { name: 'nombre', type: 'text', placeholder: 'Ana' },
        ],
        compute: (vals) => {
            if (!vals[0]) return { error: 'Escribe un nombre' }
            return { result: `"Hola, ${vals[0]}"` }
        },
    },
    {
        id: 'esPar',
        name: 'esPar',
        signature: 'esPar(n)',
        internals: 'n % 2 === 0',
        body: 'n % 2 === 0',
        params: [
            { name: 'n', type: 'number', placeholder: '6' },
        ],
        compute: (vals) => {
            const n = parseInt(vals[0])
            if (isNaN(n)) return { error: 'Introduce un entero' }
            return { result: n % 2 === 0 ? 'true' : 'false' }
        },
    },
]

const selected = ref(FUNCTIONS[0])
const paramValues = ref(['', ''])
const result = ref(null)
const errorMsg = ref('')

function selectFn(fn) {
    selected.value = fn
    paramValues.value = fn.params.map(() => '')
    result.value = null
    errorMsg.value = ''
}

function clearResult() {
    result.value = null
    errorMsg.value = ''
}

function execute() {
    const { result: r, error } = selected.value.compute(paramValues.value)
    if (error) {
        errorMsg.value = error
        result.value = null
    } else {
        result.value = r
        errorMsg.value = ''
    }
}

const callArgs = computed(() =>
    paramValues.value.map((v, i) => {
        const p = selected.value.params[i]
        if (!v) return p.placeholder
        if (p.type === 'number') return v
        return `"${v}"`
    }).join(', ')
)
</script>

<style scoped>
.pop-enter-active {
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-enter-from {
    opacity: 0;
    transform: scale(0.6);
}
</style>
