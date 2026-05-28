<template>
  <div
    class="relative p-2 rounded-2xl mb-4 overflow-hidden"
    :style="bannerStyle"
  >
    <div class="relative overflow-hidden rounded-xl">
      <RouterLink
        to="/edit-profile-view"
        class="absolute top-2 right-2 border border-white/60 rounded-full w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors z-10"
        aria-label="Editar perfil"
      >
        <i class="pi pi-pen-to-square text-white text-sm" />
      </RouterLink>

      <div class="relative flex flex-row sm:flex-col items-center justify-start sm:justify-center mx-auto gap-4 rounded-2xl p-4 sm:p-6 pr-12 sm:pr-6">
        <img
          v-if="auth.user?.avatar"
          :src="auth.user.avatar"
          alt="Avatar"
          class="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover ring-2 ring-blue-400 shrink-0"
        >

        <div
          v-else
          class="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-400 shrink-0"
        >
          <span class="text-3xl sm:text-4xl text-gray-300">?</span>
        </div>

        <div class="min-w-0 flex flex-col items-start sm:items-center text-left sm:text-center">
          <p class="w-full text-gray-900 font-bold text-xl sm:text-2xl leading-tight truncate">
            {{ auth.user?.username }}
          </p>
          <p class="w-full text-gray-900 text-sm sm:text-md opacity-80 truncate">
            {{ auth.user?.email }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const bannerStyle = computed(() => ({
    backgroundImage: auth.user?.banner ? `url('${auth.user.banner}')` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#1e293b',
    minHeight: '96px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}))
</script>
