<template>
  <!-- H3: siempre se puede cancelar pulsando fuera o en el botón Cancelar -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="$emit('cancel')"
  >
    <div class="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
      <h3 class="text-white font-bold text-lg">
        {{ title }}
      </h3>
      <p class="text-slate-300 text-sm leading-relaxed">
        {{ message }}
      </p>
      <div class="flex gap-3 mt-2">
        <button
          :disabled="loading"
          class="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <button
          :disabled="loading"
          :class="confirmClass"
          class="flex-1 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors font-medium"
          @click="$emit('confirm')"
        >
          <span v-if="loading">…</span>
          <span v-else>{{ confirmLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    message: { type: String, required: true },
    confirmLabel: { type: String, default: 'Confirmar' },
    confirmClass: { type: String, default: 'bg-indigo-600 hover:bg-indigo-500' },
    loading: { type: Boolean, default: false },
});
defineEmits(['confirm', 'cancel']);
</script>
