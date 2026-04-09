import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import {
  extractKeywords,
  calculateSimilarity,
  useAdaptiveSystem,
} from '@/composables/useAdaptiveSystem'

// ─── extractKeywords ─────────────────────────────────────────────────────────

describe('extractKeywords', () => {
  it('converts text to lowercase and splits into tokens', () => {
    const result = extractKeywords('Programación Orientada Objetos')
    expect(result).toContain('programación')
    expect(result).toContain('orientada')
    expect(result).toContain('objetos')
  })

  it('removes common Spanish stopwords', () => {
    const result = extractKeywords('¿Qué es una clase en programación?')
    expect(result).not.toContain('qué')
    expect(result).not.toContain('es')
    expect(result).not.toContain('una')
    expect(result).not.toContain('en')
    expect(result).toContain('clase')
    expect(result).toContain('programación')
  })

  it('removes punctuation characters', () => {
    const result = extractKeywords('¿Qué es un bucle for? ¡Responde!')
    expect(result).not.toContain('¿')
    expect(result).not.toContain('?')
    expect(result).not.toContain('!')
    expect(result).toContain('bucle')
  })

  it('filters out tokens shorter than 3 characters', () => {
    const result = extractKeywords('A B ab abc abcd')
    expect(result).not.toContain('a')
    expect(result).not.toContain('b')
    expect(result).not.toContain('ab')
    expect(result).toContain('abc')
    expect(result).toContain('abcd')
  })

  it('returns an empty array for an empty string', () => {
    expect(extractKeywords('')).toEqual([])
  })

  it('returns an empty array for null or undefined', () => {
    expect(extractKeywords(null)).toEqual([])
    expect(extractKeywords(undefined)).toEqual([])
  })

  it('extracts keywords from a realistic flashcard question', () => {
    const keywords = extractKeywords('¿Qué es la herencia en programación orientada objetos?')
    expect(keywords).toContain('herencia')
    expect(keywords).toContain('programación')
    expect(keywords).toContain('orientada')
    expect(keywords).toContain('objetos')
  })
})

// ─── calculateSimilarity ─────────────────────────────────────────────────────

describe('calculateSimilarity', () => {
  it('returns 1 for identical keyword sets', () => {
    const kw = ['herencia', 'clase', 'objeto']
    expect(calculateSimilarity(kw, kw)).toBe(1)
  })

  it('returns 0 when there is no overlap', () => {
    expect(calculateSimilarity(['herencia', 'clase'], ['bucle', 'array'])).toBe(0)
  })

  it('returns a value between 0 and 1 for partial overlap', () => {
    const score = calculateSimilarity(
      ['herencia', 'clase', 'objeto'],
      ['clase', 'método', 'atributo'],
    )
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('returns 0 when one of the arrays is empty', () => {
    expect(calculateSimilarity([], ['herencia'])).toBe(0)
    expect(calculateSimilarity(['herencia'], [])).toBe(0)
  })

  it('returns 0 when both arrays are empty', () => {
    expect(calculateSimilarity([], [])).toBe(0)
  })

  it('is symmetric: similarity(A, B) === similarity(B, A)', () => {
    const a = ['herencia', 'clase', 'polimorfismo']
    const b = ['clase', 'método', 'herencia']
    expect(calculateSimilarity(a, b)).toBe(calculateSimilarity(b, a))
  })

  it('treats duplicate keywords as one (set semantics)', () => {
    const withDupes = ['clase', 'clase', 'objeto']
    const withoutDupes = ['clase', 'objeto']
    const target = ['clase', 'método']
    expect(calculateSimilarity(withDupes, target)).toBe(
      calculateSimilarity(withoutDupes, target),
    )
  })
})

// ─── useAdaptiveSystem ────────────────────────────────────────────────────────

const PROGRAMMING_CARDS = [
  {
    question: '¿Qué es la herencia en programación orientada a objetos?',
    answer: 'Mecanismo por el que una clase hija hereda atributos y métodos de una clase padre',
  },
  {
    question: '¿Qué es el polimorfismo?',
    answer: 'Capacidad de una clase de comportarse de distintas formas según el contexto',
  },
  {
    question: '¿Qué es una clase abstracta?',
    answer: 'Clase que no puede instanciarse directamente y sirve de plantilla para otras clases',
  },
  {
    question: '¿Qué es un bucle for?',
    answer: 'Estructura de control que repite un bloque de código un número definido de veces',
  },
  {
    question: '¿Qué es un array?',
    answer: 'Estructura de datos que almacena una colección de elementos del mismo tipo',
  },
  {
    question: '¿Qué es la encapsulación?',
    answer: 'Principio que oculta los detalles internos de una clase y expone solo una interfaz pública',
  },
]

describe('useAdaptiveSystem', () => {
  let allCards
  let adaptive

  beforeEach(() => {
    allCards = ref([...PROGRAMMING_CARDS])
    adaptive = useAdaptiveSystem(allCards)
  })

  // ── recordFailure ──────────────────────────────────────────────────────────

  describe('recordFailure', () => {
    it('adds a card to failedCards', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      expect(adaptive.failedCards.value).toHaveLength(1)
      expect(adaptive.failedCards.value[0]).toEqual(PROGRAMMING_CARDS[0])
    })

    it('does not add the same card twice', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      expect(adaptive.failedCards.value).toHaveLength(1)
    })

    it('records multiple distinct cards', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      adaptive.recordFailure(PROGRAMMING_CARDS[1])
      expect(adaptive.failedCards.value).toHaveLength(2)
    })
  })

  // ── getRelatedCards ────────────────────────────────────────────────────────

  describe('getRelatedCards', () => {
    it('returns cards related to the failed OOP card (not the card itself)', () => {
      const failedCard = PROGRAMMING_CARDS[0] // herencia
      const related = adaptive.getRelatedCards(failedCard)

      // Should not include the failed card itself
      expect(related.some(c => c.question === failedCard.question)).toBe(false)
    })

    it('returns at most `limit` cards', () => {
      const related = adaptive.getRelatedCards(PROGRAMMING_CARDS[0], 2)
      expect(related.length).toBeLessThanOrEqual(2)
    })

    it('uses default limit of 3', () => {
      const related = adaptive.getRelatedCards(PROGRAMMING_CARDS[0])
      expect(related.length).toBeLessThanOrEqual(3)
    })

    it('ranks OOP-related cards higher than unrelated cards for an OOP question', () => {
      const failedCard = PROGRAMMING_CARDS[0] // herencia / POO
      const related = adaptive.getRelatedCards(failedCard, 3)

      // polimorfismo (POO) and encapsulación (POO) should appear before bucle/array
      const relatedQuestions = related.map(c => c.question)
      const oopRelated = [
        PROGRAMMING_CARDS[1].question, // polimorfismo
        PROGRAMMING_CARDS[2].question, // clase abstracta
        PROGRAMMING_CARDS[5].question, // encapsulación
      ]
      const hasOopCard = relatedQuestions.some(q => oopRelated.includes(q))
      expect(hasOopCard).toBe(true)
    })

    it('returns an empty array when there are no other cards', () => {
      const singleCardPool = ref([PROGRAMMING_CARDS[0]])
      const sys = useAdaptiveSystem(singleCardPool)
      expect(sys.getRelatedCards(PROGRAMMING_CARDS[0])).toEqual([])
    })
  })

  // ── buildAdaptiveSequence ──────────────────────────────────────────────────

  describe('buildAdaptiveSequence', () => {
    it('returns an empty array when no failures have been recorded', () => {
      expect(adaptive.buildAdaptiveSequence()).toEqual([])
    })

    it('includes the failed card in the sequence', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      const sequence = adaptive.buildAdaptiveSequence()
      expect(sequence.some(c => c.question === PROGRAMMING_CARDS[0].question)).toBe(true)
    })

    it('starts the sequence with the failed card', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      const sequence = adaptive.buildAdaptiveSequence()
      expect(sequence[0].question).toBe(PROGRAMMING_CARDS[0].question)
    })

    it('includes related cards after the failed card', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0]) // herencia
      const sequence = adaptive.buildAdaptiveSequence()
      // sequence[0] = failed card, sequence[1..] = related cards
      expect(sequence.length).toBeGreaterThan(1)
    })

    it('does not repeat any card in the sequence', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      adaptive.recordFailure(PROGRAMMING_CARDS[1])
      const sequence = adaptive.buildAdaptiveSequence()
      const questions = sequence.map(c => c.question)
      const uniqueQuestions = new Set(questions)
      expect(uniqueQuestions.size).toBe(questions.length)
    })

    it('handles multiple failed cards without duplicates', () => {
      PROGRAMMING_CARDS.slice(0, 3).forEach(c => adaptive.recordFailure(c))
      const sequence = adaptive.buildAdaptiveSequence()
      const questions = sequence.map(c => c.question)
      const unique = new Set(questions)
      expect(unique.size).toBe(questions.length)
    })
  })

  // ── reset ──────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears failedCards', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      adaptive.reset()
      expect(adaptive.failedCards.value).toHaveLength(0)
    })

    it('allows recording failures again after reset', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      adaptive.reset()
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      expect(adaptive.failedCards.value).toHaveLength(1)
    })

    it('buildAdaptiveSequence returns empty after reset', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      adaptive.reset()
      expect(adaptive.buildAdaptiveSequence()).toEqual([])
    })
  })

  // ── End-to-end: adaptive sequence is thematically coherent ────────────────

  describe('end-to-end: thematic coherence', () => {
    it('OOP failure leads to an adaptive sequence dominated by OOP cards', () => {
      // Simulate failing the "herencia" (inheritance) card
      adaptive.recordFailure(PROGRAMMING_CARDS[0])
      const sequence = adaptive.buildAdaptiveSequence()

      const oopTopics = ['herencia', 'polimorfismo', 'abstracta', 'encapsulación']
      const sequenceText = sequence.map(c => c.question.toLowerCase()).join(' ')
      const oopCardCount = oopTopics.filter(t => sequenceText.includes(t)).length

      // At least the failed card + 1 related OOP card should appear
      expect(oopCardCount).toBeGreaterThanOrEqual(2)
    })

    it('unrelated topics (bucle) do not dominate OOP adaptive sequence', () => {
      adaptive.recordFailure(PROGRAMMING_CARDS[0]) // herencia (OOP)
      const sequence = adaptive.buildAdaptiveSequence()

      // "bucle" should not be the first related card for an OOP question
      const relatedCards = sequence.slice(1) // skip the failed card itself
      if (relatedCards.length > 0) {
        expect(relatedCards[0].question.toLowerCase()).not.toContain('bucle')
      }
    })
  })
})
