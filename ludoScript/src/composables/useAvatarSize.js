import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useAvatarSize(containerRef) {
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

    const centralSlotStyles = computed(() => {
        const half = `calc(50% - ${centralSlotSize.value / 2}px)`
        const h = cardHeight.value
        return {
        head:     { top: Math.floor(h * 0.00) + 'px', left: half },
        torso:    { top: Math.floor(h * 0.20) + 'px', left: half },
        trinkets: { top: Math.floor(h * 0.35) + 'px', left: '8%' },
        hands:    { top: Math.floor(h * 0.35) + 'px', right: '8%' },
        legs:     { top: Math.floor(h * 0.50) + 'px', left: half },
        feet:     { top: Math.floor(h * 0.70) + 'px', left: half },
    }
    })

    return { slotSize, cardWidth, cardHeight, centralSlotSize, centralSlotStyles }
}