<template>
  <div class="h-screen flex flex-col">
    <header>
      <Header />
    </header>
    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
        <EditProfileContent />
      </div>
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>
<script setup>
import Footer from '@/components/shared/Footer.vue';
import Header from '@/components/shared/Header.vue';
import EditProfileContent from '@/components/profile/EditProfileContent.vue';
</script>
