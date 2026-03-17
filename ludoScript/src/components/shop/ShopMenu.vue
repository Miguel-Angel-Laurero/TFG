<template>
  <div class="flex items-center p-2 w-full border-b border-gray-200 bg-white">
    
    <div class="flex-1 flex items-center gap-2">
      <MultiSelect 
        v-model="shopStore.selectedCategories" 
        :options="categories" 
        optionLabel="name" 
        filter 
        placeholder="Select Categories" 
        class="w-full md:w-64" 
      />
      <!-- <button class="bg-teal-100 hover:bg-teal-200 p-2 px-4 rounded-xl transition-colors">
        Filtrar
      </button> -->
    </div>

    <div class="flex-1 flex justify-center">
      <span class="p-input-icon-left w-full max-w-sm">
        <i class="pi pi-search" />
        <InputText 
          type="text" 
          v-model="shopStore.searchQuery" 
          placeholder="Busca un producto..." 
          class="w-full rounded-xl"
        />
      </span>
    </div>

    <div class="flex-1 flex justify-end">
      <div class="flex items-center gap-2 bg-amber-200 p-2 px-4 rounded-2xl border border-amber-100 shadow-sm">
        <i class="pi pi-database text-amber-600"></i> 
        <p class="font-bold text-indigo-900">
          3000
          <span class="text-xs uppercase text-indigo-400"> GB RAM</span>
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import { useShopStore } from '@/stores/shop.store';

  const shopStore = useShopStore();
  const categories = [
    { id: "1", name: "icons" },
    { id: "2", name: "banners" },
    { id: "3", name: "headwear" },
    { id: "4", name: "hands" },
    { id: "5", name: "upperbody" },
    { id: "6", name: "lowerbody" },
    { id: "7", name: "feet" },
    { id: "8", name: "trinkets" },
  ]
</script>

