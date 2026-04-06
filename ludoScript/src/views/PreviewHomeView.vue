<template>
    <div class="min-h-screen p-6 font-sans text-slate-800" style="background-color: #F2F4F7;">

        <nav
            class="flex items-center justify-between px-8 py-4 mb-8 border glass-card rounded-2xl border-white/50 shadow-blue-soft">
            <div class="flex items-center gap-2">
                <div
                    class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 shadow-md shadow-blue-500/20">
                </div>
                <span class="text-xl font-bold tracking-tight uppercase text-blue-950 tracking-tighter">Ludo<span
                        class="font-light text-blue-700">Script</span></span>
            </div>

            <div class="flex items-center gap-6">
                <div class="px-4 py-2 text-sm font-medium border glass-card rounded-xl border-white/70">
                    <span class="opacity-60 text-slate-600">Balance:</span> <span class="text-blue-600 font-bold">410
                        GB</span>
                </div>
                <div class="w-10 h-10 overflow-hidden border-2 border-blue-100 rounded-full shadow-md">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lex" alt="Avatar" />
                </div>
            </div>
        </nav>

        <div class="grid grid-cols-12 gap-8">

            <aside class="col-span-5 lg:col-span-3">
                <div
                    class="relative flex flex-col items-center py-16 border glass-card rounded-[2.5rem] border-white/50 shadow-blue-soft min-h-[850px]">

                    <div class="text-center mb-20">
                        <h3 class="text-xs font-bold tracking-[0.2em] uppercase text-blue-900 opacity-40">Skill Tree
                        </h3>
                        <p class="text-[10px] text-blue-400 font-medium mt-1">Progreso de Carrera</p>
                    </div>

                    <div class="flex flex-col items-center space-y-28">
                        <div v-for="(node, index) in skillNodes" :key="index" class="relative group">

                            <div v-if="node.status === 'next'"
                                class="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-white/80 backdrop-blur-sm border border-blue-200 text-[8px] font-bold text-blue-600 rounded-full z-20 shadow-sm shadow-blue-100">
                                SUGERIDO
                                <div class="absolute inset-0 bg-blue-400/10 animate-pulse rounded-full"></div>
                            </div>

                            <div class="relative z-10 flex items-center justify-center w-16 h-16 transition-all duration-500 border-2 rounded-2xl text-2xl"
                                :class="[
                                    node.status === 'locked' ? 'bg-slate-100/30 border-slate-200 opacity-30 grayscale cursor-not-allowed' : 'bg-white shadow-blue-node cursor-pointer border-white group-hover:scale-105 group-hover:shadow-blue-glow',
                                    node.status === 'completed' ? 'border-emerald-100 shadow-emerald-500/5' : ''
                                ]">
                                <span>{{ node.status === 'locked' ? '🔒' : node.icon }}</span>

                                <div v-if="node.status === 'completed'"
                                    class="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md border-2 border-white">
                                    ✓
                                </div>
                            </div>

                            <div class="absolute w-32 px-1 -bottom-16 left-1/2 -translate-x-1/2 text-center">
                                <div v-if="node.status !== 'locked'"
                                    class="h-1 overflow-hidden bg-blue-100/50 rounded-full w-full mb-3 border border-white/40">
                                    <div class="h-full transition-all duration-1000"
                                        :class="node.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-500'"
                                        :style="{ width: node.progress + '%' }"></div>
                                </div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-blue-950"
                                    :class="{ 'opacity-20': node.status === 'locked' }">
                                    {{ node.label }}
                                </p>
                            </div>

                            <div v-if="index < skillNodes.length - 1"
                                class="absolute top-16 left-1/2 -translate-x-1/2 h-28 w-[1px] bg-gradient-to-b from-blue-200/50 to-transparent -z-0">
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main class="col-span-7 lg:col-span-9">

                <section
                    class="flex items-center gap-8 p-8 mb-8 border glass-card rounded-3xl border-white/50 shadow-blue-soft">
                    <div class="relative">
                        <div
                            class="w-32 h-32 overflow-hidden border-4 border-white shadow-xl rounded-2xl shadow-blue-500/10 text-4xl flex items-center justify-center bg-blue-50">
                            <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=LexOverride"
                                class="object-cover w-full h-full" />
                        </div>
                        <div
                            class="absolute px-3 py-1 text-xs font-black tracking-widest text-white -bottom-3 left-6 bg-blue-600 rounded-lg shadow-lg">
                            GOLD</div>
                    </div>

                    <div class="flex-1">
                        <div class="flex items-end justify-between mb-4">
                            <div>
                                <h1 class="text-3xl font-light tracking-tight text-blue-950">LEX_OVERRIDE</h1>
                                <p class="text-sm text-blue-700 opacity-80">Senior Systems Architect</p>
                            </div>
                            <div class="flex gap-4">
                                <div
                                    class="flex items-center gap-2 px-4 py-2 border glass-card rounded-xl border-white/60 shadow-sm bg-white/40">
                                    <span>🔥</span> <span class="text-sm font-bold text-blue-950">STREAK 12</span>
                                </div>
                                <div
                                    class="flex items-center gap-2 px-4 py-2 border glass-card rounded-xl border-white/60 shadow-sm bg-white/40">
                                    <span>🎯</span> <span class="text-sm font-bold text-blue-950">98%</span>
                                </div>
                            </div>
                        </div>
                        <div class="w-full h-2.5 bg-white/60 rounded-full border border-white/50">
                            <div class="h-full rounded-full bg-blue-600 shadow-md shadow-blue-500/20"
                                style="width: 82%"></div>
                        </div>
                    </div>
                </section>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <button
                        class="group relative overflow-hidden p-8 border glass-card rounded-[2.5rem] border-white/70 text-left transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-blue-200/50 hover:bg-white/50">
                        <div class="relative z-10">
                            <div
                                class="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-white shadow-inner border border-blue-50 text-2xl group-hover:scale-110 transition-transform">
                                🧠
                            </div>
                            <h3 class="text-2xl font-semibold tracking-tight mb-2 text-blue-950">Quiz Arena</h3>
                            <p class="text-sm text-blue-800/80 leading-relaxed max-w-[220px] mb-6">Desafíos en tiempo
                                real para tu lógica de programación.</p>
                            <div
                                class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                                Comenzar Reto →</div>
                        </div>
                    </button>

                    <button
                        class="group relative overflow-hidden p-8 border glass-card rounded-[2.5rem] border-white/70 text-left transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-cyan-200/50 hover:bg-white/50">
                        <div class="relative z-10">
                            <div
                                class="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl bg-white shadow-inner border border-cyan-50 text-2xl group-hover:scale-110 transition-transform">
                                🗂️
                            </div>
                            <h3 class="text-2xl font-semibold tracking-tight mb-2 text-blue-950">Flashcards</h3>
                            <p class="text-sm text-blue-800/80 leading-relaxed max-w-[220px] mb-6">Memoriza sintaxis y
                                algoritmos clave sin esfuerzo.</p>
                            <div
                                class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-600">
                                Repasar Ahora →</div>
                        </div>
                    </button>
                </div>

                <section>
                    <h3 class="text-xs font-bold tracking-[0.2em] uppercase text-blue-900 opacity-60 mb-6 ml-2">
                        Explorador de Dominio</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div v-for="cat in categories" :key="cat.name"
                            class="relative group cursor-pointer border glass-card rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]"
                            :style="getHeatmapStyle(cat.score)">
                            <div class="absolute top-3 right-3 w-2 h-2 rounded-full"
                                :class="getStatusIndicatorColor(cat.score)"></div>
                            <div class="flex flex-col h-full justify-between">
                                <div>
                                    <p
                                        class="text-[10px] font-black uppercase tracking-tighter text-blue-900 opacity-50 mb-1">
                                        {{ cat.tech }}</p>
                                    <h4 class="text-sm font-bold text-blue-950 leading-tight">{{ cat.name }}</h4>
                                </div>
                                <div class="mt-4 flex items-end justify-between">
                                    <span class="text-lg font-light tracking-tighter text-blue-950">{{ cat.score
                                    }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>
</template>

<script setup>
// Datos Árbol de Habilidades con Emojis
const skillNodes = [
    { icon: '💻', label: 'Fundamentos CLI', progress: 100, status: 'completed' },
    { icon: '⏳', label: 'Asincronía JS', progress: 65, status: 'active' },
    { icon: '🗄️', label: 'Arquitectura SQL', progress: 0, status: 'next' },
    { icon: '🤖', label: 'Deep Learning', progress: 0, status: 'locked' }
];

const categories = [
    { name: 'Gestión del DOM', tech: 'JavaScript', score: 92 },
    { name: 'Flexbox & Grid', tech: 'CSS3', score: 78 },
    { name: 'Recursividad', tech: 'Logic', score: 45 },
    { name: 'API Fetch', tech: 'Async', score: 65 },
    { name: 'Tipado', tech: 'TypeScript', score: 20 },
    { name: 'Hooks', tech: 'React/Vue', score: 88 },
];

const getStatusIndicatorColor = (score) => {
    if (score >= 90) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
    if (score >= 70) return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
    if (score >= 50) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
};

const getHeatmapStyle = (score) => {
    let color = 'rgba(244, 63, 94, 0.08)'; // Rose/Red default
    if (score >= 90) color = 'rgba(16, 185, 129, 0.08)'; // Emerald
    else if (score >= 70) color = 'rgba(59, 130, 246, 0.08)'; // Blue
    else if (score >= 50) color = 'rgba(245, 158, 11, 0.08)'; // Amber
    return { backgroundColor: color, borderColor: 'rgba(255, 255, 255, 0.7)' };
};
</script>

<style scoped>
/* Glassmorphism Reforzado para contraste en LudoScript */
.glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

.shadow-blue-soft {
    box-shadow: 0 10px 30px -5px rgba(59, 130, 246, 0.06),
        0 8px 15px -6px rgba(59, 130, 246, 0.04);
}

.shadow-blue-node {
    box-shadow: 0 4px 12px 0 rgba(59, 130, 246, 0.1);
}

.shadow-blue-glow {
    box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.18);
}

/* Sombra interior para los contenedores de iconos */
.shadow-inner {
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}
</style>