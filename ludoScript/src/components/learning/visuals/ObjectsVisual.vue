<template>
  <div class="space-y-5">
    <!-- Key-value editor -->
    <div class="bg-gray-900/60 rounded-2xl overflow-hidden border border-white/10">
      <!-- Header -->
      <div class="flex items-center gap-2 bg-gray-800/60 px-4 py-2 border-b border-white/10">
        <span class="text-pink-400 font-mono font-bold text-sm">persona</span>
        <span class="text-gray-400 text-sm">=</span>
        <span class="text-gray-400 text-sm">{</span>
        <span class="text-gray-600 text-xs ml-auto">{{ entries.length }} propiedad{{ entries.length !== 1 ? 'es'
          : '' }}</span>
      </div>

      <!-- Entries -->
      <div class="divide-y divide-white/5">
        <div
          v-for="(entry, i) in entries"
          :key="entry.id"
          class="flex items-center gap-2 px-4 py-2.5 hover:bg-white/3 transition-colors"
        >
          <input
            v-model="entry.key"
            placeholder="clave"
            maxlength="20"
            class="w-28 bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-pink-300 focus:outline-none focus:border-pink-500 transition-colors"
          >
          <span class="text-gray-500 text-xs font-mono shrink-0">:</span>
          <input
            v-model="entry.value"
            placeholder="valor"
            maxlength="30"
            class="flex-1 min-w-0 bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-green-300 focus:outline-none focus:border-green-500 transition-colors"
          >
          <span class="text-xs text-gray-600 font-mono shrink-0">{{ inferType(entry.value) }}</span>
          <button
            class="w-6 h-6 flex items-center justify-center rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            @click="removeEntry(i)"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>

        <div
          v-if="entries.length === 0"
          class="px-4 py-4 text-center text-gray-600 text-xs font-mono"
        >
          objeto vacío — { }
        </div>
      </div>

      <!-- Footer with closing brace + add button -->
      <div class="flex items-center justify-between bg-gray-800/60 px-4 py-2 border-t border-white/10">
        <span class="text-gray-400 text-sm font-mono">}</span>
        <button
          class="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 font-mono font-bold transition-colors"
          @click="addEntry"
        >
          <i class="pi pi-plus text-xs" /> añadir propiedad
        </button>
      </div>
    </div>

    <!-- Access example -->
    <div class="flex flex-wrap gap-2 items-center text-xs font-mono">
      <span class="text-gray-400">Acceder a una propiedad:</span>
      <div
        v-if="entries.length > 0"
        class="flex gap-1 items-center flex-wrap"
      >
        <span class="text-pink-400">persona</span>
        <span class="text-gray-400">.</span>
        <select
          v-model="selectedKey"
          class="bg-gray-800 border border-white/10 rounded px-1.5 py-0.5 text-green-300 focus:outline-none"
        >
          <option
            v-for="e in entries.filter(e => e.key)"
            :key="e.id"
            :value="e.key"
          >
            {{ e.key }}
          </option>
        </select>
        <span class="text-gray-500">→</span>
        <span class="text-green-400 font-bold">{{ selectedValue }}</span>
      </div>
      <span
        v-else
        class="text-gray-600"
      >— añade propiedades para ver</span>
    </div>

    <!-- JSON preview -->
    <div class="rounded-xl overflow-hidden border border-white/10">
      <div class="bg-gray-950/80 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span class="text-xs text-gray-500 font-mono">JSON.stringify(persona, null, 2)</span>
        <span class="text-xs text-gray-600">live preview</span>
      </div>
      <pre
        class="bg-gray-950/60 px-4 py-3 text-sm font-mono overflow-x-auto text-gray-300 leading-relaxed"
      >{{ jsonPreview }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

let idCounter = 0

const entries = ref([
    { id: idCounter++, key: 'nombre', value: 'Ana' },
    { id: idCounter++, key: 'edad', value: '28' },
    { id: idCounter++, key: 'ciudad', value: 'Madrid' },
])

const selectedKey = ref('nombre')

function addEntry() {
    entries.value.push({ id: idCounter++, key: '', value: '' })
}

function removeEntry(i) {
    entries.value.splice(i, 1)
}

function inferType(val) {
    if (val === '') return ''
    if (val === 'true' || val === 'false') return 'bool'
    if (val === 'null') return 'null'
    if (!isNaN(val) && val !== '') return 'num'
    return 'str'
}

function toJsonValue(val) {
    if (val === '') return null
    if (val === 'true') return true
    if (val === 'false') return false
    if (val === 'null') return null
    if (!isNaN(val) && val !== '') return Number(val)
    return val
}

const asObject = computed(() => {
    const obj = {}
    for (const e of entries.value) {
        if (e.key.trim()) {
            obj[e.key.trim()] = toJsonValue(e.value)
        }
    }
    return obj
})

const jsonPreview = computed(() => JSON.stringify(asObject.value, null, 2))

const selectedValue = computed(() => {
    const entry = entries.value.find((e) => e.key === selectedKey.value)
    if (!entry) return 'undefined'
    const v = toJsonValue(entry.value)
    if (typeof v === 'string') return `"${v}"`
    return String(v)
})

// Keep selectedKey valid
watch(entries, () => {
    const keys = entries.value.filter((e) => e.key).map((e) => e.key)
    if (!keys.includes(selectedKey.value) && keys.length > 0) {
        selectedKey.value = keys[0]
    }
}, { deep: true })
</script>
