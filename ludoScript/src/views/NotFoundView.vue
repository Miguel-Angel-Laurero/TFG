<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
    <i class="pi pi-exclamation-triangle text-6xl text-amber-500 mb-4"></i>
    <h1 class="text-4xl font-bold mb-2">404 - ¡Página no encontrada!</h1>
    <p class="text-gray-600 mb-6">Parece que este objeto no está en nuestro inventario.</p>
    
    <RouterLink 
      to="/" 
      class="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors"
    >
      Volver al Inicio
    </RouterLink>
  </div>
</template>