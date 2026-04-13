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
    <div class="flex fixed bottom-10 left-1/2 z-20">
      <CanScrollDown/>
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