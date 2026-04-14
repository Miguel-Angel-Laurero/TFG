<template>
    <div class="w-full min-h-screen md:h-screen md:overflow-hidden p-2 md:p-4 bg-blue-950/20">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            
            <div class="lg:col-span-7 flex flex-col gap-4 md:gap-2 min-h-0">
                <Banner class="flex-shrink-0 w-full" />
                
                <AvatarProfile class="flex-1 min-h-[400px] md:min-h-0" />
            </div>

            <div class="lg:col-span-5 flex flex-col gap-4 lg:overflow-y-auto lg:h-full pr-0 lg:pr-2 pb-10 lg:pb-0">       
                <div class="bg-indigo-900/20 rounded-3xl p-1 border border-white/5">
                    <UserStats />
                </div>

                <div class="bg-indigo-900/20 rounded-3xl p-1 border border-white/5">
                    <FortnightResume />
                </div>        
            </div>
        </div>
    </div>
</template>

<script setup>
import AvatarProfile from './AvatarProfile.vue';
import Banner from './Banner.vue';
import FortnightResume from './FortnightResume.vue';
import UserStats from './UserStats.vue';
</script>