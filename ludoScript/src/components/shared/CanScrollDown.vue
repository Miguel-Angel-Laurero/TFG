<script setup>
    import { useScrollDown } from '@/composables/useScrollDown'

    const { canScrollDown } = useScrollDown()
</script>
<template>
  <div v-if="canScrollDown">
    <i class="pi pi-angle-double-down scroll-icon" />
  </div>
</template>

<style scoped>
.scroll-icon {
  font-size: 3rem !important;
  color: white;
  animation: blink 2.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 0; }
}
</style>