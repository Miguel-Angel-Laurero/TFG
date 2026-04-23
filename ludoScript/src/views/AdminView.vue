<template>
    <div class="min-h-screen bg-slate-900/20 text-white flex flex-col font-sans">
        <Header />
        <main class="flex-1 p-6 max-w-6xl mx-auto w-full ">
            <div class="px-5 py-5 rounded-lg text-2xl font-bold font-righteous mb-6 text-center bg-indigo-900/40">
                Panel de Administración
            </div>

            <!-- Tabs -->
            <div class="flex gap-2 mb-6">
                <button
                    v-for="tab in tabs" :key="tab.id"
                    @click="activeTab = tab.id"
                    class="px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                    :class="activeTab === tab.id
                        ? 'bg-indigo-900 text-white  hover:bg-indigo-700 shadow'
                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'"
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- Contenido activo -->
            <component :is="activeComponent" />
        </main>
        <Footer/>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Header from '@/components/shared/Header.vue'
import UsersTab from '@/components/admin/UsersTab.vue'
import ItemsTab from '@/components/admin/ItemsTab.vue'
import Footer from '@/components/shared/Footer.vue'

const tabs = [
    { id: 'users', label: 'Usuarios', component: UsersTab },
    { id: 'items', label: 'Objetos',    component: ItemsTab },
]

const activeTab = ref('users')
const activeComponent = computed(() => tabs.find(t => t.id === activeTab.value)?.component)
</script>