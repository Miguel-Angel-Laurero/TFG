<template>
    <div class="relative p-2 rounded-2xl mb-2 overflow-hidden" :style="bannerStyle">
       <div class="relative overflow-hidden rounded-lg mb-5" :style="profileBannerStyle">

            <!-- Botón editar: esquina superior derecha del banner -->
            <RouterLink
                to="/edit-profile-view"
                class="absolute top-2 right-2 border rounded-full w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors z-10"
            >
                <i class="pi pi-pen-to-square text-white text-sm"></i>
            </RouterLink>

            <div class="relative flex items-center gap-4 bg-gray-100/20 rounded-2xl p-4">
                <img
                    v-if="auth.user?.avatar"
                    :src="auth.user.avatar"
                    alt="Avatar"
                    class="w-14 h-14 rounded-full object-cover ring-2 ring-blue-400"
                />
                <div
                    v-else
                    class="w-14 h-14 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-400"
                >
                    <span class="text-2xl text-gray-300">?</span>
                </div>
                <div class="min-w-0">
                    <p class="text-gray-900 font-semibold text-lg leading-tight truncate">{{ auth.user?.username }}</p>
                    <p class="text-gray-900 text-sm truncate">{{ auth.user?.email }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();

const bannerStyle = computed(() => ({
    backgroundImage: auth.user?.banner ? `url('${auth.user.banner}')` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#1e293b',
    height: '100px',
}))
</script>