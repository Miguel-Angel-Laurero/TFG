<template>
    <div class="flex items-center gap-2 sm:gap-4">
        <template v-if="auth.ready && !auth.isLoggedIn">
            <RouterLink to="/login-view"
                class="text-xs sm:text-base border-2 border-yellow-400 text-yellow-400 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-bold hover:bg-yellow-400 hover:text-black transition-colors whitespace-nowrap">
                Iniciar sesión
            </RouterLink>
        </template>

        <template v-else-if="auth.ready && auth.isLoggedIn">
            <Menu ref="menu" :model="items" :popup="true" />
            
            <RouterLink v-if="!isInShop" to="/shop-view/"
                class="flex items-center gap-2 bg-white/5 border border-yellow-400/30 text-yellow-400 font-righteous px-3 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-yellow-400/10 transition-colors">
                
                <span class="text-lg sm:text-xl hidden xs:block">🛒 Tienda</span>
                <span class="text-xl xs:hidden">🛒</span>

                <span class="bg-yellow-400 text-black font-extrabold text-[10px] sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 sm:gap-2">
                    <span>{{ auth.userData?.coins ?? 0 }}</span>
                    <img :src="IMAGES.coin"
                        alt="coin" class="w-4 h-4 sm:w-6 sm:h-6 object-contain">
                </span>
            </RouterLink>

            <button
                type="button"
                class="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                @click="toggle"
            >
                <img
                    v-if="auth.user?.avatar"
                    :src="auth.user.avatar"
                    alt="Avatar"
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-blue-400"
                >
                <div
                    v-else
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-400 text-slate-200"
                >
                    <span class="text-xs sm:text-sm">👤</span>
                </div>
            </button>
        </template>
    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import Menu from 'primevue/menu';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

import { IMAGES } from '@/utils/imgBucketStorage';

const auth = useAuthStore();
const router = useRouter();
const menu = ref(null);

const route = useRoute()
const isInShop = computed(() => route.path.startsWith('/shop-view'))

// Función para abrir/cerrar el menú
const toggle = (event) => {
    menu.value.toggle(event);
};

// Opciones del menú
const items = ref([
    {
        label: 'Opciones',
        items: [
            {
                label: 'Inicio',
                icon: 'pi pi-home',
                command: () => router.push('/')
            },
            {
                label: 'Progreso',
                icon: 'pi pi-chart-line',
                command: () => router.push('/profile-view/')
            },
            {
                label: 'Editar Perfil',
                icon: 'pi pi-pen-to-square',
                command: () => router.push('/edit-profile-view/')
            },
            {
                label: 'Tienda',
                icon: 'pi pi-shop',
                command: () => router.push('/shop-view/')
            },
            // {
            //     label: 'Multijugador',
            //     icon: 'pi pi-users',
            //     command: () => router.push('/multiplayer/')
            // },
            {
                label: 'Cerrar sesión',
                icon: 'pi pi-sign-out',
                command: () => {
                    auth.logout();
                    router.push('/login-view');
                }
            }
        ]
    }
]);
</script>
