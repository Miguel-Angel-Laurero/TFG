<template>
  <section class="py-20 px-6">
    <div class="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">

      <!-- Icono decorativo -->
      <div class="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-4xl">
        ✨
      </div>

      <!-- Texto -->
      <h2 class="text-3xl sm:text-5xl font-bold font-righteous text-white">
        ¿Listo para empezar?
      </h2>
      <p class="text-white/60 text-lg max-w-xl">
        Únete a LudoScript, sube tu temario y empieza a aprender programación de una forma que engancha.
      </p>

      <!-- Botones -->
      <div class="flex flex-col sm:flex-row gap-4 mt-2">
        <RouterLink
          to="/register-view"
          class="bg-yellow-400 text-black px-8 py-4 rounded-br-xl rounded-tl-xl border-b-4 border-l-4 border-yellow-600 font-bold text-lg hover:bg-yellow-300 transition-colors"
        >
          Crear cuenta gratis
        </RouterLink>
        <RouterLink
          to="/login-view"
          class="bg-transparent text-white px-8 py-4 rounded-br-xl rounded-tl-xl border-2 border-white/20 font-bold text-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors"
        >
          Ya tengo cuenta
        </RouterLink>
      </div>

      <!-- Nota de confianza -->
      <p class="text-white/30 text-sm">
        Sin tarjeta de crédito · Gratis para empezar
      </p>

    </div>
  </section>
</template>
