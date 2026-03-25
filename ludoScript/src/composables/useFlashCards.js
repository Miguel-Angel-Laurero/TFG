import { ref, computed } from 'vue';

export function useFlashcards(initialCards) {
  // ✅ Elimina el ref interno, usa el que viene de fuera directamente
  const currentIndex = ref(0);
  const isFlipped = ref(false);

  // initialCards ya es un ref, accede a .value directamente
  const currentCard = computed(() => initialCards.value[currentIndex.value]);

  const flip = () => (isFlipped.value = !isFlipped.value);

const next = () => {
  isFlipped.value = false; 
  setTimeout(() => {
    currentIndex.value++;   
  }, 300); 
};

  const restart = () => {
    currentIndex.value = 0;
    isFlipped.value = false;
  };

  return { currentCard, isFlipped, flip, next, restart, currentIndex };
}