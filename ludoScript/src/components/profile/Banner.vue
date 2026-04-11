<template>
    <div class="relative p-2 rounded-2xl mb-2 overflow-hidden" :style="bannerStyle">
        <div class="absolute inset-0 bg-slate-900/35"></div>

        <Avatar
            v-if="auth.user?.avatar"
            :image="auth.user.avatar"
            class="relative ml-2 mt-2"
            size="xlarge"
            shape="circle"
            :pt="{ image: { style: 'width: 100%; height: 100%; object-fit: cover;' } }"
        />

        <div
            v-else
            class="relative ml-2 mt-2 w-[72px] h-[72px] rounded-full bg-slate-700/90 border-2 border-white/60 flex items-center justify-center text-3xl text-slate-200"
        >
            ?
        </div>

        <p class="absolute inset-0 flex items-center justify-center font-bold text-gray-50 text-2xl">
            {{ auth.user.username }}
        </p>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { Avatar } from 'primevue';
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

