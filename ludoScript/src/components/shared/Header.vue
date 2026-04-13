<template>
    <nav class="w-full bg-blue-900 top-0 py-2 px-2 sm:px-6 flex items-center justify-between font-righteous shadow-lg">
        
        <div class="flex items-center min-w-0 flex-1">
            <Avatar
                :image="'https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9nby5wbmciLCJpYXQiOjE3NzM4MjM0MTQsImV4cCI6MTgwNTM1OTQxNH0.WY6B0Rp-ojvGR_WDYJF3BnDOyTRJJjAVSYpY_UpF9jg'"
                class="flex-shrink-0 mr-2 sm:mx-4" 
                size="medium" 
                shape="circle" 
            />
            
            <div class="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-gray-50 truncate">
                <h1 class="flex items-center gap-1 sm:gap-2">
                    <span>LudoScript</span>
                    <span class="text-white/40">/</span>
                    <RouterLink 
                        to="/" 
                        class="text-white/50 hover:text-yellow-400 transition-colors font-normal truncate"
                    >
                        Home
                    </RouterLink>
                </h1>
            </div>
        </div>

        <div class="flex-shrink-0 pl-2">
            <Menu />
        </div>
    </nav>
</template>

<script setup>
import Menu from './Menu.vue';
import Avatar from 'primevue/avatar';
</script>