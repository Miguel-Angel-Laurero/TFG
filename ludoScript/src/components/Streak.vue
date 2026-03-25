<template>
  <div class="rounded-2xl bg-indigo-950 border border-white/10 p-8 w-96 flex flex-col items-center gap-6">

    <div class="flex flex-col items-center gap-2 text-center">
      <div class="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-4xl">🔥</div>
      <h2 class="font-righteous text-white text-2xl leading-tight">Recompensa diaria</h2>
      <p class="text-white/40 text-sm">Conexión diaria · {{ store.streak }} días de racha</p>
    </div>

    <div class="w-full h-px bg-white/8" />

    <div class="flex items-center justify-center gap-3 w-full">

      <div class="flex flex-col items-center gap-1 opacity-35 flex-1">
        <span class="text-[10px] uppercase tracking-widest text-white/60"> Día {{ store.previousReward.day }}</span>
        <span class="text-[22px] font-extrabold text-yellow-400 leading-none">
          {{ store.previousReward.reward }}
          <img 
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/memoryCoin.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbWVtb3J5Q29pbi5wbmciLCJpYXQiOjE3NzQzNjI5NjAsImV4cCI6MTgwNTg5ODk2MH0.2UYhJNH_6lZtHJoGTDAUlr-5cZAJIZZG9qAzFDFrUK8"
            alt="Moneda de RAM"
            class="w-8 h-8 object-contain" 
          >
        </span>
        <span class="mt-1 text-[9px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full">✓ Reclamada</span>
      </div>
      <div class="flex flex-col items-center gap-1 text-center" style="flex: 1.4">
        <span class="text-[11px] uppercase tracking-widest text-white/40">Día {{ store.rewardClaim?.day }} · hoy</span>
        <span class="text-4xl font-extrabold text-yellow-400 leading-none">
          {{ store.todayReward }}
          <img 
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/memoryCoin.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbWVtb3J5Q29pbi5wbmciLCJpYXQiOjE3NzQzNjI5NjAsImV4cCI6MTgwNTg5ODk2MH0.2UYhJNH_6lZtHJoGTDAUlr-5cZAJIZZG9qAzFDFrUK8"
            alt="Moneda de RAM"
            class="w-18 h-18 object-contain" 
          >
        </span>
      </div>

      <div class="w-px h-16 bg-white/8" />

      <div class="flex flex-col items-center gap-1 opacity-35 flex-1">
        <span class="text-[10px] uppercase tracking-widest text-white/60">Día {{ store.nextReward.day }}</span>
        <span class="text-[22px] font-extrabold text-yellow-400 leading-none">
          {{ store.nextReward.reward }}
          <img 
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/memoryCoin.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbWVtb3J5Q29pbi5wbmciLCJpYXQiOjE3NzQzNjI5NjAsImV4cCI6MTgwNTg5ODk2MH0.2UYhJNH_6lZtHJoGTDAUlr-5cZAJIZZG9qAzFDFrUK8"
            alt="Moneda de RAM"
            class="w-8 h-8 object-contain" 
          >
        </span>
        <span class="mt-1 text-[9px] bg-white/8 text-white/30 px-2 py-0.5 rounded-full">🔒 Mañana</span>
      </div>

    </div>

    <div class="w-full h-px bg-white/8" />

    <button
      class="w-full py-3 bg-yellow-400 text-black font-extrabold text-sm rounded-xl border-b-4 border-yellow-600 hover:bg-yellow-300 cursor-pointer active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="store.claimed"
      @click="handleClaim"
    >
      {{ store.claimed ? 'Ya reclamada' : 'Reclamar recompensa' }}
    </button>

    <p class="text-xs text-white/25 text-center">Vuelve mañana para continuar tu racha</p>

  </div>
</template>

<script setup>
import { useRewardsStore } from '@/stores/rewards.store'

const emit  = defineEmits(['claimed', 'close'])
const store = useRewardsStore()


async function handleClaim() {
  const day = store.rewardClaim?.day  
  const reward = store.todayReward        
  await store.claimReward()
  localStorage.setItem('dailyRewardLastClaimed', Date.now().toString())
  emit('claimed', { day, reward })
  emit('close')
}
</script>