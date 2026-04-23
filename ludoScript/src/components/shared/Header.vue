<template>
    <nav class="w-full bg-blue-900 top-0 py-2 px-2 sm:px-6 flex items-center justify-between font-righteous shadow-lg">
        
        <!-- Izquierda: logo -->
        <div class="flex items-center min-w-0 flex-1">
            <Avatar
                :image="IMAGES.logo"
                class="flex-shrink-0 mr-2 sm:mx-4" 
                size="medium" 
                shape="circle" 
            />
            <div class="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-gray-50 truncate">
                <h1 class="flex items-center gap-1 sm:gap-2">
                    <span>LudoScript</span>
                </h1>
            </div>
        </div>

        <!-- Centro: links (absolute para centrarlo de verdad) -->
        <div v-if="auth.isLoggedIn" class="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-4 lg:gap-6 text-md lg:text-xl font-bold">
            <RouterLink to="/" class="text-white/50 hover:text-yellow-400 transition-colors">
                Home
            </RouterLink>
            <RouterLink to="/clase" class="text-white/50 hover:text-yellow-400 transition-colors">
                Clase
            </RouterLink>
            <RouterLink v-if="auth.user.role === 'admin'" to="/admin" class="text-white/50 hover:text-yellow-400 transition-colors">
                Panel de Administracion
            </RouterLink>
        </div>

        <!-- Derecha: menú -->
        <div class="flex-shrink-0 pl-2">
            <Menu />
        </div>
    </nav>
</template>

<script setup>
import Menu from './Menu.vue';
import Avatar from 'primevue/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { IMAGES } from '@/utils/imgBucketStorage';

const auth = useAuthStore();
</script>