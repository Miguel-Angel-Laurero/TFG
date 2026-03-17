<template>
    <div class="flex p-2">
      <div class="card">
          <MultiSelect v-model="selectedCategories" :options="categories" optionLabel="name" filter placeholder="Select Categories"
              :maxSelectedLabels="3" class="w-full md:w-80" />
          <button class="bg-teal-100 mx-2npm  p-2 rounded-xl">Filtrar</button>
      </div>
      <div class="card">
        <InputText type="text" v-model="value" placeholder="Busca un producto..."/>
      </div>
      <div class="card">
          <p class="flex justify-right align-center">Monedas de Usuario</p>
      </div>
    </div>
</template>

<script setup>
  import { ref } from "vue";
import MultiSelect from 'primevue/multiselect';
  
import InputText from 'primevue/inputtext';

  const value = ref(null);
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