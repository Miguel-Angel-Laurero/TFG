<template>
    <section class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 w-full h-full flex flex-col">
        <!-- Info del usuario -->
        <div class="mb-6 pb-6 border-b flex-shrink-0">
            <UserInfo/>
        </div>
        
        <!-- Chart debajo -->
        <div class="flex-1 flex flex-col min-h-0">
            <h3 class="text-lg text-gray-50 font-semibold mb-3">Actividad semanal</h3>
            <div class="flex-1">
                <Chart/>
            </div>
        </div>
    </section>
</template>
<script setup>
    import UserInfo from '../shared/UserInfo.vue';
    import Chart from './Chart.vue';
</script>