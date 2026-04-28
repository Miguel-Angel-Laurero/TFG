<template>
    <section class= "bg-white[0.03] p-6 w-full h-full flex flex-col">
        <!-- Info del usuario debajo -->
        <div class="flex-1 min-h-0 overflow-y-auto pb-6">
            <UserInfo />
        </div>
    </section>
</template>
<script setup>
import UserInfo from '../shared/UserInfo.vue';
</script>