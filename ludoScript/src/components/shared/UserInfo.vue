<template>
    <h2 class="text-2xl text-gray-50 font-bold mb-4">Tu Progreso</h2>
    <div class="grid grid-cols-4 gap-4">
        <div class="text-center p-2 bg-blue-50 rounded-lg">
            <p class="text-3xl font-bold text-blue-600"> {{userData[0].streak}}</p>
            <p class="text-gray-600 text-sm font-medium">Días de racha</p>
        </div>
        <div class="text-center p-2 bg-green-50 rounded-lg">
            <p class="text-3xl font-bold text-green-600">{{userData[0].tests}}</p>
            <p class="text-gray-600 text-sm font-medium">Tests completados</p>
        </div>
        <div class="text-center p-2 bg-purple-50 rounded-lg">
            <p class="text-3xl font-bold text-purple-600">{{userData[0].coins}}</p>
            <p class="text-gray-600 text-sm font-medium">GB RAM</p>
        </div>
        <div class="text-center p-2 bg-orange-50 rounded-lg">
            <p class="text-3xl font-bold text-orange-600">{{userData[0].accuracy}}%</p>
            <p class="text-gray-600 text-sm font-medium">Precisión</p>
        </div>
    </div>
    
    <!-- Estadísticas adicionales -->
    <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <span class="text-2xl"></span>
            <div>
                <p class="text-lg font-bold">12 / 20</p>
                <p class="text-sm text-gray-600">Lecciones completadas</p>
            </div>
        </div>
        <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <span class="text-2xl"></span>
            <div>
                <p class="text-lg font-bold">{{userData[0].timeSpent}}hrs</p>
                <p class="text-sm text-gray-600">Tiempo de práctica</p>
            </div>
        </div>
    </div>
</template>
<script setup>
    const userData=[
        {id:"1", tests:12, timeSpent:8, coins: 1250, accuracy: 89, streak: 5},
    ]
</script>