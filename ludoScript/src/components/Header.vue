<template>
    <div class="w-full bg-indigo-900 text-gray-50 top-0 h-20 flex items-center justify-between">
        <p class="p-2 font-bold">LudoScript</p>
        <div class="pr-4" >
            <RouterLink to="/" class="border-b border-gray-100 bg-indigo-700 px-6 py-2 mx-2 rounded-xl">Inicio</RouterLink>
            <RouterLink to="/login-view" v-if="!is_logged" class="border-b border-gray-100 bg-indigo-700 px-6 py-2 mx-2 rounded-xl">Iniciar sesión</RouterLink>
            <RouterLink to="/profile-view/" class="border-b border-gray-100 bg-indigo-700 px-6 py-2 rounded-xl">Perfil</RouterLink>
        </div>
    </div>
</template>
<script setup>
    import { defineProps } from 'vue';
    const props = defineProps({
        titulo: {
            type: String,
            default: 'Título'
        }
    })

    const is_logged = false;
</script>