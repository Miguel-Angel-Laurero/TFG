<template>
    <div class="w-full bg-indigo-900 top-0 h-20 flex items-center justify-between border-b-4 border-brand-accent">
        <p class="p-2 font-bold text-2xl tracking-tight">
            <span class="text-gray-50">LudoScript</span>
        </p>
        <div class="pr-4" >
            <Menu/>
        </div>
    </div>
</template>
<script setup>
    import Menu from './Menu.vue';
</script>