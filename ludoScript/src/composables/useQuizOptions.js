// composables/useQuizOptions.js
// ─────────────────────────────────────────────────────────────────────────────
// Aísla la lógica de estilos de los botones de respuesta del Quiz.
// Devuelve `optionClass(idx)` lista para usar en :class="optionClass(idx)".
//
// Reglas visuales:
//   · Sin responder          → neutro con hover
//   · Tras responder:
//       idx === correct       → verde  (aunque no haya sido elegida)
//       idx === selectedAnswer → rojo  (si fue incorrecta)
//       resto                 → atenuado
// ─────────────────────────────────────────────────────────────────────────────

const CLASSES = {
  default: 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/50 cursor-pointer',
  correct: 'bg-emerald-500/30 border-emerald-400 text-emerald-100',
  wrong:   'bg-red-500/30 border-red-400 text-red-100',
  dimmed:  'bg-white/5 border-white/10 text-white/40 cursor-default',
}

/**
 * @param {import('vue').Ref<{ correct: number }>} currentItem
 * @param {import('vue').Ref<number|null>}          selectedAnswer
 * @param {import('vue').Ref<boolean>}              answered
 */
export function useQuizOptions(currentItem, selectedAnswer, answered) {
  function optionClass(idx) {
    if (!answered.value) return CLASSES.default

    const correct = currentItem.value.correct
    if (idx === correct)              return CLASSES.correct
    if (idx === selectedAnswer.value) return CLASSES.wrong
    return CLASSES.dimmed
  }

  return { optionClass }
}
