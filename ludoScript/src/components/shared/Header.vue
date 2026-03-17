<template>
    <div class="w-full bg-indigo-900 top-0 h-20 flex items-center justify-between border-b-4 border-brand-accent">
        <div class="w-full bg-indigo-900 top-0 h-20 flex items-center justify-left border-b-4 border-brand-accent">
            <Avatar 
                    image="./src/assets/images/logo.png" 
                    class="mx-4" 
                    size="medium" 
                    shape="circle" 
                />
            <div class="font-bold text-2xl tracking-tight text-gray-50 flex items-left gap-2">
                <RouterLink to="/" >
                    Home
                </RouterLink>
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