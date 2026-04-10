<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('cancel')" />
        <div class="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 w-80 flex flex-col items-center gap-4">
          <img :src="product?.img" :alt="product?.name" class="w-24 h-24 object-contain" />
          <h2 class="text-lg font-bold text-white text-center">{{ product?.name }}</h2>
          <p class="text-gray-400 text-sm text-center">
            ¿Confirmas la compra por
            <span class="font-bold text-yellow-400">{{ product?.price }} monedas</span>?
          </p>

          <!-- Error inline -->
          <div v-if="errorMsg" class="w-full bg-red-900/50 border border-red-500 rounded-xl px-4 py-2 text-red-400 text-sm text-center">
            {{ errorMsg }}
          </div>

          <div class="flex gap-3 w-full mt-2">
            <button
              class="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold transition-colors"
              @click="$emit('cancel')"
              :disabled="loading"
            >
              Cancelar
            </button>
            <button
              class="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors disabled:opacity-50"
              @click="handleConfirm"
              :disabled="loading"
            >
              {{ loading ? 'Comprando...' : 'Comprar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTransaction } from '@/composables/useTransaction'

const props = defineProps({
  visible: Boolean,
  product: Object,
})

const emit = defineEmits(['confirm', 'cancel'])

const { buyItem } = useTransaction()
const loading = ref(false)
const errorMsg = ref('')

// Limpiar error al abrir el modal
watch(() => props.visible, (val) => {
  if (val) errorMsg.value = ''
})

async function handleConfirm() {
  loading.value = true
  errorMsg.value = ''
  try {
    await buyItem(props.product)
    emit('confirm')
  } catch (err) {
    errorMsg.value = err.response?.data?.message ?? 'Error al procesar la compra'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>