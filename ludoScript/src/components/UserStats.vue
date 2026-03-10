<template>
    <section class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 w-full h-full flex flex-col">
        <!-- Info del usuario -->
        <div class="mb-6 pb-6 border-b flex-shrink-0">
            <h2 class="text-2xl font-bold mb-4">Tu Progreso</h2>
            <div class="grid grid-cols-4 gap-4">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <p class="text-3xl font-bold text-blue-600"> 24</p>
                    <p class="text-gray-600 text-sm font-medium">Días de racha</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <p class="text-3xl font-bold text-green-600">45</p>
                    <p class="text-gray-600 text-sm font-medium">Tests completados</p>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <p class="text-3xl font-bold text-purple-600">1,250</p>
                    <p class="text-gray-600 text-sm font-medium">Puntos XP</p>
                </div>
                <div class="text-center p-4 bg-orange-50 rounded-lg">
                    <p class="text-3xl font-bold text-orange-600">89%</p>
                    <p class="text-gray-600 text-sm font-medium">Precisión</p>
                </div>
            </div>
            
            <!-- Estadísticas adicionales -->
            <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span class="text-2xl"></span>
                    <div>
                        <p class="text-lg font-bold">12 / 20</p>
                        <p class="text-sm text-gray-600">Lecciones completadas</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span class="text-2xl"></span>
                    <div>
                        <p class="text-lg font-bold">8.5 hrs</p>
                        <p class="text-sm text-gray-600">Tiempo de práctica</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Chart debajo -->
        <div class="flex-1 flex flex-col min-h-0">
            <h3 class="text-lg font-semibold mb-3">Actividad semanal</h3>
            <div class="flex-1">
                <Chart/>
            </div>
        </div>
    </section>
</template>
<script setup>
    import Chart from './Chart.vue';
</script>