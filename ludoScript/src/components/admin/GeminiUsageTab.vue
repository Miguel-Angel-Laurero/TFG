<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold">Consumo de Gemini</h3>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        :class="loading
          ? 'bg-indigo-800 text-indigo-300 cursor-not-allowed'
          : 'bg-indigo-700 text-white hover:bg-indigo-600'"
        :disabled="loading"
        @click="fetchUsage"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </span>
        <span v-else class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </span>
      </button>
    </div>

    <div v-if="error" class="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
      {{ error }}
    </div>

    <div v-if="budget" class="bg-indigo-900/40 rounded-xl p-4 mb-6 border border-indigo-800/50">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-indigo-300 uppercase tracking-wide font-medium">
          Presupuesto de tokens
          <span v-if="budget.exhausted" class="ml-2 text-red-400">(Agotado)</span>
        </p>
        <p class="text-sm text-gray-300">
          <strong class="text-white">{{ budget.used.toLocaleString() }}</strong>
          /
          <strong class="text-indigo-300">{{ budget.limit.toLocaleString() }}</strong>
          <span class="text-gray-500 ml-1">
            ({{ budget.remaining.toLocaleString() }} restantes)
          </span>
        </p>
      </div>
      <div class="w-full bg-indigo-950/60 rounded-full h-3 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="budget.exhausted
            ? 'bg-red-500'
            : pct >= 80
              ? 'bg-amber-500'
              : 'bg-emerald-500'"
          :style="{ width: Math.min(pct, 100) + '%' }"
        />
      </div>
    </div>

    <div v-if="!loading && log.length === 0 && !error" class="text-center py-16 text-gray-400">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <p class="text-lg">Aún no hay uso registrado de Gemini.</p>
      <p class="text-sm mt-1">Los datos aparecerán aquí cuando se generen quizzes o flashcards.</p>
    </div>

    <template v-if="log.length > 0">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-indigo-900/40 rounded-xl p-4 border border-indigo-800/50">
          <p class="text-xs text-indigo-300 uppercase tracking-wide font-medium mb-1">Coste total</p>
          <p class="text-2xl font-bold text-emerald-400">${{ totals.cost.toFixed(6) }}</p>
        </div>
        <div class="bg-indigo-900/40 rounded-xl p-4 border border-indigo-800/50">
          <p class="text-xs text-indigo-300 uppercase tracking-wide font-medium mb-1">Tokens de entrada</p>
          <p class="text-2xl font-bold text-blue-300">{{ totals.promptTokens.toLocaleString() }}</p>
        </div>
        <div class="bg-indigo-900/40 rounded-xl p-4 border border-indigo-800/50">
          <p class="text-xs text-indigo-300 uppercase tracking-wide font-medium mb-1">Tokens de salida</p>
          <p class="text-2xl font-bold text-purple-300">{{ totals.outputTokens.toLocaleString() }}</p>
        </div>
        <div class="bg-indigo-900/40 rounded-xl p-4 border border-indigo-800/50">
          <p class="text-xs text-indigo-300 uppercase tracking-wide font-medium mb-1">Peticiones</p>
          <p class="text-2xl font-bold text-white">{{ log.length }}</p>
        </div>
      </div>

      <!-- Avg cost per request -->
      <div class="bg-indigo-900/20 rounded-xl p-3 mb-6 border border-indigo-800/30 text-sm text-gray-300 flex flex-wrap gap-x-6 gap-y-1">
        <span>Coste medio por petición: <strong class="text-emerald-400">${{ (totals.cost / log.length).toFixed(8) }}</strong></span>
        <span>Media tokens entrada: <strong class="text-blue-300">{{ Math.round(totals.promptTokens / log.length).toLocaleString() }}</strong></span>
        <span>Media tokens salida: <strong class="text-purple-300">{{ Math.round(totals.outputTokens / log.length).toLocaleString() }}</strong></span>
      </div>

      <!-- Table -->
      <div class="bg-indigo-950/40 rounded-xl border border-indigo-800/50 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-indigo-900/60 text-indigo-300 text-left">
                <th class="px-4 py-3 font-semibold whitespace-nowrap">Hora</th>
                <th class="px-4 py-3 font-semibold whitespace-nowrap">Modelo</th>
                <th class="px-4 py-3 font-semibold whitespace-nowrap text-right">Tokens in</th>
                <th class="px-4 py-3 font-semibold whitespace-nowrap text-right">Tokens out</th>
                <th class="px-4 py-3 font-semibold whitespace-nowrap text-right">Total</th>
                <th class="px-4 py-3 font-semibold whitespace-nowrap text-right">Coste</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-indigo-800/30">
              <tr v-for="(entry, i) in log" :key="i" class="hover:bg-indigo-900/20 transition">
                <td class="px-4 py-2.5 text-gray-300 whitespace-nowrap">{{ formatTime(entry.timestamp) }}</td>
                <td class="px-4 py-2.5 whitespace-nowrap">
                  <span class="bg-indigo-800/60 text-indigo-200 px-2 py-0.5 rounded text-xs font-mono">
                    {{ entry.model }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-right text-blue-300 font-mono">{{ entry.promptTokens.toLocaleString() }}</td>
                <td class="px-4 py-2.5 text-right text-purple-300 font-mono">{{ entry.outputTokens.toLocaleString() }}</td>
                <td class="px-4 py-2.5 text-right text-gray-200 font-mono">{{ entry.totalTokens.toLocaleString() }}</td>
                <td class="px-4 py-2.5 text-right text-emerald-400 font-mono">${{ entry.cost.toFixed(6) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import adminService from '@/api/admin.service'

const loading = ref(false)
const error = ref(null)
const log = ref([])
const totals = ref({ promptTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 })
const budget = ref(null)
const pct = ref(0)

async function fetchUsage() {
  loading.value = true
  error.value = null
  try {
    const response = await adminService.getGeminiUsage()
    log.value = response.data.log
    totals.value = response.data.totals
    budget.value = response.data.budget
    pct.value = budget.value
      ? (budget.value.used / budget.value.limit) * 100
      : 0
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al obtener el uso de Gemini'
    log.value = []
    totals.value = { promptTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 }
    budget.value = null
    pct.value = 0
  } finally {
    loading.value = false
  }
}

function formatTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(fetchUsage)
</script>
