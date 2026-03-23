import { reactive, ref } from 'vue'

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
export const CENTRAL_SLOTS = [
    { id: 'head' }, { id: 'torso' }, { id: 'trinkets' },
    { id: 'hands' }, { id: 'legs' }, { id: 'feet' },
]
export const SLOT_NAMES = {
    headwear:  'Cabeza',
    upperbody: 'Torso',
    hands:     'Manos',
    trinkets:  'Accesorio',
    lowerbody: 'Piernas',
    feet:      'Pies',
}

const CATEGORY_TO_SLOT = {
    headwear:  'head',
    upperbody: 'torso',
    hands:     'hands',
    trinkets:  'trinkets',
    lowerbody: 'legs',
    feet:      'feet',
}

export function useEquipment() {
    const equipped     = reactive({ head: null, torso: null, hands: null, trinkets: null, legs: null, feet: null })
    const selectedSlot = ref(null)
    const itemPool     = reactive({ head: [], torso: [], hands: [], trinkets: [], legs: [], feet: [] })
    const loading      = ref(true)

    async function fetchItems() {
        try {
            const response = await fetch('/itemData.json')
            const items = await response.json()

            Object.keys(itemPool).forEach(slot => itemPool[slot] = [])

            items.forEach(item => {
                const slot = CATEGORY_TO_SLOT[item.category]
                if (slot) itemPool[slot].push(item)
            })
        } catch (error) {
            console.error('Error al cargar los items:', error)
        } finally {
            loading.value = false
        }
    }

    function openPicker(slotId) {
        selectedSlot.value = selectedSlot.value === slotId ? null : slotId
    }
    function selectItem(item) {
        equipped[selectedSlot.value] = item
        selectedSlot.value = null
    }

    return { equipped, selectedSlot, itemPool, loading, fetchItems, openPicker, selectItem }
}