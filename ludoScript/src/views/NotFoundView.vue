<template>
  <div class="flex flex-col md:flex-row items-center justify-center min-h-screen p-6 gap-6">
    <img 
      class="w-64 md:w-96 object-contain" 
      src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/404.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvNDA0LnBuZyIsImlhdCI6MTc3Mzk5NzMyMiwiZXhwIjoxODA1NTMzMzIyfQ.mPKi5MCcx8GoSfRv3i0wz1zsXr81nuriYiSKvM2Q6Wk" 
      alt="cafe derramado"
    >
    <div class="flex flex-col items-center text-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-2 text-gray-50">404 - ¡Página no encontrada!</h1>
      <p class="text-gray-600 mb-6">Tu robot favorito ha tenido un mal día…</p>
      <RouterLink 
        to="/" 
        class="bg-yellow-400 text-black px-8 py-3 rounded-br-xl rounded-tl-xl border-b-3 border-l-3 border-yellow-600 font-bold hover:bg-yellow-300 transition-colors text-center"
      >
        Volver al Inicio
      </RouterLink>
    </div>  
  </div>
</template>