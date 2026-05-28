<template>
  <main class="home-container bg-blue-950 overflow-x-hidden">
    <section class="flex items-center justify-center min-h-[90svh] md:h-screen px-4 md:px-8">
      <LandingHero />
    </section>

    <section class="py-12 md:py-20">
      <HowItWorks />
    </section>

    <section class="py-12 md:py-20 bg-black/10">
      <WhatYouLearn />
    </section>

    <section class="py-12 md:py-20">
      <CtaFinal />
    </section>

    <div class="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 hidden sm:flex">
      <CanScrollDown />
    </div>
  </main>
</template>

<script setup>
  import CtaFinal from './CtaFinal.vue';
  import HowItWorks from './HowItWorks.vue';
  import LandingHero from './LandingHero.vue';
  import WhatYouLearn from './WhatYouLearn.vue';
  import CanScrollDown from '../shared/CanScrollDown.vue';
</script>