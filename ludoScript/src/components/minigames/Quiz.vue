<template>
  <div class="w-full flex flex-col p-8"> 
    <div>
      <h1 class="flex justify-center text-3xl font-bold text-gray-50">Quiz</h1>
      <h2 class="flex justify-center text-xl text-gray-50 my-8">{{ question }}</h2>
    </div>

    <div class="grid grid-cols-4 gap-6">
      <div 
        v-for="option in options" 
        :key="option.id"
        class="flex flex-col items-center justify-center h-64 cursor-pointer bg-white border-2 border-transparent shadow-md rounded-2xl transition-all hover:border-brand-primary hover:shadow-xl hover:-translate-y-1 p-6 text-center"
      >
        <span class="text-brand-primary font-bold text-lg mb-2">{{ option.id }}.</span>
        <span class="text-gray-700 font-medium">{{ option.name }}</span>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref } from 'vue';
const question = ref("¿Que es una interfaz?");
const options = [
    {id:"1", name:"Opcion"},
    {id:"2", name:"Opcion"},
    {id:"3", name:"Opcion"},
    {id:"4", name:"Opcion"},
]
</script>