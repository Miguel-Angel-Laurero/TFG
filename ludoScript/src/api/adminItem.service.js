import api from '@/api/axios'

export default {
    getItems:       (page = 1, limit = 20, search = '') =>
        api.get('/items', { params: { page, limit, search } }),

    getCategories:  () =>
        api.get('/items/categories'),

    createItem:     (itemData) =>
        api.post('/items', itemData),

    updateItem:     (id, itemData) =>
        api.put(`/items/${id}`, itemData),

    deleteItem:     (id) =>
        api.delete(`/items/${id}`),
}
