import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/api/axios' 

// ─── Constantes ───────────────────────────────────────────────────────────────

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
    feet:     'Pies',
}

const CATEGORY_TO_SLOT = {
    headwear:  'head',
    upperbody: 'torso',
    hands:     'hands',
    trinkets:  'trinkets',
    lowerbody: 'legs',
    feets:     'feet', 
    icons:     'icon',  
    banners:   'banner',
}

const EMPTY_SLOTS = {
    head: null, torso: null, hands: null, trinkets: null, legs: null, feet: null,
    icon: null, banner: null,
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEquipmentStore = defineStore('equipment', () => {
    // ── Estado del usuario propio (para el perfil/inventario) ──────────────
    const equipped     = reactive({ ...EMPTY_SLOTS })
    const selectedSlot = ref(null)
    const itemPool     = reactive({ head: [], torso: [], hands: [], trinkets: [], legs: [], feet: [], icon: [], banner: [] })
    const loading      = ref(false)
    const error        = ref(null)
    const initialized  = ref(false)

    // ── Cache de equipamiento por userId (para el lobby multijugador) ──────
    // { [userId]: { head: item|null, torso: item|null, ... } }
    const equippedByUser   = reactive({})
    const loadingByUser    = reactive({})
    const initializedUsers = reactive({})

    // ─── Fetch del usuario propio (flujo original) ─────────────────────────
    async function fetchItems() {
        const authStore = useAuthStore()
        if (!authStore.user?.id) return
        // ✅ Eliminado: if (initialized.value) return
        // Siempre recarga para que al recargar página se vea el estado real

        loading.value = true
        error.value   = null
        try {
            const { data } = await api.get(`/users/${authStore.user.id}/items`)
            Object.assign(equipped, EMPTY_SLOTS)
            Object.keys(itemPool).forEach(k => itemPool[k] = [])

            data.forEach(({ id: items_user_id, is_equipped, item }) => {
                if (!item?.category?.name) return
                const slot = CATEGORY_TO_SLOT[item.category.name]
                if (!slot) return
                const enrichedItem = { ...item, items_user_id }
                itemPool[slot].push(enrichedItem)
                if (is_equipped) equipped[slot] = enrichedItem
            })

            // ✅ Sincroniza equippedByUser con el estado propio
            // así Character.vue también ve los cambios
            const ownId = String(authStore.user.id)
            equippedByUser[ownId] = { ...EMPTY_SLOTS }
            Object.entries(equipped).forEach(([slot, item]) => {
                equippedByUser[ownId][slot] = item
            })
            initializedUsers[ownId] = true
            initialized.value = true
        } catch (e) {
            error.value = 'Error al cargar inventario'
        } finally {
            loading.value = false
        }
    }

    // ─── Fetch del equipamiento de cualquier usuario (para el lobby) ───────
    async function fetchItemsForUser(userId) {
        if (!userId) return
        if (initializedUsers[userId]) return   // ya cargado, no repetir petición
        if (loadingByUser[userId]) return       // petición ya en curso

        loadingByUser[userId] = true
        try {
            const { data } = await api.get(`/users/${userId}/equipped`)

            // Inicializar slots vacíos para este usuario
            equippedByUser[userId] = { ...EMPTY_SLOTS }

            data.forEach(({ id: items_user_id, is_equipped, item }) => {
                if (!item?.category?.name) return
                const slot = CATEGORY_TO_SLOT[item.category.name]
                if (!slot) return
                if (is_equipped) {
                    equippedByUser[userId][slot] = { ...item, items_user_id }
                }
            })
            initializedUsers[userId] = true
        } catch (e) {
            console.error(`Error al cargar inventario del usuario ${userId}:`, e)
        } finally {
            loadingByUser[userId] = false
        }
    }

    // Devuelve solo los slots equipados de un usuario (sin nulls)
    function getEquippedByUser(userId) {
        if (!equippedByUser[userId]) return {}
        return Object.fromEntries(
            Object.entries(equippedByUser[userId]).filter(([, item]) => item !== null)
        )
    }

    // Limpia la cache de un usuario (útil cuando abandona el lobby)
    function clearUserCache(userId) {
        delete equippedByUser[userId]
        delete loadingByUser[userId]
        delete initializedUsers[userId]
    }

    // ─── Acciones del inventario propio ────────────────────────────────────
    function openPicker(slotId) {
        selectedSlot.value = selectedSlot.value === slotId ? null : slotId
    }

    async function selectItem(item) {
        const slot = selectedSlot.value
        if (!slot) return

        const authStore = useAuthStore()
        const ownId = String(authStore.user.id)
        const previousItem = equipped[slot]

        // ✅ Actualiza ambos estados a la vez
        equipped[slot] = item
        if (!equippedByUser[ownId]) equippedByUser[ownId] = { ...EMPTY_SLOTS }
        equippedByUser[ownId][slot] = item

        try {
            if (previousItem?.items_user_id !== item.items_user_id) {
                if (previousItem) {
                    await api.put(`/users/${ownId}/items/${previousItem.items_user_id}/equip`, {
                        is_equipped: false,
                    })
                }
                await api.put(`/users/${ownId}/items/${item.items_user_id}/equip`, {
                    is_equipped: true,
                })
            }
        } catch (e) {
            console.error("Error al equipar:", e)
            // ✅ Rollback en ambos estados
            equipped[slot] = previousItem
            equippedByUser[ownId][slot] = previousItem
            error.value = 'No se pudo guardar el equipo'
        } finally {
            selectedSlot.value = null
        }
    }

    return {
        // Estado propio
        equipped, selectedSlot, itemPool, loading, error,
        // Acciones propias
        fetchItems, openPicker, selectItem,
        // Estado y acciones para múltiples usuarios
        equippedByUser, loadingByUser,
        fetchItemsForUser, getEquippedByUser, clearUserCache,
    }
})