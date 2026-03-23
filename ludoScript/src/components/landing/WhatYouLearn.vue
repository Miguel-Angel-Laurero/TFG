<template>
  <section class="py-20 px-6">
    <div class="max-w-5xl mx-auto flex flex-col gap-24">

      <!-- Título -->
      <div class="text-center">
        <h2 class="text-3xl sm:text-5xl font-bold font-righteous text-white">
          Tu temario, convertido en experiencia
        </h2>
        <p class="text-white/60 mt-3 text-lg">
          Sube tus archivos y LudoScript hace el resto
        </p>
      </div>

      <!-- Flashcards — imagen izquierda -->
      <div class="flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1">
          <img
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/landing/flashcards.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbGFuZGluZy9mbGFzaGNhcmRzLnBuZyIsImlhdCI6MTc3NDI1MzMyMCwiZXhwIjoxODA1Nzg5MzIwfQ.wk8LCd2LUaASFzUkIblb6PS2JBqX0HYbmEjFWG2tcyo"
            alt="Flashcards automáticas"
            class="w-full rounded-2xl object-contain mask-r-from-60% mask-r-to-100% mask-l-from-95% mask-l-to-100% mask-y-from-95% mask-y-to-100%"
          >
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-2xl">
            🃏
          </div>
          <h3 class="text-white font-bold font-righteous text-3xl">Flashcards automáticas</h3>
          <p class="text-white/50 text-lg leading-relaxed">
            LudoScript extrae los conceptos clave de tus apuntes y genera tarjetas de repaso listas para usar. Sin esfuerzo extra.
          </p>
        </div>
      </div>

      <!-- Tests — imagen derecha -->
      <div class="flex flex-col md:flex-row-reverse items-center gap-12">
        <div class="flex-1">
          <img
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/landing/test.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbGFuZGluZy90ZXN0LnBuZyIsImlhdCI6MTc3NDI1MTExMiwiZXhwIjoxODA1Nzg3MTEyfQ.2Z5U1_NbIld-mTD0j7HOsZPHvnUssshTlu4j7gHs9qA"
            alt="Tests tipo examen"
            class="w-full rounded-2xl object-contain mask-l-from-60% mask-l-to-100% mask-r-from-95% mask-r-to-100% mask-y-from-95% mask-y-to-100%"
          >
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-2xl">
            📝
          </div>
          <h3 class="text-white font-bold font-righteous text-3xl">Tests tipo examen</h3>
          <p class="text-white/50 text-lg leading-relaxed">
            Genera preguntas de opción múltiple basadas en tu propio material para ponerte a prueba antes del examen.
          </p>
        </div>
      </div>

      <!-- Progreso — imagen izquierda -->
      <div class="flex flex-col md:flex-row items-center gap-12">
        <div class="flex-1">
          <img
            src=""
            alt="Seguimiento de progreso"
            class="w-full rounded-2xl object-contain mask-r-from-60% mask-r-to-100% mask-l-from-95% mask-l-to-100% mask-y-from-95% mask-y-to-100%"
          >
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-2xl">
            📈
          </div>
          <h3 class="text-white font-bold font-righteous text-3xl">Seguimiento de progreso</h3>
          <p class="text-white/50 text-lg leading-relaxed">
            Visualiza cuánto has avanzado, qué temas dominas y en cuáles necesitas reforzar para llegar al examen preparado.
          </p>
        </div>
      </div>

      <!-- Retos — imagen derecha -->
      <div class="flex flex-col md:flex-row-reverse items-center gap-12">
        <div class="flex-1">
          <img
            src=""
            alt="Retos y ejercicios"
            class="w-full rounded-2xl object-contain mask-l-from-60% mask-l-to-100% mask-r-from-95% mask-r-to-100% mask-y-from-95% mask-y-to-100%"
          >
        </div>
        <div class="flex-1 flex flex-col gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-2xl">
            🏆
          </div>
          <h3 class="text-white font-bold font-righteous text-3xl">Retos y ejercicios</h3>
          <p class="text-white/50 text-lg leading-relaxed">
            Completa retos prácticos, gana puntos y desbloquea logros mientras refuerzas lo aprendido. Aprender nunca fue tan adictivo.
          </p>
        </div>
      </div>

    </div>
  </section>
</template>