import { reactive, ref } from 'vue'

export const LEFT_SLOTS  = [
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
    head: 'cabeza', torso: 'torso', hands: 'manos',
    trinkets: 'accesorio', legs: 'piernas', feet: 'pies'
}
export const ITEM_POOL = {
    head: [
        { id: '2', nombre: 'Gafas',    img: 'https://cdn-icons-png.flaticon.com/512/655/655781.png' },
        { id: '4', nombre: 'Afro',     img: 'https://cdn-icons-png.flaticon.com/512/3165/3165383.png' },
        { id: '6', nombre: 'Sombrero', img: 'https://cdn-icons-png.flaticon.com/512/2418/2418731.png' },
    ],
    torso:    [{ id: '3', nombre: 'Camisa',    img: 'https://cdn-icons-png.flaticon.com/512/2503/2503380.png' }],
    hands:    [{ id: '7', nombre: 'Guantes',   img: 'https://cdn-icons-png.flaticon.com/512/2418/2418731.png' }],
    trinkets: [{ id: '8', nombre: 'Accesorio', img: 'https://cdn-icons-png.flaticon.com/512/2418/2418731.png' }],
    legs:     [{ id: '1', nombre: 'Pantalón',  img: 'https://cdn-icons-png.flaticon.com/512/2122/2122607.png' }],
    feet:     [{ id: '5', nombre: 'Zapatos',   img: 'https://cdn-icons-png.flaticon.com/512/2742/2742689.png' }],
}

export function useEquipment() {
    const equipped     = reactive({ head: null, torso: null, hands: null, trinkets: null, legs: null, feet: null })
    const selectedSlot = ref(null)

    function openPicker(slotId) {
        selectedSlot.value = selectedSlot.value === slotId ? null : slotId
    }
    function selectItem(item) {
        equipped[selectedSlot.value] = item
        selectedSlot.value = null
    }

    return { equipped, selectedSlot, openPicker, selectItem }
}