<template> 
    <div class="flex items-center">
        <template v-if="auth.isLogged">
            <RouterLink to="/login-view" class="rounded-xl bg-indigo-700 text-gray-50 font-bold px-6 py-2 rounded-xl">
                Iniciar sesión
            </RouterLink>
        </template>

        <template v-else>
            <Menu ref="menu" :model="items" :popup="true" />
            
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
                label: 'Mi Perfil',
                icon: 'pi pi-user',
                command: () => router.push('/profile-view/')
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