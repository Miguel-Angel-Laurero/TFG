<template>
    <section class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 w-full h-full flex flex-col">
        <!-- Chart arriba -->
        <div class="flex-shrink-0 flex flex-col mb-6 pb-6 border-b" style="height: 220px;">
            <h3 class="text-lg text-gray-50 font-semibold mb-3">Actividad semanal</h3>
            <div class="flex-1 min-h-0">
                <Chart/>
            </div>
        </div>

        <!-- Info del usuario debajo -->
        <div class="flex-1 min-h-0 overflow-y-auto">
            <UserInfo/>
        </div>
    </section>
</template>
<script setup>
    import UserInfo from '../shared/UserInfo.vue';
    import Chart from './Chart.vue';
</script>