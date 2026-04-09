<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-slate-800 border border-indigo-700/50 rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold font-righteous text-white">Unirse a un grupo</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold text-gray-300">Código de invitación *</label>
          <input
            v-model="inviteCode"
            type="text"
            placeholder="Pega aquí el código del grupo"
            class="bg-slate-700 text-white placeholder-gray-500 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
          <p class="text-gray-500 text-xs mt-1">Pide el código de invitación al propietario del grupo.</p>
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

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
            {{ loading ? 'Uniéndose...' : 'Unirse' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGroupStore } from '@/stores/group.store'

const emit = defineEmits(['close', 'joined'])
const groupStore = useGroupStore()

const inviteCode = ref('')
const error = ref(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  if (!inviteCode.value.trim()) {
    error.value = 'El código de invitación es obligatorio'
    return
  }
  loading.value = true
  try {
    const group = await groupStore.joinGroup(inviteCode.value.trim())
    emit('joined', group)
    emit('close')
  } catch (e) {
    error.value = groupStore.error ?? 'Código inválido o ya perteneces a este grupo'
  } finally {
    loading.value = false
  }
}
</script>
