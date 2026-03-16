
<template>
    <div class="card p-2 flex justify-left">
        <MultiSelect v-model="selectedCategories" :options="categories" optionLabel="name" filter placeholder="Select Categories"
            :maxSelectedLabels="3" class="w-full md:w-80" />
        <button class="bg-teal-100 mx-2 p-2 rounded-xl">Filtrar</button>
    </div>
</template>

<script setup>
  import { ref } from "vue";
  import MultiSelect from 'primevue/multiselect';

  const selectedCategories = ref();
  const categories = [
    { id: "1", name: "icons" },
    { id: "2", name: "banners" },
    { id: "3", name: "headwear" },
    { id: "4", name: "hands" },
    { id: "5", name: "bodywear" },
    { id: "6", name: "legwear" },
    { id: "7", name: "feet" },
    { id: "8", name: "trinkets" },
  ]
</script>