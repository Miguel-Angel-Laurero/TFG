<template>
  <div class="h-screen flex flex-col">
    <header>
      <Header />
    </header>
    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        <!-- Encabezado compacto del usuario -->
        <div class="flex items-center gap-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
          <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="Avatar"
            class="w-16 h-16 rounded-full object-cover ring-2 ring-blue-400 flex-shrink-0" />
          <div v-else
            class="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-400 flex-shrink-0">
            <span class="text-2xl text-gray-300">👤</span>
          </div>
          <div>
            <p class="text-white font-bold text-xl">{{ auth.user?.username }}</p>
            <p class="text-gray-400 text-sm">{{ auth.user?.email }}</p>
          </div>
        </div>

        <!-- Estadísticas + gráfico semanal -->
        <UserStats />

        <!-- Resumen semanal por categoría -->
        <WeeklyResume />

        <!-- Mapa de calor por área -->
        <CategoryHeatMap />
      </div>
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>
<script setup>
import Footer from '@/components/shared/Footer.vue';
import Header from '@/components/shared/Header.vue';
import UserStats from '@/components/profile/UserStats.vue';
import WeeklyResume from '@/components/profile/WeeklyResume.vue';
import CategoryHeatMap from '@/components/profile/CategoryHeatMap.vue';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();
</script>
