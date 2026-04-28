<template>
    <section class= "bg-white[0.03] border border-white-[0.08] rounded-2xl p-6 w-full h-full flex flex-col">
        <!-- Info del usuario debajo -->
        <div class="flex-1 min-h-0 overflow-y-auto pb-6">
            <UserInfo />
        </div>
        <!-- Chart arriba -->
        <div class="flex-shrink-0 flex flex-col ">
            <h3 class="text-lg text-gray-50 font-semibold mb-3">Actividad semanal</h3>
            <div class="flex-1 min-h-0">
                <Chart />
            </div>
        </div>
    </section>
</template>
<script setup>
import UserInfo from '../shared/UserInfo.vue';
import Chart from './Chart.vue';
</script>