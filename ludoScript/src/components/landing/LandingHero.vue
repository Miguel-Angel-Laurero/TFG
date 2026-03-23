<template>
    <div class="flex flex-col md:flex-row items-center justify-center w-full mx-auto">  
      
      <!-- Imagen -->
      <div class="flex-4 flex items-center justify-center">
        <img 
          class="rounded-xl w-full object-contain mask-l-from-95% mask-l-to-100% mask-r-from-50% mask-r-to-100% mask-y-from-95% mask-y-to-100%"
          src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/landing/knowledge.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbGFuZGluZy9rbm93bGVkZ2UucG5nIiwiaWF0IjoxNzc0MjUwNjk3LCJleHAiOjE4MDU3ODY2OTd9.6MLaoBbQkiLL4E-FxpUHawGcLAli5zJsGivNAmpMTgg"
          alt="Maravillas del conocimiento"
        >
      </div>

      <!-- Texto y botones -->
      <div class="flex-1 flex flex-col gap-3 text-white items-center text-center">
        <h1 class="text-4xl sm:text-6xl lg:text-8xl font-bold font-righteous" >Ludo<span class="text-yellow-400 text-9xl">S</span>cript</h1>
        <span class="text-base sm:text-xl">Descubre una nueva forma de aprender</span>
        <p class="text-lg">¿Aún no tienes una cuenta?</p>
        <RouterLink
          to="/register-view"
          class="bg-yellow-400 text-black px-8 py-3 rounded-br-xl rounded-tl-xl border-b-3 border-l-3 border-yellow-600 font-bold hover:bg-yellow-300 transition-colors text-center"
        >
          Empieza ahora
        </RouterLink>
        <RouterLink
          to="/login-view/"
          class="bg-transparent text-white px-6 py-3 rounded-br-xl rounded-tl-xl border-2 border-yellow-400 font-bold hover:bg-white hover:text-black transition-colors text-center"
        >
          Ya tengo cuenta
        </RouterLink>
      </div>
    </div>
</template>
