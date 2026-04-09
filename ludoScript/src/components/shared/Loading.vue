<template>
  <div class="loading-overlay">
    <!-- El Personaje -->
    <div class="loader-sprite"></div>
    
    <!-- Texto de carga -->
    <p class="loading-text">Cargando<span>...</span></p>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #1a1a1a; /* Color de fondo de tu app */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-sprite {
  width: 100px;  /* Ajusta al ancho de UN fotograma */
  height: 100px; /* Ajusta al alto de tu personaje */
  background-image: url('https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/loading_spriteSheet.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9hZGluZ19zcHJpdGVTaGVldC5wbmciLCJpYXQiOjE3NzU3MjA3NTEsImV4cCI6MTgwNzI1Njc1MX0.eiMql1EpPz4HBizEUJAYfAJiPHxRNPDQqAiFu4PwO1I');
  background-repeat: no-repeat;
  background-size: 300px 100px; /* Ancho total de los 3 frames x alto */
  
  /* Animación del personaje */
  /* 0.4s es una buena velocidad para alguien corriendo */
  animation: run-anim 0.4s steps(3) infinite;
}

@keyframes run-anim {
  from { background-position: 0px; }
  to { background-position: -300px; }
}

.loading-text {
  color: white;
  margin-top: 20px;
  font-family: sans-serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 14px;
}

/* Opcional: animación de pulso para el texto */
.loading-text span {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>