<template>
  <footer class="app-footer" :class="{ dark: isDark }">
    <div class="footer-inner">

      <!-- Marca -->
      <div class="footer-brand">
        <span class="brand-name font-righteous">LudoScript</span>
        <p class="brand-tagline">Aprende a programar jugando.</p>
      </div>

      <!-- Links -->
      <div class="footer-links">
        <span>Privacidad</span>
        <span class="footer-dot"></span>
        <span>Términos de uso</span>
        <span class="footer-dot"></span>
        <span>Cookies</span>
      </div>

      <!-- Copyright -->
      <p class="footer-copy">&copy; 2026 LudoScript · Todos los derechos reservados</p>

    </div>
  </footer>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
const { isDark } = useTheme()
</script>

<style scoped>
.app-footer {
  width: 100%;
  background: #ffffff;
  border-top: 1px solid #f3f4f6;
  transition: background 0.3s, border-color 0.3s;
}
.app-footer.dark {
  background: #1a1d27;
  border-top-color: #2d3748;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.25rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-brand { display: flex; align-items: baseline; gap: 0.5rem; }
.brand-name {
  font-size: 1rem;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: -0.01em;
  transition: color 0.3s;
}
.app-footer.dark .brand-name { color: #f1f5f9; }
.brand-tagline {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  transition: color 0.3s;
}
.app-footer.dark .footer-links { color: #6b7280; }
.footer-links span:not(.footer-dot) {
  cursor: pointer;
  transition: color 0.2s;
}
.footer-links span:not(.footer-dot):hover { color: #1484a1; }
.footer-dot {
  width: 3px;
  height: 3px;
  background: #d1d5db;
  border-radius: 50%;
}

.footer-copy {
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 0;
}
</style>
