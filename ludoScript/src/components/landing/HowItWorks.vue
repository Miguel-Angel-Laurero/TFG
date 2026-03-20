<template>
    <section class="py-20 px-6">
  <div class="max-w-5xl mx-auto">

    <!-- Título -->
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-5xl font-bold font-righteous text-white">
        ¿Cómo funciona?
      </h2>
      <p class="text-white/60 mt-3 text-lg">
        Aprende programación a tu ritmo, con tu propio material
      </p>
    </div>

    <!-- Pasos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

      <!-- Paso 1 -->
      <div class="flex flex-col items-center text-center gap-4 bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-yellow-400/50 transition-colors">
        <div class="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-black text-2xl font-bold font-righteous">
          1
        </div>
        <h3 class="text-white font-bold text-xl">Sube tu temario</h3>
        <p class="text-white/60 text-sm leading-relaxed">
          Importa tus propios apuntes, PDFs o documentos. LudoScript los convierte en tu base de aprendizaje personalizada.
        </p>
      </div>

      <!-- Paso 2 -->
      <div class="flex flex-col items-center text-center gap-4 bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-yellow-400/50 transition-colors">
        <div class="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-black text-2xl font-bold font-righteous">
          2
        </div>
        <h3 class="text-white font-bold text-xl">Aprende con cursos</h3>
        <p class="text-white/60 text-sm leading-relaxed">
          Accede a cursos de programación estructurados y aprende con lecciones cortas y prácticas adaptadas a tu nivel.
        </p>
      </div>

      <!-- Paso 3 -->
      <div class="flex flex-col items-center text-center gap-4 bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-yellow-400/50 transition-colors">
        <div class="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-black text-2xl font-bold font-righteous">
          3
        </div>
        <h3 class="text-white font-bold text-xl">Gana puntos y logros</h3>
        <p class="text-white/60 text-sm leading-relaxed">
          Completa retos, sube de nivel y desbloquea logros mientras progresas. Aprender programación nunca fue tan adictivo.
        </p>
      </div>

    </div>

    <!-- CTA final -->
    <div class="flex justify-center mt-14">
      <RouterLink
        to="/register-view"
        class="bg-yellow-400 text-black px-8 py-4 rounded-br-xl rounded-tl-xl border-b-4 border-l-4 border-yellow-600 font-bold text-lg hover:bg-yellow-300 transition-colors"
      >
        Empieza gratis ahora
      </RouterLink>
    </div>

  </div>
</section>
</template>