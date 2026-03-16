<script setup>
import { useFlashcards } from '@/composables/useFlashCards'

const initialCards = [
  { question: '¿Capital de Francia?', answer: 'París' },
  { question: '¿2 + 2?', answer: '4' }
]

// 2. Extraemos las funciones y variables reactivas
// Aquí ocurre la "magia": el componente solo recibe lo que necesita
const { currentCard, isFlipped, flip, next } = useFlashcards(initialCards)
</script>

<template>
  <div class="flex flex-col items-center gap-8 p-10">
    <div class="group w-100 h-64 cursor-pointer" @click="flip">
    
    <div 
      class="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d]"
      :class="{ '[transform:rotateY(180deg)]': isFlipped }"
    >
      
      <div class="absolute inset-0 w-full h-full bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 [backface-visibility:hidden]">
        <span class="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Pregunta</span>
        <p class="text-2xl font-bold text-gray-800 text-center">{{ currentCard.question }}</p>
      </div>

      <div class="absolute inset-0 w-full h-full bg-sky-200 border border-gray-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]">
        <span class="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Respuesta</span>
        <p class="text-2xl font-semibold text-gray-600 text-center">{{ currentCard.answer }}</p>
      </div>

    </div>
  </div>

    <button @click.stop="next" class="bg-white border border-gray-200 rounded-xl p-4 hover:cursor-pointer">Siguiente Carta →</button>
  </div>
</template>