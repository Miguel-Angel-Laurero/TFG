<template>
  <!-- Pantalla de carga -->
  <div v-if="loading" class="flex items-center justify-center h-64">
    <p class="text-white text-xl animate-pulse">Cargando preguntas...</p>
  </div>

  <!-- Pantalla de resultados -->
  <div
    v-else-if="finished"
    class="flex flex-col items-center gap-6 p-10 w-full max-w-2xl mx-auto"
  >
    <div class="bg-white/10 backdrop-blur rounded-3xl p-10 w-full text-center flex flex-col gap-6 shadow-2xl">
      <h1 class="text-4xl font-bold text-white">Resultado final</h1>

      <div class="grid grid-cols-3 gap-4 text-white">
        <div class="bg-emerald-500/30 rounded-2xl p-4">
          <p class="text-3xl font-bold">{{ correctCount }}</p>
          <p class="text-sm mt-1 text-emerald-200">Correctas</p>
        </div>
        <div class="bg-red-500/30 rounded-2xl p-4">
          <p class="text-3xl font-bold">{{ wrongCount }}</p>
          <p class="text-sm mt-1 text-red-200">Incorrectas</p>
        </div>
        <div class="bg-gray-500/30 rounded-2xl p-4">
          <p class="text-3xl font-bold">{{ unansweredCount }}</p>
          <p class="text-sm mt-1 text-gray-300">Sin responder</p>
        </div>
      </div>

      <!-- Puntuación tipo test -->
      <div class="bg-white/20 rounded-2xl p-6">
        <p class="text-white/70 text-sm mb-1">Puntuación (cada 3 errores descuestan 1 acierto)</p>
        <p class="text-6xl font-extrabold" :class="scoreColor">
          {{ scoreFormatted }}
        </p>
        <p class="text-white/60 text-xs mt-2">sobre {{ questions.length }} puntos máximos</p>
      </div>

      <button
        @click="restart"
        class="bg-white text-gray-800 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all"
      >
        Volver a intentarlo
      </button>
    </div>
  </div>

  <!-- Pantalla de pregunta -->
  <div v-else class="flex flex-col items-center gap-8 p-8 w-full max-w-3xl mx-auto">
    <div class="text-white/60 text-sm font-medium">
      Pregunta {{ currentIndex + 1 }} de {{ questions.length }}
    </div>

    <h2 class="text-white text-2xl font-bold text-center leading-snug">
      {{ currentQuestion.question }}
    </h2>

    <!-- Opciones -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <button
        v-for="(option, idx) in currentQuestion.options"
        :key="idx"
        :disabled="answered"
        @click="selectAnswer(idx)"
        class="text-left px-6 py-5 rounded-2xl border-2 font-medium transition-all duration-300"
        :class="optionClass(idx)"
      >
        <span class="font-bold mr-2 opacity-60">{{ labels[idx] }}.</span>
        {{ option }}
      </button>
    </div>

    <!-- Feedback -->
    <transition name="fade">
      <p v-if="answered" class="text-lg font-semibold" :class="selectedAnswer === currentQuestion.correct ? 'text-emerald-400' : 'text-red-400'">
        {{ selectedAnswer === currentQuestion.correct ? '¡Correcto!' : 'Incorrecto' }}
      </p>
    </transition>

    <!-- Botón siguiente -->
    <button
      v-if="answered"
      @click="nextQuestion"
      class="bg-white text-gray-800 font-bold py-3 px-10 rounded-xl hover:bg-gray-100 transition-all"
    >
      {{ currentIndex + 1 < questions.length ? 'Siguiente →' : 'Ver resultado' }}
    </button>
  </div>
</template>

<script setup>
// ─── Imports ──────────────────────────────────────────────────────────────────
// ref: crea variables reactivas (cualquier cambio en su .value actualiza el DOM)
// computed: crea valores derivados que se recalculan automáticamente cuando
//           cambian las refs de las que dependen
// onMounted: hook del ciclo de vida que se ejecuta una vez el componente está
//            añadido al DOM (aquí lo usamos para hacer el fetch inicial)
import { ref, computed, onMounted } from 'vue'

// Composable compartido entre todos los minijuegos para manejar la barra
// de progreso del componente InGame.vue que envuelve a este componente
import { useGameProgress } from '@/composables/useGameProgress'

// ─── Estado del composable de progreso ────────────────────────────────────────
// updateProgress(n): pone la barra al n% (0-100)
// resetProgress():   vuelve la barra a 0
const { updateProgress, resetProgress } = useGameProgress()

// ─── Constantes ───────────────────────────────────────────────────────────────
// Etiquetas de las opciones mostradas al usuario (A, B, C, D)
// Se usa el índice numérico internamente para comparar con `correct` del JSON
const labels = ['A', 'B', 'C', 'D']

// ─── Estado reactivo ──────────────────────────────────────────────────────────
const questions = ref([])      // Array de preguntas cargadas desde el JSON
const loading = ref(true)      // Controla si mostrar el spinner inicial
const finished = ref(false)    // Cuando es true muestra la pantalla de resultados
const currentIndex = ref(0)    // Índice de la pregunta actualmente visible
const selectedAnswer = ref(null) // Índice (0-3) de la opción que eligió el usuario
const answered = ref(false)    // true = el usuario ya respondió esta pregunta
                               // (bloquea los botones y activa el feedback visual)

// Array paralelo a questions: null = no respondida, true = correcta, false = incorrecta
// Se usa para calcular las estadísticas finales sin recorrer el historial de clicks
const results = ref([])

// ─── Carga inicial de datos ───────────────────────────────────────────────────
// Se ejecuta una sola vez al montar el componente.
// fetch() devuelve una Promise; con async/await esperamos la respuesta antes
// de continuar. El archivo está en /public, por lo que Vite lo sirve en la raíz.
onMounted(async () => {
  try {
    const res = await fetch('/quizQuestions.json')
    const data = await res.json()
    // sort(() => Math.random() - 0.5) mezcla el array de forma aleatoria
    // (Fisher-Yates aproximado): Math.random() da un valor entre 0 y 1,
    // restando 0.5 obtenemos positivos o negativos con igual probabilidad,
    // lo que hace que sort reordene aleatoriamente
    questions.value = data.sort(() => Math.random() - 0.5)
    // Inicializamos el array de resultados con null (sin responder) para cada pregunta
    results.value = new Array(questions.value.length).fill(null)
    resetProgress()
  } catch (e) {
    console.error('Error cargando las preguntas del quiz', e)
  } finally {
    // finally se ejecuta siempre (con éxito o con error) para quitar el spinner
    loading.value = false
  }
})

// ─── Pregunta actual ──────────────────────────────────────────────────────────
// computed reactivo: cada vez que currentIndex cambia, currentQuestion
// apunta automáticamente al nuevo objeto de pregunta sin código extra
const currentQuestion = computed(() => questions.value[currentIndex.value])

// ─── Selección de respuesta ───────────────────────────────────────────────────
// Se llama al hacer click en una opción.
// La guarda previene doble-click porque answered se pone a true en el primer click
function selectAnswer(idx) {
  if (answered.value) return
  selectedAnswer.value = idx
  answered.value = true
  // Comparamos el índice clickado con el campo `correct` del JSON (0-3)
  // y guardamos true/false en el array de resultados para esa posición
  results.value[currentIndex.value] = idx === currentQuestion.value.correct
}

// ─── Avanzar a la siguiente pregunta ─────────────────────────────────────────
function nextQuestion() {
  const next = currentIndex.value + 1
  // Actualizamos la barra de progreso proporcional a cuántas preguntas llevamos
  updateProgress((next / questions.value.length) * 100)

  if (next >= questions.value.length) {
    // Si ya no hay más preguntas, mostramos la pantalla de resultados
    finished.value = true
    updateProgress(100)
  } else {
    // Si hay más preguntas, avanzamos el índice y reseteamos el estado
    // de la pregunta actual para la siguiente
    currentIndex.value = next
    selectedAnswer.value = null
    answered.value = false
  }
}

// ─── Reiniciar el quiz ────────────────────────────────────────────────────────
// Vuelve al estado inicial mezclando las preguntas de nuevo para variar el orden
function restart() {
  questions.value = questions.value.sort(() => Math.random() - 0.5)
  results.value = new Array(questions.value.length).fill(null)
  currentIndex.value = 0
  selectedAnswer.value = null
  answered.value = false
  finished.value = false
  resetProgress()
}

// ─── Computadas de estadísticas ───────────────────────────────────────────────
// filter(r => r === true) recorre el array de resultados y devuelve los que
// cumplen la condición; .length da el total de coincidencias
const correctCount = computed(() => results.value.filter(r => r === true).length)
const wrongCount = computed(() => results.value.filter(r => r === false).length)
// null significa que el usuario no llegó a responder esa pregunta (si salió antes)
const unansweredCount = computed(() => results.value.filter(r => r === null).length)

// ─── Puntuación tipo test ─────────────────────────────────────────────────────
// Fórmula estándar de examen tipo test:
//   puntuación = aciertos - (errores / (nOpciones - 1))
// Con 4 opciones: penalización = errores / 3
// Math.max(0, ...) garantiza que la nota nunca sea negativa
const score = computed(() => {
  const raw = correctCount.value - wrongCount.value / 3
  return Math.max(0, raw)
})

// toFixed(2) formatea el número con 2 decimales para mostrarlo en pantalla
const scoreFormatted = computed(() => score.value.toFixed(2))

// Color dinámico de la nota según el porcentaje sobre el máximo posible
const scoreColor = computed(() => {
  const pct = score.value / questions.value.length
  if (pct >= 0.9) return 'text-emerald-400' // Notable/Sobresaliente
  if (pct >= 0.5) return 'text-yellow-400'  // Aprobado
  return 'text-red-400'                      // Suspenso
})

// ─── Clases CSS dinámicas por opción ─────────────────────────────────────────
// Esta función se llama en el template con :class="optionClass(idx)"
// y devuelve las clases de Tailwind adecuadas según el estado actual:
//  - Antes de responder: estilo neutro con hover
//  - Después de responder:
//      · opción correcta → verde (siempre, aunque no la hayas elegido)
//      · opción elegida incorrecta → rojo
//      · resto de opciones → atenuadas
function optionClass(idx) {
  const correct = currentQuestion.value.correct
  if (!answered.value) {
    return 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/50 cursor-pointer'
  }
  if (idx === correct) {
    return 'bg-emerald-500/30 border-emerald-400 text-emerald-100'
  }
  if (idx === selectedAnswer.value) {
    return 'bg-red-500/30 border-red-400 text-red-100'
  }
  return 'bg-white/5 border-white/10 text-white/40 cursor-default'
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>