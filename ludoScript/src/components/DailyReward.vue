<template>
    <Transition name="fade">
      <div
        v-if="showStreak"
        class="fixed inset-0 bg-black/60 z-40"
      />
    </Transition>
    <!-- Ventana Streak -->
    <Transition name="fade">
      <Streak
        v-if="showStreak"
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        @close="showStreak = false"
      />
    </Transition>
</template>
<script setup>
    import Streak from '@/components/Streak.vue';
    import { ref } from 'vue'

    const showStreak= ref(true)
</script>