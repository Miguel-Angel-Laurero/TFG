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
    </div>

    <div class="flex-1 flex justify-center">
      <span class="p-input-icon-left w-full max-w-sm">
        <InputText 
        type="text" 
        v-model="shopStore.searchQuery" 
        placeholder="Busca un producto... " 
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
  import { ref, onMounted } from 'vue';

  const shopStore = useShopStore();
  const categories = ref([])
  const loading = ref(true)

   onMounted(async () => {
        try {
          const response = await fetch('/categoriesData.json')
          categories.value = await response.json()
        } catch {
          console.error("Error al cargar los datos",error)
        } finally {
          loading.value = false;
        }
      })
</script>

