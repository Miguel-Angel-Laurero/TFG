import { ref, computed } from 'vue';

export function useFlashcards(initialCards) {
  const cards = ref(initialCards);
  const currentIndex = ref(0);
  const isFlipped = ref(false);

  const currentCard = computed(() => cards.value[currentIndex.value]);

  const flip = () => (isFlipped.value = !isFlipped.value);
  
  const next = () => {
    isFlipped.value = false;
    setTimeout(() => {
      if (currentIndex.value < cards.value.length - 1) {
        currentIndex.value++;
      }
    }, 150);
  };

  const restart = () => {
    currentIndex.value = 0;
    isFlipped.value = false;
  };

  return { currentCard, isFlipped, flip, next, restart, currentIndex };
}