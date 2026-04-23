<template>
    <header class="bg-gray-800 p-4 shadow flex items-center justify-between">
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Panel de Administración
        </h1>
        <button @click="$router.push('/')" class="text-sm text-gray-400 hover:text-white transition">
            Volver a inicio
        </button>
    </header>
</template>
