<template>
    <div 
        class="relative p-2 rounded-2xl mb-2"
        :style="{ backgroundImage: `url('${bannerURL}')`,backgroundSize: 'cover', backgroundPosition: 'center',height: '100px'
 }"
        >
        <!-- :style="{ backgroundImage: `url('${userStore.bannerUrl}')` ... }" cuando venga de la bbdd -->
        <Avatar
            :image= "iconURL"
            class="ml-2 mt-2"
            size="xlarge"
            shape="circle"
            :pt="{ image: { style: 'width: 100%; height: 100%; object-fit: fill;' } }"
        />
          <p class="absolute inset-0 flex items-center justify-center font-bold text-gray-50 text-2xl">
            USER NAME
        </p>
    </div>
</template>
<script setup>
    import { Avatar } from 'primevue';
    
    const iconURL = 'https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_portatil.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9wb3J0YXRpbC5wbmciLCJpYXQiOjE3NzM4MzAwOTQsImV4cCI6MTgwNTM2NjA5NH0.hrXnk8XtCUhl-udVXZgwqx6Du13c-M7CykqHHhhV2Qg'
    const bannerURL = 'https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/banners/banner_rainbow.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvYmFubmVycy9iYW5uZXJfcmFpbmJvdy5wbmciLCJpYXQiOjE3NzM4Mjg4NTYsImV4cCI6MTgwNTM2NDg1Nn0.emQWCZJn2ml5Pt7PPh8iol3xkPUy9atDEoGAFa7YIwg'
</script>