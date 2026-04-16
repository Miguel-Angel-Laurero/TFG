<template>
  <Header />
  <div class="h-screen flex flex-col">
    <main class="flex-1 min-h-0 overflow-y-auto">
      <!-- Volver al inicio -->
      <div class="max-w-4xl pt-4 mx-auto mb-3">
          <button @click="router.push('/')"
              class="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
              <i class="pi pi-arrow-left text-xs"></i> Volver al inicio
          </button>
      </div>
      <div class="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        <UserStats />
        <FortnightResume />
        <!-- <CategoryHeatMap /> -->
      </div>
    </main>
  </div>
  <Footer />
</template>
<script setup>
import Footer from '@/components/shared/Footer.vue';
import Header from '@/components/shared/Header.vue';
import UserStats from '@/components/profile/UserStats.vue';
import FortnightResume from '@/components/profile/FortnightResume.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
