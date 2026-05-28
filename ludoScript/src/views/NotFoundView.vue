<template>
  <div class="flex flex-col md:flex-row items-center justify-center min-h-[90svh] p-6 gap-8 md:gap-12 overflow-hidden">
    <div class="relative group">
      <div class="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
      <img 
        class="relative w-48 sm:w-64 md:w-[28rem] lg:w-[32rem] object-contain animate-float" 
        src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/404.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvNDA0LnBuZyIsImlhdCI6MTc3Mzk5NzMyMiwiZXhwIjoxODA1NTMzMzIyfQ.mPKi5MCcx8GoSfRv3i0wz1zsXr81nuriYiSKvM2Q6Wk" 
        alt="cafe derramado"
      >
    </div>

    <div class="flex flex-col items-center md:items-start text-center md:text-left max-w-md">
      <h1 class="text-4xl md:text-6xl font-bold mb-4 text-gray-50 font-righteous leading-tight">
        404 <span class="block text-xl md:text-2xl text-yellow-400 opacity-90">¡Página no encontrada!</span>
      </h1>
      
      <p class="text-gray-400 text-base md:text-lg mb-8 leading-relaxed">
        Parece que alguien derramó café en los servidores. Tu robot favorito ha tenido un mal día…
      </p>

      <RouterLink 
        to="/" 
        class="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-black transition-all duration-200 bg-yellow-400 font-righteous rounded-br-2xl rounded-tl-2xl border-b-4 border-l-4 border-yellow-700 hover:bg-yellow-300 active:scale-95 active:border-b-2 active:border-l-2"
      >
        <i class="pi pi-home mr-2 group-hover:-translate-y-1 transition-transform" />
        Volver al Inicio
      </RouterLink>
    </div>  
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>