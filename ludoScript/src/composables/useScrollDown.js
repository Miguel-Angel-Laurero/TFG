import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useScrollDown() {
    const canScrollDown = ref(false);

    function checkScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const windowHeight = window.innerHeight
        const docHeight = document.documentElement.scrollHeight

        canScrollDown.value = scrollTop +windowHeight < docHeight -1
    }

    onMounted(() => {
        checkScroll()
        window.addEventListener('scroll',checkScroll)
        window.addEventListener('resize',checkScroll)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll',checkScroll)
        window.removeEventListener('resize',checkScroll)
    })

    return {canScrollDown}
}
