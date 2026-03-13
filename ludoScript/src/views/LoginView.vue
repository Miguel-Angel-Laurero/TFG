<template>
  <div class="min-h-screen flex flex-col bg-brand-dark">
    <header>
      <Header />
    </header>

    <main class="flex-grow flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-brand-surface shadow-xl rounded-2xl border border-brand-primary/30 overflow-hidden">
        
        <div class="p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-brand-primary">Bienvenido de nuevo</h1>
            <p class="text-brand-muted text-sm">Ingresa tus credenciales para acceder</p>
          </div>

          <form @submit.prevent="submit" class="flex flex-col gap-5">
            
            <div class="flex flex-col gap-2">
              <label for="username" class="text-sm font-medium text-brand-muted">Nombre de usuario</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-user z-10" />
                <InputText 
                  id="username" 
                  v-model="form.username" 
                  type="text" 
                  placeholder="Usuario"
                  class="w-full"
                  :class="{ 'p-invalid': auth.error }"
                  required 
                />
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <label for="pass" class="text-sm font-medium text-brand-muted">Contraseña</label>
              <Password 
                id="pass" 
                v-model="form.password" 
                :feedback="false" 
                toggleMask 
                placeholder="••••••••"
                class="w-full"
                input-class="w-full p-3"
                :class="{ 'p-invalid': auth.error }"
                required
              />
            </div>
            <transition name="p-message-toggle">
              <Message v-if="auth.error" severity="error" variant="simple" size="small">
                {{ auth.error }}
              </Message>
            </transition>
            <Button 
              type="submit" 
              label="Iniciar sesión" 
              icon="pi pi-sign-in" 
              :loading="auth.loading" 
              class="w-full py-3 mt-2 font-bold shadow-md hover:shadow-lg transition-all"
            />
          </form>
        </div>
      </div>
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
// Componentes de PrimeVue
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const form = reactive({ 
  username: '', 
  password: '' 
})

function submit() {
  auth.login(form)
}
</script>

<style scoped>
/* Ajuste para que el componente Password de PrimeVue ocupe todo el ancho */
:deep(.p-password input) {
  width: 100%;
}
</style>