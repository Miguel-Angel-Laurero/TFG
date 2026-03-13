<template>
    <div class="w-full bg-brand-surface text-brand-text top-0 h-20 flex items-center justify-between border-b-4 border-brand-accent">
        <p class="p-2 font-bold text-brand-text text-2xl tracking-tight">
            Ludo<span class="text-brand-text">Script</span>
        </p>
        <div class="pr-4" >
            <Menu/>
        </div>
    </div>
</template>
<script setup>
    import Menu from './Menu.vue';
</script>