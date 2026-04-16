<template>
    <Header/>
    <div class="w-full min-h-screen p-2 md:p-4 bg-blue-950/20">
        <!-- Volver al inicio -->
        <!-- <div class="max-w-4xl mx-auto mb-3">
            <button @click="router.push('/')"
                class="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                <i class="pi pi-arrow-left text-xs"></i> Volver al inicio
            </button>
        </div> -->

        <!-- H1: loader mientras se carga la clase -->
        <div v-if="store.loading && !store.group" class="flex justify-center items-center h-64">
            <div class="text-slate-400 text-sm animate-pulse">Cargando clase…</div>
        </div>

        <!-- H9: error global con texto humano -->
        <div v-else-if="store.error && !store.group && !store.loading"
            class="max-w-lg mx-auto mt-12 bg-red-900/30 border border-red-500/30 rounded-xl p-5 text-center">
            <p class="text-red-300 font-semibold">{{ store.error }}</p>
            <button @click="store.clearError(); store.fetchMyGroup()" class="mt-3 text-xs text-slate-400 underline">
                Reintentar
            </button>
        </div>

        <!-- Sin clase: panel de unirse / crear -->
        <NoClasePanel v-else-if="!store.isMember" :loading="store.loading" :error="store.error" @join="handleJoin"
            @create="handleCreate" />

        <!-- Con clase -->
        <div v-else class="flex flex-col gap-4 max-w-4xl mx-auto">

            <!-- Header de la clase -->
            <ClaseHeader :group="store.group" :member-count="store.memberCount" :is-owner="store.isOwner"
                @openTransfer="transferModal = true" @openDissolve="dissolveModal = true"
                @openLeave="leaveModal = true" />

            <!-- H1: error localizado en la zona de stats -->
            <div v-if="store.error"
                class="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <p class="text-red-300 text-sm">{{ store.error }}</p>
                <button @click="store.clearError()"
                    class="text-slate-400 hover:text-white text-lg leading-none">&times;</button>
            </div>

            <!-- Ranking / Stats -->
            <div class="bg-indigo-900/20 rounded-3xl p-2 border border-white/5">
                <div class="flex items-center justify-between px-2 pt-1 pb-3">
                    <h3 class="text-white font-semibold text-lg">Ranking de la clase</h3>
                    <button @click="store.fetchStats()" :disabled="store.loading"
                        class="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors">
                        🔄 Actualizar
                    </button>
                </div>

                <!-- H1: skeleton durante carga de stats -->
                <div v-if="store.loadingStats" class="flex flex-col gap-2 px-2">
                    <div v-for="i in 3" :key="i" class="h-16 bg-slate-700/40 rounded-xl animate-pulse"></div>
                </div>

                <ClaseStatsTable v-else :stats="store.stats" :owner-id="store.group.ownerId"
                    :current-user-id="auth.user?.id" :is-owner="store.isOwner" @kick="openKick"
                    @transfer="openTransfer" />
            </div>
        </div>

        <!-- ── Modales de confirmación ─────────────────────────────────────────── -->

        <!-- H5: modal de salir -->
        <ConfirmModal v-if="leaveModal" title="¿Salir de la clase?"
            message="Podrás unirte a otra clase o crear una nueva después." confirm-label="Salir"
            confirm-class="bg-slate-600 hover:bg-slate-500" :loading="store.loading" @confirm="handleLeave"
            @cancel="leaveModal = false" />

        <!-- H5: modal disolver -->
        <ConfirmModal v-if="dissolveModal" title="¿Disolver la clase?"
            :message="`Esto eliminará '${store.group?.name}' y expulsará a todos los ${store.memberCount} miembros. Esta acción es irreversible.`"
            confirm-label="Disolver" confirm-class="bg-red-600 hover:bg-red-500" :loading="store.loading"
            @confirm="handleDissolve" @cancel="dissolveModal = false" />

        <!-- Transferir liderazgo: selector de miembro -->
        <TransferModal v-if="transferModal" :members="store.stats.filter(m => m.userId !== auth.user?.id)"
            :loading="store.loading" @confirm="handleTransfer" @cancel="transferModal = false" />

        <!-- Expulsar miembro -->
        <ConfirmModal v-if="kickTarget" title="¿Expulsar miembro?"
            :message="`¿Seguro que quieres expulsar a '${kickTarget.username}' de la clase?`" confirm-label="Expulsar"
            confirm-class="bg-red-600 hover:bg-red-500" :loading="store.loading" @confirm="handleKick"
            @cancel="kickTarget = null" />

    </div>
    <Footer/>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import { useRouter } from 'vue-router';
import { useGroupStore } from '@/stores/group.store';
import { useAuthStore } from '@/stores/auth.store';

// const router = useRouter();

import ClaseHeader from '@/components/clase/ClaseHeader.vue';
import ClaseStatsTable from '@/components/clase/ClaseStatsTable.vue';
import NoClasePanel from '@/components/clase/NoClasePanel.vue';
import ConfirmModal from '@/components/clase/ConfirmModal.vue';
import TransferModal from '@/components/clase/TransferModal.vue';
import Header from '@/components/shared/Header.vue';
import Footer from '@/components/shared/Footer.vue';

const store = useGroupStore();
const auth = useAuthStore();

const leaveModal = ref(false);
const dissolveModal = ref(false);
const transferModal = ref(false);
const kickTarget = ref(null); // { userId, username }

onMounted(async () => {
    await store.fetchMyGroup();
    if (store.isMember) await store.fetchStats();
});

async function handleJoin(inviteCode) {
    const ok = await store.joinGroup(inviteCode);
    if (ok) await store.fetchStats();
}

async function handleCreate({ name, description }) {
    const ok = await store.createGroup(name, description);
    if (ok) await store.fetchStats();
}

async function handleLeave() {
    await store.leaveGroup();
    leaveModal.value = false;
}

async function handleDissolve() {
    await store.dissolveGroup();
    dissolveModal.value = false;
}

async function handleTransfer(newOwnerId) {
    const ok = await store.transferLeadership(newOwnerId);
    if (ok) {
        transferModal.value = false;
        await store.fetchStats();
    }
}

function openKick(userId) {
    const member = store.stats.find(m => m.userId === userId);
    kickTarget.value = member ?? { userId, username: 'este miembro' };
}

function openTransfer(userId) {
    // Si se abre desde la card, pre-abre el modal de transferir con ese usuario
    transferModal.value = true;
}

async function handleKick() {
    if (!kickTarget.value) return;
    await store.kickMember(kickTarget.value.userId);
    kickTarget.value = null;
    await store.fetchStats();
}
</script>
