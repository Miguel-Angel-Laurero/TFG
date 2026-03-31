<template>
    <section class="gamelist" :class="{ dark: isDark }">
        <h2 class="gamelist-title font-righteous">Minijuegos</h2>
        <div class="gamelist-items">
            <div
                v-for="minigame in minigames"
                :key="minigame.id"
                class="game-item"
                @click="goToGame(minigame.name)"
            >
                <div class="game-num">{{ minigame.id }}</div>
                <div class="game-info">
                    <p class="game-name font-righteous">{{ minigame.name }}</p>
                    <p class="game-desc">{{ minigame.description }}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
const router = useRouter()
const minigames = ref([])
const loading = ref()
onMounted(async () => {
  try {
    const response = await fetch('/games.json')
    minigames.value = await response.json()
  } catch (error) {
    console.error("Error al cargar los datos", error)
  } finally {
    loading.value = false
  }
})
function goToGame(name) {
  router.push({ path: '/in-game-view/', query: { game: name } })
}
</script>

<style scoped>
.gamelist {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.gamelist-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: -0.02em;
  margin: 0;
  transition: color 0.3s;
}
.gamelist.dark .gamelist-title { color: #f1f5f9; }
.gamelist-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.game-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 1.5px solid #f3f4f6;
  border-left: 4px solid #facc15;
  border-radius: 0.875rem;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: border-left-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s;
}
.gamelist.dark .game-item {
  background: #1a1d27;
  border-color: #2d3748;
  border-left-color: #facc15;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.game-item:hover {
  border-left-color: #1484a1;
  background: #f0f9ff;
  box-shadow: 0 4px 16px rgba(20,132,161,0.12);
  transform: translateX(3px);
}
.gamelist.dark .game-item:hover {
  background: #1e2635;
  border-color: #2d3748;
  border-left-color: #1484a1;
  box-shadow: 0 4px 16px rgba(20,132,161,0.2);
}
.game-num {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.55rem;
  background: #fef9c3;
  color: #92400e;
  font-weight: 800;
  font-family: 'Righteous', cursive;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.gamelist.dark .game-num { background: rgba(250,204,21,0.12); color: #facc15; }
.game-item:hover .game-num { background: #1484a1; color: #ffffff; }
.game-info { flex: 1; min-width: 0; }
.game-name {
  font-size: 0.97rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.2rem;
  line-height: 1.3;
  transition: color 0.3s;
}
.gamelist.dark .game-name { color: #f1f5f9; }
.game-desc {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.game-arrow {
  width: 1rem;
  height: 1rem;
  color: #d1d5db;
  flex-shrink: 0;
  transition: color 0.2s;
}
.game-item:hover .game-arrow { color: #1484a1; }
</style>