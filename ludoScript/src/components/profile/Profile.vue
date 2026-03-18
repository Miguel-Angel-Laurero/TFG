<template>
    <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Columna izquierda: Avatar -->
            <div class="lg:col-span-7">
                <Banner/>
                <AvatarProfile/>
            </div>
            
            <!-- Columna derecha: Estadísticas -->
            <div class="lg:col-span-5">
                <UserStats/>
            </div>
        </div>
    </div>
</template>
<script setup>
    import AvatarProfile from './AvatarProfile.vue';
    import Banner from './Banner.vue';
    import UserStats from './UserStats.vue';
</script>
