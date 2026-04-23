<template>
    <div class="space-y-5">
        <!-- Controls -->
        <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1">
                <label class="text-xs text-gray-400 font-mono">Declaración</label>
                <div class="flex rounded-lg overflow-hidden border border-white/10 text-sm">
                    <button v-for="kw in keywords" :key="kw" @click="keyword = kw" :class="[
                        'px-3 py-1.5 font-mono font-bold transition-colors',
                        keyword === kw ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    ]">{{ kw }}</button>
                </div>
            </div>
            <div class="flex flex-col gap-1 flex-1 min-w-[100px]">
                <label class="text-xs text-gray-400 font-mono">Nombre</label>
                <input v-model="varName" :readonly="keyword === 'const' && locked" maxlength="20"
                    placeholder="miVariable"
                    class="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div class="flex flex-col gap-1 flex-1 min-w-[100px]">
                <label class="text-xs text-gray-400 font-mono">Valor</label>
                <input v-model="varValue" :readonly="keyword === 'const' && locked" maxlength="30" placeholder="42"
                    class="bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                    :class="{ 'opacity-50 cursor-not-allowed': keyword === 'const' && locked }" />
            </div>
            <button v-if="keyword === 'const'" @click="locked = !locked" :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border',
                locked
                    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                    : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white'
            ]">
                <i :class="locked ? 'pi pi-lock' : 'pi pi-lock-open'" />
                {{ locked ? 'Bloqueado' : 'Desbloqueado' }}
            </button>
        </div>

        <!-- Visual memory box -->
        <div class="flex justify-center py-4">
            <div class="flex flex-col items-center">
                <!-- Label (variable name) -->
                <div :class="[
                    'px-5 py-1.5 rounded-t-xl text-sm font-mono font-bold text-white min-w-[120px] text-center transition-all duration-300',
                    keyword === 'const' ? 'bg-yellow-600' : 'bg-blue-600'
                ]">
                    {{ displayName }}
                </div>
                <!-- Box (value) -->
                <div :class="[
                    'relative border-2 rounded-b-xl px-10 py-6 min-w-[160px] min-h-[72px] flex items-center justify-center transition-all duration-300',
                    keyword === 'const' && locked ? 'border-yellow-500/60 bg-yellow-500/5' : 'border-blue-500/60 bg-blue-500/5'
                ]">
                    <span class="text-xl font-mono font-bold text-white text-center break-all">
                        {{ displayValue || '…' }}
                    </span>
                    <!-- Lock icon for const -->
                    <i v-if="keyword === 'const' && locked"
                        class="pi pi-lock absolute top-1.5 right-2 text-yellow-500/60 text-xs" />
                </div>
                <!-- Address label -->
                <p class="text-xs text-gray-600 font-mono mt-1.5">0x{{ memAddr }}</p>
            </div>
        </div>

        <!-- Code snippet -->
        <div class="rounded-xl overflow-hidden border border-white/10">
            <div class="bg-gray-950/80 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <span class="text-xs text-gray-500 font-mono">JavaScript</span>
                <span class="text-xs text-gray-600">preview</span>
            </div>
            <pre
                class="bg-gray-950/60 px-4 py-3 text-sm font-mono overflow-x-auto"><code><span :class="keyword === 'const' ? 'text-yellow-400' : 'text-blue-400'">{{ keyword }}</span><span class="text-white"> {{ displayName }}</span><span class="text-gray-400"> = </span><span :class="isNumber ? 'text-orange-300' : 'text-green-300'">{{ codeValue }}</span><span class="text-gray-500">;</span>
<span v-if="keyword === 'const' && locked" class="text-gray-600">// {{ displayName }} = "otro valor"; ← Error: Assignment to constant</span></code></pre>
        </div>

        <p class="text-xs text-gray-500 text-center">{{ hint }}</p>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const keywords = ['let', 'const', 'var']
const keyword = ref('let')
const varName = ref('miVariable')
const varValue = ref('42')
const locked = ref(true)

const displayName = computed(() => varName.value.replace(/\s/g, '') || 'miVariable')
const isNumber = computed(() => varValue.value !== '' && !isNaN(varValue.value))
const isBool = computed(() => varValue.value === 'true' || varValue.value === 'false')
const displayValue = computed(() => varValue.value)
const codeValue = computed(() => {
    if (isBool.value) return varValue.value
    if (isNumber.value) return varValue.value
    return `"${varValue.value || ''}"`
})

const hint = computed(() =>
    keyword.value === 'const'
        ? '🔒 const no se puede reasignar una vez declarado'
        : '✏️ Modifica el nombre o el valor y el código se actualiza solo'
)

// Fake memory address for educational flavour
const memAddr = computed(() => {
    const hash = (displayName.value + displayValue.value)
        .split('')
        .reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
    return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase().slice(0, 6)
})
</script>
