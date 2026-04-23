<template>
    <div class="min-h-screen flex flex-col bg-gray-900">
        <header>
            <Header />
        </header>
        <main class="flex-1 min-h-0 overflow-y-auto">
            <LearningArea />
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
</template>

<script setup>
import Header from '@/components/shared/Header.vue'
import Footer from '@/components/shared/Footer.vue'
import LearningArea from '@/components/learning/LearningArea.vue'
</script>
