<template>
    <div class="space-y-5">
        <!-- Toolbar -->
        <div class="flex flex-wrap gap-2 items-center">
            <div class="flex gap-1.5 flex-1 min-w-0">
                <input v-model="inputVal" placeholder="valor..." maxlength="10" @keydown.enter="pushItem"
                    class="flex-1 min-w-0 bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <button @click="pushItem"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 bg-cyan-600/80 hover:bg-cyan-500 text-white">
                <i class="pi pi-arrow-right" /> push
            </button>
            <button @click="unshiftItem"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 bg-cyan-800/80 hover:bg-cyan-700 text-white">
                <i class="pi pi-arrow-left" /> unshift
            </button>
            <button @click="popItem" :disabled="items.length === 0"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">
                pop <i class="pi pi-times" />
            </button>
            <button @click="shiftItem" :disabled="items.length === 0"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">
                shift <i class="pi pi-times" />
            </button>
        </div>

        <!-- Array visualization -->
        <div class="bg-gray-900/60 rounded-2xl p-4 min-h-[100px] flex flex-col gap-3">
            <!-- Index labels -->
            <div v-if="items.length > 0" class="overflow-x-auto">
                <div class="flex gap-2 pb-1 w-max">
                    <TransitionGroup name="array-item" tag="div" class="flex gap-2">
                        <div v-for="(item, i) in items" :key="item.id" class="flex flex-col items-center gap-1">
                            <span class="text-xs text-gray-500 font-mono">[{{ i }}]</span>
                            <div :class="[
                                'w-14 h-14 flex items-center justify-center rounded-xl border-2 text-sm font-mono font-bold',
                                item.highlight === 'push' ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 scale-110' :
                                    item.highlight === 'unshift' ? 'bg-purple-500/30 border-purple-400 text-purple-300 scale-110' :
                                        'bg-gray-800 border-gray-600 text-gray-200'
                            ]">
                                {{ item.value }}
                            </div>
                        </div>
                    </TransitionGroup>
                </div>
            </div>
            <div v-else class="flex items-center justify-center text-gray-600 text-sm font-mono py-4">
                [ ] — array vacío
            </div>

            <!-- Last operation -->
            <Transition name="fade">
                <div v-if="lastOp" class="flex items-center gap-2 text-xs">
                    <span :class="['font-mono font-bold px-2 py-0.5 rounded', lastOp.class]">{{ lastOp.label }}</span>
                    <span class="text-gray-400">{{ lastOp.description }}</span>
                </div>
            </Transition>
        </div>

        <!-- Length indicator -->
        <div class="flex items-center gap-2 text-sm text-gray-400">
            <i class="pi pi-list text-cyan-500" />
            <span class="font-mono">arr.length = <span class="text-cyan-400 font-bold">{{ items.length }}</span></span>
        </div>

        <!-- Code snippet -->
        <div class="rounded-xl overflow-hidden border border-white/10">
            <div class="bg-gray-950/80 px-4 py-2 border-b border-white/5">
                <span class="text-xs text-gray-500 font-mono">Estado actual del array</span>
            </div>
            <pre class="bg-gray-950/60 px-4 py-3 text-sm font-mono overflow-x-auto"><code><span class="text-blue-400">const</span><span class="text-white"> arr</span><span class="text-gray-400"> = </span><span class="text-cyan-300">[{{ displayArray }}]</span><span class="text-gray-500">;</span>
<span v-if="lastOp" class="text-gray-600">// Última operación: arr.{{ lastOp.label }}</span></code></pre>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

let idCounter = 0
const inputVal = ref('')

const items = ref([
    { id: idCounter++, value: '"a"', highlight: null },
    { id: idCounter++, value: '"b"', highlight: null },
    { id: idCounter++, value: '"c"', highlight: null },
])

const lastOp = ref(null)

function getVal() {
    const v = inputVal.value.trim() || '?'
    const isNum = !isNaN(v) && v !== ''
    return isNum ? v : `"${v}"`
}

function clearHighlights() {
    items.value.forEach((item) => (item.highlight = null))
}

function pushItem() {
    clearHighlights()
    const newItem = { id: idCounter++, value: getVal(), highlight: 'push' }
    items.value.push(newItem)
    lastOp.value = {
        label: `push(${newItem.value})`,
        description: `añadido al final. índice [${items.value.length - 1}]`,
        class: 'bg-cyan-500/20 text-cyan-400',
    }
    setTimeout(clearHighlights, 1000)
}

function unshiftItem() {
    clearHighlights()
    const newItem = { id: idCounter++, value: getVal(), highlight: 'unshift' }
    items.value.unshift(newItem)
    lastOp.value = {
        label: `unshift(${newItem.value})`,
        description: 'añadido al principio. desplaza todos los índices',
        class: 'bg-purple-500/20 text-purple-400',
    }
    setTimeout(clearHighlights, 1000)
}

function popItem() {
    if (items.value.length === 0) return
    clearHighlights()
    const removed = items.value.pop()
    lastOp.value = {
        label: 'pop()',
        description: `eliminado del final: ${removed.value}`,
        class: 'bg-red-500/20 text-red-400',
    }
}

function shiftItem() {
    if (items.value.length === 0) return
    clearHighlights()
    const removed = items.value.shift()
    lastOp.value = {
        label: 'shift()',
        description: `eliminado del principio: ${removed.value}`,
        class: 'bg-orange-500/20 text-orange-400',
    }
}

const displayArray = computed(() =>
    items.value.map((i) => i.value).join(', ')
)
</script>

<style scoped>
.array-item-enter-active,
.array-item-leave-active {
    transition: all 0.3s ease;
}

.array-item-enter-from {
    opacity: 0;
    transform: scale(0.5) translateY(-20px);
}

.array-item-leave-to {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
}

.array-item-move {
    transition: transform 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
