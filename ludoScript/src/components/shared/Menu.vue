<template> 
    <div class="flex items-center gap-3">
        <template v-if="!auth.isLoggedIn">
            <RouterLink to="/login-view" class="header-btn">
                Iniciar sesión
            </RouterLink>
        </template>

        <template v-else>
            <Menu ref="menu" :model="items" :popup="true" />

            <!-- Subir temario -->
            <button class="header-btn" @click="showUpload = true">
                <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                </svg>
                Subir temario
            </button>

            <!-- Tienda -->
            <RouterLink v-if="!isInShop" to="/shop-view/" class="header-btn shop-link">
                🛒 Tienda
                <span class="coins-badge">
                    <span>{{ auth.userData?.coins ?? 0 }}</span>
                    <img 
                        src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/memoryCoin.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbWVtb3J5Q29pbi5wbmciLCJpYXQiOjE3NzQzNjI5NjAsImV4cCI6MTgwNTg5ODk2MH0.2UYhJNH_6lZtHJoGTDAUlr-5cZAJIZZG9qAzFDFrUK8"
                        alt="Moneda de RAM"
                        class="w-5 h-5 object-contain" 
                    >
                </span>
            </RouterLink>

            <Avatar 
                image="https://www.gravatar.com/avatar/00000000000000000000000000000001?d=mp&f=y" 
                class="ml-1 cursor-pointer hover:opacity-80 transition-opacity" 
                size="medium" 
                shape="circle" 
                @click="toggle"
            />

            <!-- Dialog de subida -->
            <Dialog
                v-model:visible="showUpload"
                :modal="true"
                header="Subir temario"
                :style="{ width: '480px' }"
                :draggable="false"
            >
                <Loader />
            </Dialog>
        </template>
    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';
import Dialog from 'primevue/dialog';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import Loader from '@/components/home/Loader.vue';

const auth = useAuthStore();
const router = useRouter();
const menu = ref(null);
const showUpload = ref(false);

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

<style scoped>
.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.25rem;
  border-radius: 0.65rem;
  font-weight: 700;
  font-size: 0.88rem;
  font-family: 'Righteous', cursive;
  border: 2px solid #facc15;
  background: #facc15;
  color: #1a1a2e;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
}
.header-btn:hover {
  background: #1484a1;
  border-color: #1484a1;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(20,132,161,0.22);
}
.btn-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
.shop-link { gap: 0.6rem; }
.coins-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(0,0,0,0.12);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.8rem;
}
</style>