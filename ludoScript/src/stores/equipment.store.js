import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/api/axios' 

// ─── Constantes (Asegúrate de que coincidan con tu DB) ───────────────────────

export const LEFT_SLOTS = [
    { id: 'head',  nombre: 'Cabeza' },
    { id: 'torso', nombre: 'Torso' },
    { id: 'hands', nombre: 'Manos' },
]
export const RIGHT_SLOTS = [
    { id: 'trinkets', nombre: 'Accesorio' },
    { id: 'legs',     nombre: 'Piernas' },
    { id: 'feet',     nombre: 'Pies' },
]

export const SLOT_NAMES = {
    head:     'Cabeza',
    torso:    'Torso',
    hands:    'Manos',
    trinkets: 'Accesorio',
    legs:     'Piernas',
    feet: 'Pies',
}

// CRÍTICO: Verifica que estos nombres sean los que devuelve tu API en item.category.name
const CATEGORY_TO_SLOT = {
    headwear:  'head',
    upperbody: 'torso',
    hands:     'hands',
    trinkets:  'trinkets',
    lowerbody: 'legs',
    feets: 'feet', 
    icons:      'icon',  
    banners:    'banner',
}

const EMPTY_SLOTS = {
    head: null, torso: null, hands: null, trinkets: null, legs: null, feet: null,
    icon: null, banner: null,
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEquipmentStore = defineStore('equipment', () => {
    const equipped     = reactive({ ...EMPTY_SLOTS })
    const selectedSlot = ref(null)
    const itemPool     = reactive({ head: [], torso: [], hands: [], trinkets: [], legs: [], feet: [], icon: [], banner: []})
    const loading      = ref(false)
    const error        = ref(null)

    const initialized = ref(false)
    async function fetchItems() {
        const authStore = useAuthStore()
        if (!authStore.user?.id) return
        if (initialized.value) return
        
        loading.value = true
        error.value   = null
        try {
            const { data } = await api.get(`/users/${authStore.user.id}/items`)
            // Limpiar estado antes de llenar
            Object.assign(equipped, EMPTY_SLOTS)
            Object.keys(itemPool).forEach(k => itemPool[k] = [])
            data.forEach(({ id: items_user_id, is_equipped, item }) => {
                if (!item?.category?.name) return
                
                const slot = CATEGORY_TO_SLOT[item.category.name]
                if (!slot) return
                
                const enrichedItem = { ...item, items_user_id }
                itemPool[slot].push(enrichedItem)
                
                if (is_equipped) {
                    equipped[slot] = enrichedItem
                }
                initialized.value = true
            })
        } catch (e) {
            error.value = 'Error al cargar inventario'
        } finally {
            loading.value = false
        }
    }

    function openPicker(slotId) {
        selectedSlot.value = selectedSlot.value === slotId ? null : slotId
    }

    async function selectItem(item) {
        const slot = selectedSlot.value
        if (!slot) return 

        const authStore = useAuthStore()
        const previousItem = equipped[slot]

        // 1. Actualización visual inmediata (Reactividad limpia)
        equipped[slot] = item
        selectedSlot.value = null 

        try {
            const userId = authStore.user.id

            // 2. Desequipar anterior en DB
            if (previousItem) {
                await api.put(`/users/${userId}/items/${previousItem.items_user_id}/equip`, {
                    is_equipped: false,
                })
            }

            // 3. Equipar nuevo en DB
            await api.put(`/users/${userId}/items/${item.items_user_id}/equip`, {
                is_equipped: true,
            })

        } catch (e) {
            console.error("Error al equipar:", e)
            // Revertir si la API falla
            equipped[slot] = previousItem 
            error.value = 'No se pudo guardar el equipo'
        }
    }

    return { equipped, selectedSlot, itemPool, loading, error, fetchItems, openPicker, selectItem }
})