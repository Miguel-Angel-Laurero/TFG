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
      currentIndex.value = (currentIndex.value + 1) % cards.value.length;
    }, 150);
  };

  return { currentCard, isFlipped, flip, next, currentIndex };
}