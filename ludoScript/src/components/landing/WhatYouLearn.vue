<template>
  <section class="features-section">
    <div class="features-inner">

      <!-- Header -->
      <div class="section-header reveal-item" ref="headerRef">
        <span class="section-tag">Qué aprenderás</span>
        <h2 class="section-heading font-righteous">
          Tu temario,<br>convertido en experiencia
        </h2>
        <p class="section-sub">Sube tus archivos y LudoScript hace el resto.</p>
      </div>

      <!-- Flashcards -->
      <div class="feature-row reveal-item" ref="f1">
        <div class="feature-image">
          <img
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/landing/flashcards.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbGFuZGluZy9mbGFzaGNhcmRzLnBuZyIsImlhdCI6MTc3NDI1MzMyMCwiZXhwIjoxODA1Nzg5MzIwfQ.wk8LCd2LUaASFzUkIblb6PS2JBqX0HYbmEjFWG2tcyo"
            alt="Flashcards automáticas"
            class="feature-img"
          >
        </div>
        <div class="feature-text">
          <div class="feature-label">🃏</div>
          <h3 class="feature-title font-righteous">Flashcards automáticas</h3>
          <p class="feature-desc">LudoScript extrae los conceptos clave de tus apuntes y genera tarjetas de repaso listas para usar. Sin esfuerzo extra.</p>
        </div>
      </div>

      <!-- Tests -->
      <div class="feature-row feature-row-reverse reveal-item" ref="f2">
        <div class="feature-image">
          <img
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/landing/test.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbGFuZGluZy90ZXN0LnBuZyIsImlhdCI6MTc3NDI1MTExMiwiZXhwIjoxODA1Nzg3MTEyfQ.2Z5U1_NbIld-mTD0j7HOsZPHvnUssshTlu4j7gHs9qA"
            alt="Tests tipo examen"
            class="feature-img"
          >
        </div>
        <div class="feature-text">
          <div class="feature-label">📝</div>
          <h3 class="feature-title font-righteous">Tests tipo examen</h3>
          <p class="feature-desc">Genera preguntas de opción múltiple basadas en tu propio material para ponerte a prueba antes del examen.</p>
        </div>
      </div>

      <!-- Progreso -->
      <div class="feature-row reveal-item" ref="f3">
        <div class="feature-image feature-image-empty">
          <div class="empty-block">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
        </div>
        <div class="feature-text">
          <div class="feature-label">📈</div>
          <h3 class="feature-title font-righteous">Seguimiento de progreso</h3>
          <p class="feature-desc">Visualiza cuánto has avanzado, qué temas dominas y en cuáles necesitas reforzar para llegar al examen preparado.</p>
        </div>
      </div>

      <!-- Retos -->
      <div class="feature-row feature-row-reverse reveal-item" ref="f4">
        <div class="feature-image feature-image-empty">
          <div class="empty-block">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
        </div>
        <div class="feature-text">
          <div class="feature-label">🏆</div>
          <h3 class="feature-title font-righteous">Retos y ejercicios</h3>
          <p class="feature-desc">Completa retos prácticos, gana puntos y desbloquea logros mientras refuerzas lo aprendido.</p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const headerRef = ref(null)
const f1 = ref(null)
const f2 = ref(null)
const f3 = ref(null)
const f4 = ref(null)

let observer

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
    { threshold: 0.12 }
  )
  ;[headerRef, f1, f2, f3, f4].forEach(r => r.value && observer.observe(r.value))
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.features-section {
  padding: 7rem 1.5rem;
}

.features-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6rem;
}

.section-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.section-tag {
  display: inline-block;
  padding: 0.3rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(250, 204, 21, 0.25);
  background: rgba(250, 204, 21, 0.04);
  color: rgba(250, 204, 21, 0.7);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.section-heading {
  font-size: clamp(1.8rem, 5vw, 3.5rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0;
}

.section-sub {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Feature rows */
.feature-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

@media (min-width: 768px) {
  .feature-row { flex-direction: row; gap: 5rem; }
  .feature-row-reverse { flex-direction: row-reverse; }
}

.feature-image {
  flex: 1;
  min-width: 0;
}

.feature-img {
  width: 100%;
  border-radius: 1.25rem;
  object-fit: contain;
  mask-image: radial-gradient(ellipse 90% 90% at center, black 50%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 90% 90% at center, black 50%, transparent 100%);
}

.feature-image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-block {
  width: 100%;
  aspect-ratio: 4/3;
  max-width: 420px;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-block svg {
  width: 4rem;
  height: 4rem;
  color: rgba(255, 255, 255, 0.1);
}

.feature-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-label {
  font-size: 1.75rem;
  line-height: 1;
}

.feature-title {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin: 0;
}

.feature-desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.75;
  margin: 0;
}

/* Reveal */
.reveal-item {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.reveal-item.revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>
