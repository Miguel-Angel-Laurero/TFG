<template>
  <section class="steps-section">
    <div class="steps-inner">

      <div class="section-header reveal-item" ref="headerRef">
        <span class="section-tag">Cómo funciona</span>
        <h2 class="section-heading font-righteous">
          Tres pasos para<br>transformar tu aprendizaje
        </h2>
      </div>

      <div class="steps-grid">
        <div class="step-card reveal-item" ref="s1">
          <span class="step-num">01</span>
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="step-title">Sube tu temario</h3>
          <p class="step-desc">Importa tus apuntes, PDFs o documentos. LudoScript los convierte en tu base de aprendizaje personalizada.</p>
        </div>

        <div class="step-card reveal-item delay-1" ref="s2">
          <span class="step-num">02</span>
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h3 class="step-title">Aprende con cursos</h3>
          <p class="step-desc">Accede a cursos estructurados con lecciones cortas y prácticas adaptadas a tu nivel y ritmo.</p>
        </div>

        <div class="step-card reveal-item delay-2" ref="s3">
          <span class="step-num">03</span>
          <div class="step-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <h3 class="step-title">Gana puntos y logros</h3>
          <p class="step-desc">Completa retos, sube de nivel y desbloquea logros. Aprender nunca fue tan adictivo.</p>
        </div>
      </div>

      <div class="steps-cta reveal-item" ref="ctaRef">
        <RouterLink to="/register-view" class="btn-primary">Empieza gratis ahora</RouterLink>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const headerRef = ref(null)
const s1 = ref(null)
const s2 = ref(null)
const s3 = ref(null)
const ctaRef = ref(null)

let observer

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
    { threshold: 0.12 }
  )
  ;[headerRef, s1, s2, s3, ctaRef].forEach(r => r.value && observer.observe(r.value))
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.steps-section {
  padding: 7rem 1.5rem;
}

.steps-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
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

.steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;
}

@media (min-width: 768px) {
  .steps-grid { grid-template-columns: repeat(3, 1fr); }
}

.step-card {
  position: relative;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 1.25rem;
  padding: 2.5rem 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  transition: border-color 0.35s, background 0.35s;
}

.step-card:hover {
  border-color: rgba(250, 204, 21, 0.22);
  background: rgba(250, 204, 21, 0.025);
}

.step-num {
  position: absolute;
  top: -1rem;
  right: 1.2rem;
  font-size: 5.5rem;
  font-weight: 900;
  font-family: 'Righteous', cursive;
  color: rgba(255, 255, 255, 0.035);
  line-height: 1;
  user-select: none;
}

.step-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: rgba(250, 204, 21, 0.07);
  border: 1px solid rgba(250, 204, 21, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon svg {
  width: 1.4rem;
  height: 1.4rem;
  color: #facc15;
}

.step-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.step-desc {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.75;
  margin: 0;
}

.steps-cta {
  display: flex;
  justify-content: center;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  background: #facc15;
  color: #000;
  padding: 0.9rem 2.5rem;
  border-radius: 0 0.875rem 0 0.875rem;
  font-weight: 700;
  font-size: 1rem;
  border-bottom: 3px solid #a16207;
  border-left: 3px solid #a16207;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
}

.btn-primary:hover {
  background: #fde047;
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(250, 204, 21, 0.25);
}

/* ── Reveal ── */
.reveal-item {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.delay-1 { transition-delay: 0.12s; }
.delay-2 { transition-delay: 0.24s; }

.reveal-item.revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>
