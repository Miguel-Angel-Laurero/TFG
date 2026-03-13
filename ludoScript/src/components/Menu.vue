<template> 
    <RouterLink to="/" class="border-b border-gray-100 bg-indigo-700 px-6 py-2 mx-2 rounded-xl">Inicio</RouterLink>
    <RouterLink to="/login-view" v-if="!is_logged" class="border-b border-gray-100 bg-indigo-700 px-6 py-2 mx-2 rounded-xl">Iniciar sesión</RouterLink>
    <RouterLink to="/profile-view/" class="border-b border-gray-100 bg-indigo-700 px-6 py-2 rounded-xl">Perfil</RouterLink>
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