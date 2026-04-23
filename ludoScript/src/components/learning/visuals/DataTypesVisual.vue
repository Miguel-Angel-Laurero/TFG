<template>
    <div class="space-y-4">
        <p class="text-xs text-gray-400">Pulsa en cada tipo para ver cómo funciona</p>

        <!-- Type cards grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button v-for="type in TYPES" :key="type.name"
                @click="selectedType = selectedType?.name === type.name ? null : type" :class="[
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200',
                    selectedType?.name === type.name
                        ? [type.activeBg, type.activeBorder, 'scale-[1.03] shadow-lg']
                        : 'bg-gray-900/60 border-white/10 hover:border-white/20 hover:bg-gray-800/60'
                ]">
                <span class="text-xl">{{ type.emoji }}</span>
                <span
                    :class="['text-xs font-mono font-bold', selectedType?.name === type.name ? type.activeText : 'text-gray-300']">
                    {{ type.name }}
                </span>
                <span class="text-xs text-gray-500">{{ type.example }}</span>
            </button>
        </div>

        <!-- Selected type detail -->
        <Transition name="expand">
            <div v-if="selectedType"
                :class="['rounded-xl border p-4 space-y-3 transition-all', selectedType.activeBg, selectedType.activeBorder]">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">{{ selectedType.emoji }}</span>
                    <div>
                        <p :class="['font-mono font-bold text-sm', selectedType.activeText]">{{ selectedType.name }}</p>
                        <p class="text-gray-300 text-sm">{{ selectedType.description }}</p>
                    </div>
                </div>

                <!-- Code examples -->
                <div class="rounded-lg overflow-hidden border border-white/10">
                    <div class="bg-gray-950/80 px-3 py-1.5 border-b border-white/5">
                        <span class="text-xs text-gray-500 font-mono">Ejemplos</span>
                    </div>
                    <pre
                        class="bg-gray-950/60 px-4 py-3 text-sm font-mono overflow-x-auto"><code v-for="(line, i) in selectedType.codeLines" :key="i" class="block">
<span class="text-blue-400">const</span><span class="text-white"> {{ line.varName }}</span><span class="text-gray-400"> = </span><span :class="selectedType.activeText">{{ line.value }}</span><span class="text-gray-500">; </span><span class="text-gray-600">// typeof → "{{ selectedType.typeofResult }}"</span></code></pre>
                </div>

                <!-- typeof tag -->
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs text-gray-400">typeof devuelve:</span>
                    <span
                        :class="['text-xs font-mono font-bold px-2 py-0.5 rounded', selectedType.activeBg, selectedType.activeText]">
                        "{{ selectedType.typeofResult }}"
                    </span>
                    <span v-if="selectedType.gotcha" class="text-xs text-yellow-400">
                        ⚠️ {{ selectedType.gotcha }}
                    </span>
                </div>
            </div>
        </Transition>

        <p v-if="!selectedType" class="text-xs text-gray-600 text-center">
            Selecciona un tipo para ver sus detalles y ejemplos de código
        </p>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const TYPES = [
    {
        name: 'number',
        emoji: '🔢',
        example: '42, 3.14',
        description: 'Números enteros y decimales. Con ellos puedes hacer cuentas.',
        activeBg: 'bg-orange-500/15',
        activeBorder: 'border-orange-500/40',
        activeText: 'text-orange-400',
        typeofResult: 'number',
        gotcha: null,
        codeLines: [
            { varName: 'edad', value: '28' },
            { varName: 'precio', value: '9.99' },
        ],
    },
    {
        name: 'string',
        emoji: '📝',
        example: '"Hola", "abc"',
        description: 'Texto. Cualquier cosa entre comillas: letras, palabras, frases.',
        activeBg: 'bg-green-500/15',
        activeBorder: 'border-green-500/40',
        activeText: 'text-green-400',
        typeofResult: 'string',
        gotcha: null,
        codeLines: [
            { varName: 'nombre', value: '"Ana"' },
            { varName: 'saludo', value: '"¡Hola, mundo!"' },
        ],
    },
    {
        name: 'boolean',
        emoji: '✅',
        example: 'true / false',
        description: 'Solo puede ser verdadero o falso. Como un interruptor de luz.',
        activeBg: 'bg-blue-500/15',
        activeBorder: 'border-blue-500/40',
        activeText: 'text-blue-400',
        typeofResult: 'boolean',
        gotcha: null,
        codeLines: [
            { varName: 'estaActivo', value: 'true' },
            { varName: 'tienePermiso', value: 'false' },
        ],
    },
    {
        name: 'null',
        emoji: '🚫',
        example: 'null',
        description: 'Ausencia intencionada de valor. "Sé que aquí debería haber algo, pero no lo hay."',
        activeBg: 'bg-red-500/15',
        activeBorder: 'border-red-500/40',
        activeText: 'text-red-400',
        typeofResult: 'object',
        gotcha: 'Devuelve "object" — es un bug histórico de JS',
        codeLines: [
            { varName: 'resultado', value: 'null' },
            { varName: 'usuario', value: 'null' },
        ],
    },
    {
        name: 'undefined',
        emoji: '❓',
        example: 'undefined',
        description: 'Variable declarada pero sin valor asignado. "Hay una caja, pero está vacía."',
        activeBg: 'bg-gray-500/15',
        activeBorder: 'border-gray-500/40',
        activeText: 'text-gray-300',
        typeofResult: 'undefined',
        gotcha: null,
        codeLines: [
            { varName: 'sinValor', value: 'undefined' },
        ],
    },
    {
        name: 'array',
        emoji: '📋',
        example: '[1, 2, 3]',
        description: 'Una lista ordenada de valores. Cada elemento tiene un número de posición.',
        activeBg: 'bg-cyan-500/15',
        activeBorder: 'border-cyan-500/40',
        activeText: 'text-cyan-400',
        typeofResult: 'object',
        gotcha: 'Los arrays son objetos especiales en JS',
        codeLines: [
            { varName: 'frutas', value: '["manzana", "pera"]' },
            { varName: 'nums', value: '[1, 2, 3, 4]' },
        ],
    },
]

const selectedType = ref(null)
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
