<template> 
    <div class="flex">
        <RouterLink to="/" class="border-b border-gray-100 bg-indigo-700 text-gray-50 font-bold px-6 py-2 mx-2 rounded-xl">Inicio</RouterLink>
        <!-- añadir exclamacion al principio del v-if cuando el login sea funcional con datos que comprobar -->
        <RouterLink v-if="auth.isLogged" to="/login-view"  class="border-b border-gray-100 bg-indigo-700 text-gray-50 font-bold px-6 py-2 mx-2 rounded-xl">Iniciar sesión</RouterLink>
        <template v-else>
            <RouterLink to="/login-view"  class="border-b border-gray-100 bg-indigo-700 text-gray-50 font-bold px-6 py-2 mx-2 rounded-xl" @click="cerrarSesion">Cerrar sesión</RouterLink>
            <RouterLink to="/profile-view/" class="border-b border-gray-100 bg-indigo-700 text-gray-50 font-bold px-6 py-2 rounded-xl">Perfil</RouterLink>
        </template>
    </div>
</template>
<script setup>
import { useAuthStore } from '@/stores/auth.store'
const auth = useAuthStore()

function cerrarSesion() {
  auth.logout()
}
</script>