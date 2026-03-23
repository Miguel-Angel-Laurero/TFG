<template> 
    <div class="flex items-center">
        <template v-if="auth.isLogged">
            <RouterLink to="/login-view" class="border-2 border-yellow-400 text-yellow-400 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 hover:text-black transition-colors">
                Iniciar sesión
            </RouterLink>
        </template>

        <template v-else>
            <Menu ref="menu" :model="items" :popup="true" />
                <RouterLink to="/shop-view/" class="flex items-center gap-3 bg-white/6 border border-yellow-400/30 
                        text-yellow-400 font-righteous text-xl px-6 py-3 rounded-xl 
                        hover:bg-yellow-400/10 transition-colors w-full justify-center">
                🛒 Tienda
                <span class="bg-yellow-400 text-black font-extrabold text-sm px-3 py-1 rounded-full">
                    2500 GB de RAM
                </span>
                </RouterLink>
                
            <Avatar 
                image="https://www.gravatar.com/avatar/00000000000000000000000000000001?d=mp&f=y" 
                class="ml-2 cursor-pointer hover:opacity-80 transition-opacity" 
                size="medium" 
                shape="circle" 
                @click="toggle"
            />
        </template>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const menu = ref(null);

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
                label: 'Mi Perfil',
                icon: 'pi pi-user',
                command: () => router.push('/profile-view/')
            },
            {
                label: 'Tienda',
                icon: 'pi pi-shop',
                command: () => router.push('/shop-view/')
            },
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