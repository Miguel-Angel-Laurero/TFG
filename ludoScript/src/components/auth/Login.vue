<template>
  <div class="min-h-[80vh] max-w-[600] flex items-center justify-center px-4">
    
    <div class="w-full max-w-lg bg-blue-900/60 backdrop-blur-sm border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl">
      
      <div class="text-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-50 font-righteous">Bienvenido de nuevo</h1>
        <p class="text-gray-400 text-sm mt-2">Ingresa tus credenciales para acceder</p>
      </div>

      <form @submit.prevent="submit" class="flex flex-col gap-5">
        
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-medium text-gray-200 ml-1">
            Correo electrónico <i class="pi pi-envelope text-[10px] ml-1 opacity-70"></i>
          </label>
          <InputText 
            id="email" 
            v-model="form.email" 
            type="email" 
            placeholder="correo@ejemplo.com"
            class="w-full p-3 !bg-white/5 !border-white/20 !text-white placeholder:text-gray-500 focus:!border-yellow-400"
            :class="{ 'p-invalid': auth.error }"
            required 
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="pass" class="text-sm font-medium text-gray-200 ml-1">Contraseña</label>
          <Password 
            id="pass" 
            v-model="form.password" 
            :feedback="false" 
            toggleMask 
            placeholder="••••••••"
            class="w-full"
            input-class="w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400"
            :class="{ 'p-invalid': auth.error }"
            required
          />
        </div>

        <transition name="p-message-toggle">
          <Message v-if="auth.error" severity="error" variant="simple" size="small" class="mt-2">
            {{ auth.error }}
          </Message>
        </transition>

        <Button 
          type="submit" 
          label="Iniciar sesión" 
          icon="pi pi-sign-in" 
          :loading="auth.loading" 
          class="!bg-yellow-400 !text-black py-3 !border-b-4 !border-l-4 !border-yellow-600 !font-bold hover:bg-yellow-300 active:scale-95 transition-all text-center mt-2"
        />
      </form>

      <p class="text-center text-gray-400 text-sm mt-8">
        ¿No tienes cuenta todavía?
        <router-link to="/register-view/" class="text-yellow-400 font-bold hover:underline ml-1">Crear Cuenta</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/auth.store'
import { reactive } from 'vue'

const auth = useAuthStore()
const form = reactive({ 
  email: '', 
  password: '' 
})

function submit() {
  auth.login(form)
}
</script>