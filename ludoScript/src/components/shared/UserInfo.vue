<!-- UserInfo.vue -->
<template>
  <div class="h-full">
    <h2 class="text-xl sm:text-2xl text-white font-bold">
      Tu Progreso
    </h2>
    <p class="text-xs text-indigo-300/60 mt-1 mb-3">
      Aquí puedes ver tu constancia, tests completados y recompensas.
    </p>
    <div class="grid grid-cols-2 gap-3">
      <!-- Racha -->
      <div
        class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-3 transition-all duration-300"
      >
        <p class="text-[9px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">
          Racha
        </p>
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors shrink-0"
          >
            <i class="pi pi-bolt text-orange-400 text-base" />
          </div>
          <div>
            <p
              class="text-xl font-black text-white group-hover:text-indigo-300 transition-colors leading-none"
            >
              {{ auth.userData?.streak ?? 0 }}
            </p>
            <p class="text-[10px] text-white/55 mt-0.5 font-medium">
              días seguidos
            </p>
          </div>
        </div>
      </div>
      <!-- Tests -->
      <div
        class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-3 transition-all duration-300"
      >
        <p class="text-[9px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">
          Tests
        </p>
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0"
          >
            <i class="pi pi-book text-indigo-400 text-base" />
          </div>
          <div>
            <p
              class="text-xl font-black text-white group-hover:text-indigo-300 transition-colors leading-none"
            >
              {{ totalGames }}
            </p>
            <p class="text-[10px] text-white/55 mt-0.5 font-medium">
              completados
            </p>
          </div>
        </div>
      </div>
      <!-- Summary metrics -->
      <article
        v-for="metric in summaryMetrics"
        :key="metric.label"
        class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-3 transition-all duration-300"
      >
        <p class="text-[9px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">
          {{ metric.label }}
        </p>
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0"
          >
            <i :class="`pi ${metric.icon} text-indigo-400 text-base`" />
          </div>
          <div>
            <p
              class="text-xl font-black text-white group-hover:text-indigo-300 transition-colors leading-none"
            >
              {{ metric.value }}
            </p>
            <p class="text-[10px] text-white/55 mt-0.5 font-medium">
              {{ metric.helper }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { gameService } from '@/api/game.service'
import { categoryStatsService } from '@/api/categoryStats.service'

const props = defineProps({
    summaryMetrics: {
        type: Array,
        default: () => []
    }
})

const auth = useAuthStore()
const totalGames = ref(0)
const categoriesPlayed = ref(0)

onMounted(async () => {
    if (!auth.userData) {
        await auth.fetchMe()
    }
    try {
        const { data } = await gameService.getMine()
        totalGames.value = data.filter(g => g.gameName === 'Quiz').length
    } catch (_) { }
    try {
        const { data } = await categoryStatsService.getAll()
        categoriesPlayed.value = data.filter(s => s.total > 0).length
    } catch (_) { }
})
</script>