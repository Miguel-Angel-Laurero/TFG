<template>
    <div class="relative p-2 rounded-2xl mb-2 overflow-hidden" :style="bannerStyle">
        <div class="relative overflow-hidden rounded-lg mb-5" :style="profileBannerStyle">

            <RouterLink
                to="/edit-profile-view"
                class="absolute top-2 right-2 border rounded-full w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors z-10"
            >
                <i class="pi pi-pen-to-square text-white text-sm"></i>
            </RouterLink>

            <div class="relative flex flex-col items-center justify-center mx-auto gap-4 bg-gray-100/20 rounded-2xl p-6">
                
                <img
                    v-if="auth.user?.avatar"
                    :src="auth.user.avatar"
                    alt="Avatar"
                    class="w-32 h-32 rounded-full object-cover ring-2 ring-blue-400"
                />
                <div
                    v-else
                    class="w-32 h-32 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-400"
                >
                    <span class="text-4xl text-gray-300">?</span>
                </div>

                <div class="min-w-0 flex flex-col items-center text-center">
                    <p class="text-gray-900 font-bold text-2xl leading-tight truncate">
                        {{ auth.user?.username }}
                    </p>
                    <p class="text-gray-900 text-md opacity-80 truncate">
                        {{ auth.user?.email }}
                    </p>
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
    height: '300px',
}))
</script>