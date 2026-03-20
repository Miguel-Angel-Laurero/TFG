<template>
  <main class="home-container ">
    <div class="flex items-center justify-center h-screen px-8">
      <LandingHero/>
    </div>
    <div>
      <HowItWorks/>
    </div>
    <div>
      <WhatYouLearn/>
    </div>
    <div>
      <CtaFinal/>
    </div>
  </main>
</template>
<script setup>
  import CtaFinal from './CtaFinal.vue';
  import HowItWorks from './HowItWorks.vue';
  import LandingHero from './LandingHero.vue';
  import WhatYouLearn from './WhatYouLearn.vue';
</script>