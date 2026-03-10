<template>
    <section>
        <Header></Header>
    </section>
    <section class="flex gap-4">
        <Profile/>
    </section>
    <section>
        <Footer></Footer>
    </section>

</template>
<script setup>
import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import Profile from '@/components/Profile.vue';
</script>
