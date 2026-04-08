<template>
    <div class="w-full h-full overflow-hidden p-4">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            <!-- Columna izquierda: Banner + Avatar -->
            <div class="lg:col-span-7 flex flex-col gap-2 min-h-0 overflow-hidden">
                <Banner class="flex-shrink-0" />
                <AvatarProfile class="flex-1 min-h-0" />
            </div>
            <!-- Columna derecha: Estadísticas + resumen semanal -->
            <div class="lg:col-span-5 flex flex-col gap-4 overflow-y-auto min-h-0 pr-1">
                <UserStats />
                <!-- Resumen semanal por categoría (últimas 7 sesiones) -->
                <WeeklyResume />
            </div>
        </div>
    </div>
</template>
<script setup>
import AvatarProfile from './AvatarProfile.vue';
import Banner from './Banner.vue';
import UserStats from './UserStats.vue';
import WeeklyResume from './WeeklyResume.vue';
</script>