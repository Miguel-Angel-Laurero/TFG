<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('cancel')" />
        
        <div class="relative z-10 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl p-6 w-full max-w-[340px] flex flex-col items-center gap-4 transition-all transform">
          
          <div class="bg-white/5 p-4 rounded-2xl">
            <img :src="product?.img" :alt="product?.name" class="w-20 h-20 md:w-24 md:h-24 object-contain" />
          </div>

          <div class="space-y-1">
            <h2 class="text-xl font-bold text-white text-center font-righteous">{{ product?.name }}</h2>
            <p class="text-gray-400 text-sm text-center px-2">
              ¿Confirmas la compra por
              <span class="font-bold text-yellow-400 whitespace-nowrap">{{ product?.price }} monedas</span>?
            </p>
          </div>

          <div v-if="errorMsg" class="w-full bg-red-900/30 border border-red-500/50 rounded-xl px-4 py-2 text-red-400 text-xs text-center animate-shake">
            {{ errorMsg }}
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              class="order-2 sm:order-1 flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-all active:scale-95"
              @click="$emit('cancel')"
              :disabled="loading"
            >
              Cancelar
            </button>
            <button
              class="order-1 sm:order-2 flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-lg shadow-teal-900/20 active:scale-95 disabled:opacity-50"
              @click="handleConfirm"
              :disabled="loading"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
              {{ loading ? 'Procesando' : 'Comprar' }}
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
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>