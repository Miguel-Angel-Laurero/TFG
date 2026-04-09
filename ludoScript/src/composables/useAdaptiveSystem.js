import { ref } from 'vue'

/**
 * Spanish stopwords to filter out during keyword extraction.
 * Filtering these improves the quality of similarity matching.
 */
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'en', 'y', 'e', 'o', 'u', 'a', 'al',
  'se', 'su', 'sus', 'que', 'qué', 'con', 'por', 'para',
  'como', 'cómo', 'si', 'no', 'es', 'son', 'fue', 'ser',
  'estar', 'tiene', 'hay', 'este', 'esta', 'ese', 'esa',
  'lo', 'le', 'les', 'me', 'te', 'nos', 'más', 'también',
  'pero', 'sin', 'sobre', 'entre', 'cuando', 'donde', 'qué',
  'cuál', 'cuáles', 'cuándo', 'dónde', 'cómo', 'quién',
  'quiénes', 'cuánto', 'cuántos', 'cuántas', 'cuánta',
  'cada', 'todo', 'toda', 'todos', 'todas', 'otro', 'otra',
  'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas',
  'tan', 'tanto', 'tanta', 'tantos', 'tantas',
  'muy', 'bien', 'mal', 'así', 'ya', 'solo', 'sólo',
  'aún', 'aunque', 'porque', 'pues', 'sino', 'ni',
])

/**
 * Extracts meaningful keywords from a text string.
 * Removes punctuation, converts to lowercase, splits by whitespace,
 * and filters out short words and stopwords.
 *
 * @param {string} text
 * @returns {string[]} Array of keywords
 */
export function extractKeywords(text) {
  if (!text || typeof text !== 'string') return []
  return text
    .toLowerCase()
    .replace(/[¿?¡!.,;:()'"""«»\-_]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
}

/**
 * Calculates the Jaccard similarity coefficient between two arrays of keywords.
 * Returns a value between 0 (no overlap) and 1 (identical sets).
 *
 * @param {string[]} keywords1
 * @param {string[]} keywords2
 * @returns {number} Similarity score [0, 1]
 */
export function calculateSimilarity(keywords1, keywords2) {
  if (keywords1.length === 0 || keywords2.length === 0) return 0
  const set1 = new Set(keywords1)
  const set2 = new Set(keywords2)
  const intersectionSize = [...set1].filter(w => set2.has(w)).length
  const unionSize = new Set([...set1, ...set2]).size
  return unionSize === 0 ? 0 : intersectionSize / unionSize
}

/**
 * Composable that powers the adaptive review system.
 *
 * The adaptive system improves on simple category-based matching by using
 * keyword extraction and Jaccard similarity to find questions that share
 * meaningful vocabulary with the question the user got wrong.
 *
 * @param {import('vue').Ref<Array<{question: string, answer: string}>>} allCards
 */
export function useAdaptiveSystem(allCards) {
  /** Cards the user answered incorrectly */
  const failedCards = ref([])

  /** Questions of cards already added to avoid duplicates */
  const _seenInAdaptive = ref(new Set())

  /**
   * Records a card as answered incorrectly.
   * Duplicate failures for the same question are ignored.
   *
   * @param {{ question: string, answer: string }} card
   */
  function recordFailure(card) {
    const alreadyRecorded = failedCards.value.some(
      c => c.question === card.question,
    )
    if (!alreadyRecorded) {
      failedCards.value.push(card)
    }
  }

  /**
   * Finds up to `limit` cards from `allCards` that are most similar
   * (by keyword overlap) to the given `failedCard`.
   *
   * Steps:
   *  1. Combine question + answer text for each card.
   *  2. Extract keywords for the failed card and for each candidate card.
   *  3. Compute Jaccard similarity for every candidate.
   *  4. Return the top `limit` candidates with similarity > 0, sorted
   *     by descending similarity score.
   *
   * @param {{ question: string, answer: string }} failedCard
   * @param {number} [limit=3] Maximum number of related cards to return
   * @returns {Array<{question: string, answer: string}>}
   */
  function getRelatedCards(failedCard, limit = 3) {
    const failedText = `${failedCard.question} ${failedCard.answer}`
    const failedKeywords = extractKeywords(failedText)

    return allCards.value
      .filter(card => card.question !== failedCard.question)
      .map(card => {
        const cardText = `${card.question} ${card.answer}`
        const cardKeywords = extractKeywords(cardText)
        const score = calculateSimilarity(failedKeywords, cardKeywords)
        return { card, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ card }) => card)
  }

  /**
   * Builds the adaptive review sequence.
   *
   * For each failed card (in the order they were recorded):
   *  - Add the failed card itself first.
   *  - Then add its most related cards (by keyword similarity).
   * Cards that have already been added to the sequence are skipped to
   * avoid repetition.
   *
   * @returns {Array<{question: string, answer: string}>}
   */
  function buildAdaptiveSequence() {
    if (failedCards.value.length === 0) return []

    const sequence = []
    _seenInAdaptive.value = new Set()

    for (const failed of failedCards.value) {
      if (!_seenInAdaptive.value.has(failed.question)) {
        sequence.push(failed)
        _seenInAdaptive.value.add(failed.question)

        const related = getRelatedCards(failed)
        for (const rel of related) {
          if (!_seenInAdaptive.value.has(rel.question)) {
            sequence.push(rel)
            _seenInAdaptive.value.add(rel.question)
          }
        }
      }
    }

    return sequence
  }

  /** Resets the adaptive system state (failed cards, seen set). */
  function reset() {
    failedCards.value = []
    _seenInAdaptive.value = new Set()
  }

  return {
    failedCards,
    recordFailure,
    getRelatedCards,
    buildAdaptiveSequence,
    reset,
  }
}
