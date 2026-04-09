<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-slate-800 border border-indigo-700/50 rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold font-righteous text-white">Crear grupo</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <!-- Name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold text-gray-300">Nombre del grupo *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ej: Estudio de Redes"
            maxlength="100"
            class="bg-slate-700 text-white placeholder-gray-500 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold text-gray-300">Descripción</label>
          <textarea
            v-model="form.description"
            placeholder="Descripción opcional del grupo..."
            rows="3"
            class="bg-slate-700 text-white placeholder-gray-500 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <!-- Game type -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold text-gray-300">Tipo de juego</label>
          <select
            v-model="form.gameType"
            class="bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="both">🎮 Ambos (Tests y Flashcards)</option>
            <option value="quiz">📝 Tests tipo examen</option>
            <option value="flashcards">🃏 Flashcards</option>
          </select>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 border border-slate-600 text-gray-300 rounded-xl py-3 hover:bg-slate-700 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl py-3 transition-colors font-semibold"
          >
            {{ loading ? 'Creando...' : 'Crear grupo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGroupStore } from '@/stores/group.store'

const emit = defineEmits(['close', 'created'])
const groupStore = useGroupStore()

const form = ref({ name: '', description: '', gameType: 'both' })
const error = ref(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  if (!form.value.name.trim() || form.value.name.trim().length < 3) {
    error.value = 'El nombre debe tener al menos 3 caracteres'
    return
  }
  loading.value = true
  try {
    const group = await groupStore.createGroup({
      name: form.value.name.trim(),
      description: form.value.description.trim() || null,
      gameType: form.value.gameType,
    })
    emit('created', group)
    emit('close')
  } catch (e) {
    error.value = groupStore.error ?? 'Error al crear el grupo'
  } finally {
    loading.value = false
  }
}
</script>
