import { ref, computed, onMounted, onUnmounted } from 'vue'

// Tamaños base por slot (multiplicadores relativos al centralSlotSize)
const SLOT_SIZE_MULTIPLIERS = {
    head:     1.0,
    torso:    1.2,
    trinkets: 0.8,
    hands:    0.8,
    legs:     1.0,
    feet:     0.9,
}

export function useAvatarSize(containerRef, slotOverrides = {}) {
    const containerH = ref(300)

    let ro
    onMounted(() => {
        ro = new ResizeObserver(entries => {
            containerH.value = entries[0].contentRect.height
        })
        ro.observe(containerRef.value)
    })
    onUnmounted(() => ro?.disconnect())

    const slotSize        = computed(() => Math.max(40, Math.floor(containerH.value * 0.25)))
    const cardWidth       = computed(() => Math.max(120, Math.floor(containerH.value * 0.80)))
    const cardHeight      = computed(() => Math.max(180, Math.floor(containerH.value * 0.90)))
    const centralSlotSize = computed(() => Math.max(24, Math.floor(slotSize.value * 0.7)))

    // Tamaño individual por slot: override > multiplicador base > centralSlotSize
    const slotSizes = computed(() => {
        const base = centralSlotSize.value
        return Object.fromEntries(
            Object.keys(SLOT_SIZE_MULTIPLIERS).map(key => {
                const override = slotOverrides[key]
                const size = override
                    ? { w: override.w ?? Math.floor(base * SLOT_SIZE_MULTIPLIERS[key]),
                        h: override.h ?? Math.floor(base * SLOT_SIZE_MULTIPLIERS[key]) }
                    : { w: Math.floor(base * SLOT_SIZE_MULTIPLIERS[key]),
                        h: Math.floor(base * SLOT_SIZE_MULTIPLIERS[key]) }
                return [key, size]
            })
        )
    })


    return { slotSize, cardWidth, cardHeight, slotSizes }
}