<template>
  <div class="w-full h-full p-6 overflow-auto">
    <div class="max-w-4xl mx-auto flex flex-col gap-8">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold font-righteous text-white">Mis Grupos</h1>
          <p class="text-gray-400 mt-1">Crea o únete a grupos para competir con otros usuarios</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showJoin = true"
            class="flex items-center gap-2 border border-indigo-600/50 text-indigo-300 px-5 py-2.5 rounded-xl hover:bg-indigo-600/10 transition-colors font-semibold"
          >
            🔗 Unirse
          </button>
          <button
            @click="showCreate = true"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl transition-colors font-semibold"
          >
            ＋ Crear grupo
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="groupStore.loading" class="flex justify-center py-16">
        <div class="text-gray-400 text-lg animate-pulse">Cargando grupos...</div>
      </div>

      <!-- Empty state -->
      <div v-else-if="groupStore.groups.length === 0" class="flex flex-col items-center justify-center py-20 gap-6">
        <div class="w-24 h-24 rounded-3xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-5xl">
          👥
        </div>
        <div class="text-center">
          <p class="text-white text-xl font-semibold">No perteneces a ningún grupo</p>
          <p class="text-gray-500 mt-2">Crea un grupo o únete con un código de invitación para competir con otros.</p>
        </div>
        <div class="flex gap-4">
          <button
            @click="showJoin = true"
            class="border border-indigo-600/50 text-indigo-300 px-6 py-3 rounded-xl hover:bg-indigo-600/10 transition-colors font-semibold"
          >
            🔗 Unirse con código
          </button>
          <button
            @click="showCreate = true"
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
          >
            ＋ Crear nuevo grupo
          </button>
        </div>
      </div>

      <!-- Groups grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="group in groupStore.groups"
          :key="group.id"
          @click="openGroup(group)"
          class="bg-slate-800/80 border border-slate-700/60 hover:border-indigo-600/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col gap-3"
        >
          <!-- Group icon & name -->
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-2xl shrink-0">
              👥
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-bold truncate">{{ group.name }}</h3>
              <p v-if="group.description" class="text-gray-500 text-xs mt-0.5 line-clamp-2">{{ group.description }}</p>
            </div>
          </div>

          <!-- Badges -->
          <div class="flex gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-600/30">
              {{ gameTypeLabel(group.gameType) }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-gray-400">
              {{ group.members?.length ?? 0 }} miembro{{ (group.members?.length ?? 0) !== 1 ? 's' : '' }}
            </span>
            <span v-if="group.createdBy === auth.user?.id" class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              👑 Owner
            </span>
          </div>

          <!-- Members avatars -->
          <div class="flex -space-x-2">
            <div
              v-for="member in (group.members ?? []).slice(0, 5)"
              :key="member.id"
              class="w-7 h-7 rounded-full bg-indigo-600/40 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-200"
              :title="member.user?.username"
            >
              {{ member.user?.username?.[0]?.toUpperCase() ?? '?' }}
            </div>
            <div
              v-if="(group.members?.length ?? 0) > 5"
              class="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs text-gray-400"
            >
              +{{ group.members.length - 5 }}
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <CreateGroupModal v-if="showCreate" @close="showCreate = false" @created="onGroupCreated" />
    <JoinGroupModal v-if="showJoin" @close="showJoin = false" @joined="onGroupJoined" />
    <GroupDetailModal v-if="selectedGroup" :group="selectedGroup" @close="selectedGroup = null" @left="onLeft" @deleted="onDeleted" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group.store'
import { useAuthStore } from '@/stores/auth.store'
import CreateGroupModal from './CreateGroupModal.vue'
import JoinGroupModal from './JoinGroupModal.vue'
import GroupDetailModal from './GroupDetailModal.vue'

const groupStore = useGroupStore()
const auth = useAuthStore()

const showCreate = ref(false)
const showJoin = ref(false)
const selectedGroup = ref(null)

onMounted(() => {
  groupStore.fetchMyGroups()
})

function gameTypeLabel(type) {
  const map = { quiz: '📝 Tests', flashcards: '🃏 Flashcards', both: '🎮 Tests y Flashcards' }
  return map[type] ?? type
}

function openGroup(group) {
  selectedGroup.value = group
}

function onGroupCreated() {
  // already added to store by the store action
}

function onGroupJoined() {
  // already added to store by the store action
}

function onLeft(id) {
  if (selectedGroup.value?.id === id) selectedGroup.value = null
}

function onDeleted(id) {
  if (selectedGroup.value?.id === id) selectedGroup.value = null
}
</script>
