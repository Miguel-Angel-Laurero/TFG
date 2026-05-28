<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6">
    <h2 class="text-white text-2xl font-bold">
      Unirse a sala
    </h2>
    <p class="text-white/60 text-sm text-center">
      Introduce el código de 6 caracteres que te ha dado el host.
    </p>

    <input
      v-model="code"
      type="text"
      maxlength="6"
      placeholder="Ej. A3K7ZP"
      class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest uppercase font-bold placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      @keyup.enter="handleJoin"
    >

    <button
      :disabled="code.length < 6 || loading"
      class="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      @click="handleJoin"
    >
      {{ loading ? 'Uniéndome…' : 'Unirse' }}
    </button>

    <button
      class="text-white/50 hover:text-white text-sm transition-colors"
      @click="emit('cancel')"
    >
      Cancelar
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMultiplayerStore } from '@/stores/multiplayer.store'

const emit = defineEmits(['cancel'])
const mp = useMultiplayerStore()

const code = ref('')
const loading = ref(false)

function handleJoin() {
    if (code.value.length < 6) return
    loading.value = true
    mp.joinRoom(code.value.toUpperCase())
    setTimeout(() => { loading.value = false }, 3000)
}
</script>
