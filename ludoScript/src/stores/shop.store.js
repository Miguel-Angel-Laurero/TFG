import { defineStore } from 'pinia';

export const useShopStore = defineStore('shop', {
  state: () => ({
    searchQuery: '',
    selectedCategories: []
  })
});