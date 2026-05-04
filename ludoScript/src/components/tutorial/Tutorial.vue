<template>
  <div v-if="tutorial.isVisible" class="fixed inset-0 z-50 overflow-hidden">
    
    <div 
      class="absolute inset-0 transition-all duration-700 ease-in-out bg-blue-950/60 backdrop-blur-md"
      :style="{ clipPath: spotlightPath }"
    ></div>

    <div class="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-8">
      
      <div 
        class="flex flex-col items-center transition-all duration-700 ease-in-out w-full"
        :class="[
          tutorial.step === 3 
            ? 'max-w-8xl sm:flex-row-reverse sm:justify-between px-4 sm:px-10' 
            : 'max-w-4xl sm:flex-row justify-center gap-6 sm:gap-10'
        ]"
      >
        <img 
          :src="IMAGES.profesor" 
          alt="Ludo" 
          class="w-40 sm:w-64 md:w-80 lg:w-96 mb-4 sm:mb-0 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)] transition-all duration-700"
          :class="{ 'opacity-0 sm:opacity-100': tutorial.step === 3 && isMobile }"
        >

        <div class="w-full max-w-md transition-all duration-700">
          
          <div v-if="tutorial.step === 0" class="text-center space-y-4 sm:space-y-5">
            <h1 class="text-2xl sm:text-4xl font-bold text-white font-righteous">¡Hola, soy Ludo!</h1>
            <p class="text-sm sm:text-base text-gray-300">
              Bienvenido a <strong>LudoScript</strong> tu plataforma de aprendizaje. Aquí aprenderás a programar de forma entretenida y dinámica. ¿Quieres ver cómo funciona la plataforma?
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button @click="tutorial.closeTutorial()" class="order-2 sm:order-1 flex-1 py-3 px-6 rounded-xl bg-gray-800 text-gray-300 cursor-pointer text-sm sm:text-base">Ahora no</button>
              <button @click="tutorial.nextStep()" class="order-1 sm:order-2 flex-1 py-3 px-6 rounded-xl bg-yellow-500 text-white font-bold cursor-pointer text-sm sm:text-base">¡Enséñame!</button>
            </div>
          </div>

          <div v-else-if="tutorial.step === 1" class="text-center space-y-4 sm:space-y-5">
            <h2 class="text-xl sm:text-2xl font-bold text-yellow-500">Documentos y categorías</h2>
            <p class="text-sm sm:text-base text-gray-300">Aquí elegirás los temas que usarás para realizar las actividades. Selecciona entre las categorías predefinidas o usa tus propios PDFs. ¡Mira cómo se ilumina la zona izquierda!</p>
            <button @click="tutorial.nextStep()" class="w-full py-3 rounded-xl bg-yellow-500 text-white font-bold cursor-pointer">Siguiente</button>
          </div>

          <div v-else-if="tutorial.step === 2" class="text-center sm:text-justify space-y-4 sm:space-y-5">
            <h2 class="text-xl sm:text-2xl font-bold text-yellow-500 font-righteous">Resultados en vivo</h2>
            <p class="text-sm sm:text-base text-gray-300">A la derecha podrás ver las estadísticas de tus últimas actividades para controlar tu progreso.</p>
            <button @click="tutorial.nextStep()" class="w-full py-3 rounded-xl bg-yellow-500 text-white font-bold cursor-pointer">Siguiente</button>
          </div>

          <div v-else-if="tutorial.step === 3" class="text-center space-y-4 sm:space-y-5">
            <h2 class="text-xl sm:text-2xl font-bold text-yellow-500">Modos de juego</h2>
            <p class="text-sm sm:text-base text-gray-300">En la sección central podrás elegir las actividades, ponte a prueba con los test, repasa con tarjetas de memoria o enfréntate a otros usuarios en el modo multijugador.</p>
            <button @click="tutorial.closeTutorial()" class="w-full py-3 rounded-xl bg-yellow-500 text-white font-bold cursor-pointer">¡Quiero empezar!</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue' // Añadimos watch
import { useTutorialStore } from '@/stores/tutorial.store'
import { IMAGES } from '@/utils/imgBucketStorage.js'

const tutorial = useTutorialStore()

// Lógica para detectar móvil
const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth }
onMounted(() => {
  window.addEventListener('resize', updateWidth)
})
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const isMobile = computed(() => windowWidth.value < 640)

/**
 * LOGICA DE SCROLL AUTOMÁTICO
 * Vigilamos el cambio de paso para mover la pantalla
 */
watch(() => tutorial.step, (newStep) => {
  if (!isMobile.value || !tutorial.isVisible) return

  // Definimos a qué ID de tu app debe ir cada paso
  const sectionIds = {
    1: '#seccion-documentos', // Cambia estos IDs por los que tengas en tu App
    2: '#seccion-estadisticas',
    3: '#seccion-juegos'
  }

  const targetId = sectionIds[newStep]
  if (targetId) {
    const element = document.querySelector(targetId)
    if (element) {
      // scrollIntoView mueve la pantalla suavemente
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' // Centra el elemento en la pantalla
      })
    }
  }
})

// Tu lógica de spotlightPath se mantiene igual
const spotlightPath = computed(() => {
  if (isMobile.value) {
    switch (tutorial.step) {
      case 1: return 'polygon(0% 40%, 100% 40%, 100% 100%, 0% 100%)'
      case 2: return 'polygon(0% 0%, 100% 0%, 100% 60%, 0% 60%)'
      case 3: return 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 0% 20%, 100% 20%, 100% 80%, 0% 80%, 0% 30%)'
      default: return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
    }
  }

  switch (tutorial.step) {
    case 1: return 'polygon(16% 0%, 100% 0%, 100% 100%, 16% 100%)'
    case 2: return 'polygon(0% 0%, 84% 0%, 84% 100%, 0% 100%)'
    case 3: return 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 20% 15%, 70% 15%, 70% 85%, 30% 85%, 30% 15%)'
    default: return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
  }
})
</script>

<style scoped>
/* Aseguramos que la transición sea aplicada al clip-path */
div {
  transition: clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>