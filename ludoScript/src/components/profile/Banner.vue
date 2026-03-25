<template>
    <div 
        class="relative p-2 rounded-2xl mb-2"
        :style="{ backgroundImage: `url('${bannerURL}')`,backgroundSize: 'cover', backgroundPosition: 'center',height: '100px'}"
        >
        <div class="flex justify-end">
            <i class=" pi pi-pen-to-square flex absolute rounded-full p-2 cursor-pointer z-10
               text-gray-900 bg-gray-50
               opacity-50 hover:opacity-100
               transition-opacity duration-200"
               @click="visible=true">
            </i>
            <!-- :style="{ backgroundImage: `url('${userStore.bannerUrl}')` ... }" cuando venga de la bbdd -->
        </div>
        <Dialog v-model:visible="visible" modal header="Editar Perfil" class="!bg-gray-900 !text-white !font-bold">
            <EditProfile @close="visible = false" />
        </Dialog>
        <Avatar
            :image= "iconURL"
            class="ml-2 mt-2"
            size="xlarge"
            shape="circle"
            :pt="{ image: { style: 'width: 100%; height: 100%; object-fit: fill;' } }"
        />
          <p class="absolute inset-0 flex items-center justify-center font-bold text-gray-50 text-2xl">
            {{auth.user.username}}
        </p>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { Avatar } from 'primevue';
import Dialog from 'primevue/dialog';
import { useAuthStore } from '@/stores/auth.store';
import EditProfile from './EditProfile.vue';

const auth = useAuthStore();
const visible = ref(false);
    
const iconURL = 'https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_portatil.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9wb3J0YXRpbC5wbmciLCJpYXQiOjE3NzM4MzAwOTQsImV4cCI6MTgwNTM2NjA5NH0.hrXnk8XtCUhl-udVXZgwqx6Du13c-M7CykqHHhhV2Qg'
const bannerURL = 'https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/banners/banner_rainbow.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvYmFubmVycy9iYW5uZXJfcmFpbmJvdy5wbmciLCJpYXQiOjE3NzM4Mjg4NTYsImV4cCI6MTgwNTM2NDg1Nn0.emQWCZJn2ml5Pt7PPh8iol3xkPUy9atDEoGAFa7YIwg'
</script>