<template>
  <div class="loading-overlay">
    <div class="character-container">
      <div class="loader-sprite"></div>
    </div>
    <p class="loading-text">Cargando<span>...</span></p>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(26, 26, 26, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.character-container {
  /* Ajustamos a la medida real de UN frame */
  width: 200px; 
  height: 330px; 
  overflow: hidden;
  position: relative;
  animation: float 2s ease-in-out infinite;
}

.loader-sprite {
  width: 100%;
  height: 100%;
  background-image: url('https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/loading_spriteSheet.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9hZGluZ19zcHJpdGVTaGVldC5wbmciLCJpYXQiOjE3NzU3MjYwNDIsImV4cCI6MTgwNzI2MjA0Mn0.v2vS0MIQUgt-d-0g36nlkxHThUK3gghDTWYgC07B-rU');
  background-repeat: no-repeat;
  
  /* 
     IMPORTANTE: Forzamos el tamaño real de la imagen. 
     Como el contenedor mide 200px, 1000px de fondo es perfecto.
  */
  background-size: 1000px 330px; 
  
  image-rendering: pixelated;
  
  /* 
     Usamos steps(5) y píxeles exactos. 
     El salto final debe ser el ancho total de la imagen.
  */
  animation: run-anim 0.8s steps(5) infinite;
}

@keyframes run-anim {
  from { background-position: -15px 0px; }
  to { background-position: -1000px 0px; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.loading-text {
  color: white;
  margin-top: 30px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-size: 18px;
}

.loading-text span {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>