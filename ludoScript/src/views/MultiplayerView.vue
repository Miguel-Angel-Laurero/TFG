<template>
    <div class="min-h-screen flex flex-col bg-gray-900">
        <header>
            <Header />
        </header>

        <main class="flex-grow flex flex-col items-center justify-center px-4 py-8">
            <!-- Error global -->
            <transition name="fade">
                <div v-if="mp.error"
                    class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm text-center">
                    {{ mp.error }}
                    <button @click="mp.error = null" class="ml-3 underline opacity-70 hover:opacity-100">OK</button>
                </div>
            </transition>

            <!-- ── idle: selección crear vs unirse ── -->
            <template v-if="mp.status === 'idle'">
                <template v-if="!subView">
                    <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
                        <div class="flex justify-center">
                            <img :src="IMAGES.multi" alt="multijugador" class="max-w-[240px] w-full md:max-w-full">
                        </div>
                        <div class="flex flex-col items-center gap-8 max-w-md w-full mx-auto">
                            <div class="text-center ">
                                <h1 class="text-white text-4xl font-black mb-2 font-righteous">Multijugador</h1>
                                <p class="text-white/60">Juega contra tus amigos en tiempo real</p>
                            </div>
                            <div class="flex flex-col gap-4 w-full">
                                <button @click="subView = 'create'"
                                    class="w-full bg-yellow-400 text-gray-900 font-bold py-4 rounded-2xl text-lg font-righteous cursor-pointer hover:bg-yellow-300 transition-all">
                                    🏠 Crear sala
                                </button>
                                <button @click="subView = 'join'"
                                    class="w-full bg-white/10 border border-white/20 text-white font-bold py-4 rounded-2xl text-lg font-righteous cursor-pointer hover:bg-white/20 transition-all">
                                    🚪 Unirse con código
                                </button>
                                <button @click="router.push('/')"
                                    class="text-white/40 font-righteous cursor-pointer hover:text-white/60 text-sm text-center mt-2 transition-colors">
                                    ← Volver al inicio
                                </button>
                            </div>
                        </div>
                    </div>
                </template>

                <RoomCreate v-else-if="subView === 'create'" @cancel="subView = null" />
                <RoomJoin v-else-if="subView === 'join'" @cancel="subView = null" />
            </template>

            <!-- ── lobby ── -->
            <MultiplayerLobby v-else-if="mp.status === 'lobby'" />

            <!-- ── jugando ── -->
            <template v-else-if="mp.status === 'playing'">
                <MultiplayerGame v-if="mp.currentQuestion" />
                <Loading v-else/>
            </template>

            <!-- ── finished ── -->
            <MultiplayerResults v-else-if="mp.status === 'finished'" />

            <!-- ── sala cerrada por el host ── -->
            <div v-else-if="mp.status === 'closed'" class="flex flex-col items-center gap-4 text-center">
                <p class="text-red-300 text-xl font-bold">La sala ha sido cerrada</p>
                <p class="text-white/50 text-sm">{{ mp.error }}</p>
                <button @click="handleReset"
                    class="bg-white text-gray-900 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-all">
                    Volver
                </button>
            </div>
        </main>

        <footer>
            <Footer />
        </footer>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMultiplayerStore } from '@/stores/multiplayer.store'

import Header from '@/components/shared/Header.vue'
import Footer from '@/components/shared/Footer.vue'
import RoomCreate from '@/components/multiplayer/RoomCreate.vue'
import RoomJoin from '@/components/multiplayer/RoomJoin.vue'
import MultiplayerLobby from '@/components/multiplayer/MultiplayerLobby.vue'
import MultiplayerGame from '@/components/multiplayer/MultiplayerGame.vue'
import MultiplayerResults from '@/components/multiplayer/MultiplayerResults.vue'
import Loading from '@/components/shared/Loading.vue'
import { IMAGES } from '@/utils/imgBucketStorage'

const router = useRouter()
const mp = useMultiplayerStore()
const subView = ref(null) // null | 'create' | 'join'

// Cuando la sala se crea/une, salimos del subVista automáticamente
watch(() => mp.status, (newStatus) => {
    if (newStatus !== 'idle') subView.value = null
})

function handleReset() {
    mp.resetState()
    subView.value = null
    router.push('/')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
