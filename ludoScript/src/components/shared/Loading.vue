<template>
  <div class="loading-overlay">
    <div class="character-container">
      <div class="loader-sprite" :style="{ backgroundImage: `url(${IMAGES.sprite})` }"></div>
    </div>
    <p class="loading-text">Cargando<span>...</span></p>
  </div>
</template>
<script setup>
  import { IMAGES } from '@/utils/imgBucketStorage';
</script>

<style scoped>
/* Variables para controlar el tamaño del personaje fácilmente */
.loading-overlay {
  --char-width: 200px;
  --char-height: 330px;
  --sprite-total-width: 1000px;

  position: fixed; /* Mejor fixed que absolute para overlays de carga */
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(26, 26, 26, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

/* Ajuste para móviles: Escalamos el personaje al 60% de su tamaño */
@media (max-width: 640px) {
  .loading-overlay {
    --char-width: 120px;
    --char-height: 198px;
    --sprite-total-width: 600px;
  }
}

.character-container {
  width: var(--char-width);
  height: var(--char-height);
  overflow: hidden;
  position: relative;
  animation: float 2s ease-in-out infinite;
}

.loader-sprite {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: var(--sprite-total-width) var(--char-height);
  image-rendering: pixelated;
  
  /* Animación usando las variables */
  animation: run-anim 0.8s steps(5) infinite;
}

@keyframes run-anim {
  from { background-position: -10px 0px; }
  to { background-position: calc(var(--sprite-total-width) * -1) 0px; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.loading-text {
  color: white;
  margin-top: 20px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 16px; /* Un poco más pequeño para móviles */
  text-align: center;
}

@media (min-width: 640px) {
  .loading-text {
    font-size: 18px;
    font-family: 'Righteous', Georgia, serif;
    letter-spacing: 4px;
    margin-top: 30px;
  }
}

.loading-text span {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>