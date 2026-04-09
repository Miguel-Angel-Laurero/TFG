<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-slate-800 border border-indigo-700/50 rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold font-righteous text-white">{{ group.name }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
      </div>

      <!-- Game type badge -->
      <div class="flex gap-2 flex-wrap">
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-600/40">
          {{ gameTypeLabel }}
        </span>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-gray-400 border border-slate-600">
          {{ group.members?.length ?? 0 }} miembro{{ (group.members?.length ?? 0) !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Description -->
      <p v-if="group.description" class="text-gray-400 text-sm">{{ group.description }}</p>

      <!-- Members list -->
      <div class="flex flex-col gap-2">
        <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider">Miembros</h3>
        <div
          v-for="member in group.members"
          :key="member.id"
          class="flex items-center gap-3 bg-slate-700/50 rounded-xl px-4 py-3"
        >
          <div class="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm font-bold text-indigo-300">
            {{ member.user?.username?.[0]?.toUpperCase() ?? '?' }}
          </div>
          <span class="text-white text-sm font-medium flex-1">{{ member.user?.username }}</span>
          <span v-if="member.role === 'owner'" class="text-yellow-400 text-xs font-bold">👑 Owner</span>
        </div>
      </div>

      <!-- Invite code (visible to owner) -->
      <div v-if="isOwner" class="flex flex-col gap-2">
        <h3 class="text-sm font-semibold text-gray-300 uppercase tracking-wider">Código de invitación</h3>
        <div class="flex items-center gap-2 bg-slate-700 rounded-xl px-4 py-3">
          <code class="text-indigo-300 font-mono text-xs flex-1 break-all">{{ group.inviteCode }}</code>
          <button @click="copyCode" class="text-gray-400 hover:text-white transition-colors text-sm shrink-0">
            {{ copied ? '✓ Copiado' : '📋 Copiar' }}
          </button>
        </div>
        <p class="text-gray-500 text-xs">Comparte este código con tus compañeros para que se unan.</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          v-if="!isOwner"
          @click="handleLeave"
          :disabled="actionLoading"
          class="flex-1 border border-red-700/50 text-red-400 rounded-xl py-3 hover:bg-red-900/20 disabled:opacity-50 transition-colors font-semibold"
        >
          {{ actionLoading ? 'Abandonando...' : 'Abandonar grupo' }}
        </button>
        <button
          v-if="isOwner"
          @click="handleDelete"
          :disabled="actionLoading"
          class="flex-1 border border-red-700/50 text-red-400 rounded-xl py-3 hover:bg-red-900/20 disabled:opacity-50 transition-colors font-semibold"
        >
          {{ actionLoading ? 'Eliminando...' : 'Eliminar grupo' }}
        </button>
        <button @click="$emit('close')" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3 transition-colors font-semibold">
          Cerrar
        </button>
      </div>

      <p v-if="actionError" class="text-red-400 text-sm text-center">{{ actionError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGroupStore } from '@/stores/group.store'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({ group: { type: Object, required: true } })
const emit = defineEmits(['close', 'left', 'deleted'])

const groupStore = useGroupStore()
const auth = useAuthStore()

const copied = ref(false)
const actionLoading = ref(false)
const actionError = ref(null)

const isOwner = computed(() => props.group.createdBy === auth.user?.id)

const gameTypeLabel = computed(() => {
  const map = { quiz: '📝 Tests', flashcards: '🃏 Flashcards', both: '🎮 Tests y Flashcards' }
  return map[props.group.gameType] ?? props.group.gameType
})

function copyCode() {
  navigator.clipboard.writeText(props.group.inviteCode)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function handleLeave() {
  actionError.value = null
  actionLoading.value = true
  try {
    await groupStore.leaveGroup(props.group.id)
    emit('left', props.group.id)
    emit('close')
  } catch (e) {
    actionError.value = groupStore.error ?? 'Error al abandonar el grupo'
  } finally {
    actionLoading.value = false
  }
}

async function handleDelete() {
  if (!confirm('¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.')) return
  actionError.value = null
  actionLoading.value = true
  try {
    await groupStore.deleteGroup(props.group.id)
    emit('deleted', props.group.id)
    emit('close')
  } catch (e) {
    actionError.value = groupStore.error ?? 'Error al eliminar el grupo'
  } finally {
    actionLoading.value = false
  }
}
</script>
