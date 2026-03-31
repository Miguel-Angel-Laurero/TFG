<template>
  <div class="hero-section" ref="heroRef">
    <!-- Parallax background layers -->
    <div class="hero-bg">
      <div class="orb orb-yellow" ref="orbY"></div>
      <div class="orb orb-indigo" ref="orbI"></div>
      <div class="orb orb-accent" ref="orbA"></div>
      <div class="dot-pattern"></div>
    </div>

    <!-- Content -->
    <div class="hero-content">
      <div class="hero-badge">
        <span class="badge-dot"></span>
        Aprende · Juega · Progresa
      </div>

      <h1 class="hero-title font-righteous">
        Ludo<span class="title-accent">S</span>cript
      </h1>

      <p class="hero-tagline">
        Aprende programación de forma adictiva.<br class="hidden sm:block">
        Tu temario, convertido en experiencia.
      </p>

      <div class="hero-ctas">
        <RouterLink to="/register-view" class="btn-primary">
          Empieza gratis
          <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </RouterLink>
        <RouterLink to="/login-view/" class="btn-outline">
          Ya tengo cuenta
        </RouterLink>
      </div>
    </div>

    <!-- Scroll cue -->
    <div class="scroll-cue">
      <span class="scroll-text">Scroll</span>
      <div class="scroll-line"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const orbY = ref(null)
const orbI = ref(null)
const orbA = ref(null)

const onScroll = () => {
  const y = window.scrollY
  if (orbY.value) orbY.value.style.transform = `translateY(${y * 0.35}px)`
  if (orbI.value) orbI.value.style.transform = `translateY(${y * -0.18}px)`
  if (orbA.value) orbA.value.style.transform = `translateY(${y * 0.22}px)`
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ── Parallax bg ── */
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.orb-yellow {
  width: 520px;
  height: 520px;
  top: -12%;
  left: -8%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.22) 0%, transparent 70%);
}

.orb-indigo {
  width: 680px;
  height: 680px;
  bottom: -22%;
  right: -12%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, transparent 70%);
}

.orb-accent {
  width: 300px;
  height: 300px;
  bottom: 25%;
  left: 28%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, transparent 70%);
}

.dot-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse 80% 80% at center, black, transparent);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at center, black, transparent);
}

/* ── Content ── */
.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.75rem;
  padding: 2rem 1.5rem;
  max-width: 900px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(250, 204, 21, 0.3);
  background: rgba(250, 204, 21, 0.05);
  color: rgba(250, 204, 21, 0.85);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #facc15;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.6); }
}

.hero-title {
  font-size: clamp(3.5rem, 12vw, 9rem);
  font-weight: 900;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 0;
}

.title-accent {
  color: #facc15;
}

.hero-tagline {
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  color: rgba(255, 255, 255, 0.4);
  max-width: 520px;
  line-height: 1.75;
  margin: 0;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #facc15;
  color: #000;
  padding: 0.9rem 2.25rem;
  border-radius: 0 0.875rem 0 0.875rem;
  font-weight: 700;
  font-size: 0.95rem;
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

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  padding: 0.9rem 2.25rem;
  border-radius: 0 0.875rem 0 0.875rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1.5px solid rgba(255, 255, 255, 0.13);
  transition: border-color 0.2s, color 0.2s, transform 0.2s;
  text-decoration: none;
}

.btn-outline:hover {
  border-color: rgba(250, 204, 21, 0.6);
  color: #facc15;
  transform: translateY(-2px);
}

/* ── Scroll cue ── */
.scroll-cue {
  position: absolute;
  bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: scroll-float 3s ease-in-out infinite;
}

.scroll-text {
  color: rgba(255, 255, 255, 0.18);
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
}

@keyframes scroll-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(7px); }
}
</style>

