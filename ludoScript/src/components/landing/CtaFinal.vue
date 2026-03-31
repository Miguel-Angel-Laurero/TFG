<template>
  <section class="cta-section">
    <div class="cta-glow"></div>

    <div class="cta-inner reveal-item" ref="ctaRef">
      <div class="cta-icon">✨</div>

      <h2 class="cta-heading font-righteous">
        ¿Listo para empezar?
      </h2>

      <p class="cta-sub">
        Únete a LudoScript, sube tu temario y empieza a aprender de una forma que engancha.
      </p>

      <div class="cta-buttons">
        <RouterLink to="/register-view" class="btn-primary">
          Crear cuenta gratis
        </RouterLink>
        <RouterLink to="/login-view" class="btn-outline">
          Ya tengo cuenta
        </RouterLink>
      </div>

      <p class="cta-note">Sin tarjeta de crédito · Gratis para empezar</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const ctaRef = ref(null)
let observer

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
    { threshold: 0.2 }
  )
  if (ctaRef.value) observer.observe(ctaRef.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.cta-section {
  position: relative;
  padding: 8rem 1.5rem;
  overflow: hidden;
}

.cta-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at center, rgba(250, 204, 21, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.cta-inner {
  position: relative;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.cta-icon {
  font-size: 2.75rem;
  line-height: 1;
  filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.45));
}

.cta-heading {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin: 0;
}

.cta-sub {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.42);
  max-width: 500px;
  line-height: 1.7;
  margin: 0;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
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
  box-shadow: 0 12px 40px rgba(250, 204, 21, 0.28);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.9rem 2.5rem;
  border-radius: 0 0.875rem 0 0.875rem;
  font-weight: 600;
  font-size: 1rem;
  border: 1.5px solid rgba(255, 255, 255, 0.13);
  transition: border-color 0.2s, color 0.2s, transform 0.2s;
  text-decoration: none;
}

.btn-outline:hover {
  border-color: rgba(250, 204, 21, 0.6);
  color: #facc15;
  transform: translateY(-2px);
}

.cta-note {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.2);
  margin: 0;
  letter-spacing: 0.02em;
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

