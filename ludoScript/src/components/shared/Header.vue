<template>
    <div class="w-full bg-indigo-900 top-0 h-12 flex items-center justify-between">
        <div class="w-full bg-indigo-900 top-0 h-12 flex items-center justify-left">
            <Avatar 
                    :image="'https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9nby5wbmciLCJpYXQiOjE3NzM4MjM0MTQsImV4cCI6MTgwNTM1OTQxNH0.WY6B0Rp-ojvGR_WDYJF3BnDOyTRJJjAVSYpY_UpF9jg'" 
                    class="mx-4" 
                    size="medium" 
                    shape="circle" 
                />
            <div class="font-bold text-2xl tracking-tight text-gray-50 flex items-left gap-2">
                <h1>LudoScript / 
                    <RouterLink to="/" >Home</RouterLink>
                </h1>
            </div>
        </div>
        <div class="pr-4" >
            <Menu/>
        </div>
    </div>
</template>
<script setup>
    import Menu from './Menu.vue';
    import Avatar from 'primevue/avatar';
</script>