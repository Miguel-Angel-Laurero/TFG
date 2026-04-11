<template>
    <div class="flex items-center">
        <template v-if="auth.ready && !auth.isLoggedIn">
            <RouterLink to="/login-view"
                class="border-2 border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 hover:text-black transition-colors">
                Iniciar sesión
            </RouterLink>
        </template>

        <template v-else-if="auth.ready && auth.isLoggedIn" class="mx-2">
            <Menu ref="menu" :model="items" :popup="true" />
            <RouterLink v-if="!isInShop" to="/shop-view/"
                class="flex items-center gap-3 bg-white/5 border border-yellow-400/30 text-yellow-400 font-righteous text-xl px-6 py-3 rounded-xl hover:bg-yellow-400/10 transition-colors w-full justify-center">
                🛒 Tienda

                <span
                    class="bg-yellow-400 text-black font-extrabold text-sm px-3 py-1 rounded-full flex items-center gap-2 ml-2">
                    <span>{{ auth.userData?.coins ?? 0 }}</span>
                    <img src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/memoryCoin.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbWVtb3J5Q29pbi5wbmciLCJpYXQiOjE3NzQzNjI5NjAsImV4cCI6MTgwNTg5ODk2MH0.2UYhJNH_6lZtHJoGTDAUlr-5cZAJIZZG9qAzFDFrUK8"
                        alt="Moneda de RAM" class="w-6 h-6 object-contain">
                </span>
            </RouterLink>
            <button
                type="button"
                class="cursor-pointer hover:opacity-80 transition-opacity ml-3"
                @click="toggle"
            >
                <img
                    v-if="auth.user?.avatar"
                    :src="auth.user.avatar"
                    alt="Avatar del usuario"
                    class="w-10 h-10 rounded-full object-cover ring-2 ring-blue-400"
                >
                <div
                    v-else
                    class="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-400 text-slate-200"
                >
                    <span class="text-sm">👤</span>
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
