<template>
  <div class="min-h-[90vh] flex items-center justify-center px-4 py-10">
    
    <div class="w-full max-w-lg bg-indigo-950/30 backdrop-blur-md border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl">
      
      <div class="text-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-50 font-righteous">Crea tu cuenta</h1>
        <p class="text-gray-400 text-sm mt-2">Únete a la aventura de aprender a programar</p>
      </div>

      <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
        
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-xs md:text-sm font-medium text-gray-200 ml-1">Correo electrónico</label>
          <InputText 
            id="email" 
            v-model="form.email" 
            type="email" 
            placeholder="ejemplo@correo.com"
            class="w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400 transition-all"
            :class="{ 'p-invalid': auth.error }"
            required 
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="username" class="text-xs md:text-sm font-medium text-gray-200 ml-1">Nombre de usuario</label>
          <InputText 
            id="username" 
            v-model="form.username" 
            type="text" 
            placeholder="Tu apodo"
            class="w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400"
            required 
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="pass" class="text-xs md:text-sm font-medium text-gray-200 ml-1">Contraseña</label>
            <Password 
              id="pass" 
              v-model="form.password" 
              toggleMask 
              placeholder="••••••••"
              class="w-full"
              input-class="w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400"
              :class="{ 'p-invalid': auth.error }"
              required
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="confirmPass" class="text-xs md:text-sm font-medium text-gray-200 ml-1">Confirmar</label>
            <Password 
              id="confirmPass" 
              v-model="form.confirmPassword" 
              :feedback="false"
              toggleMask 
              placeholder="••••••••"
              class="w-full"
              input-class="w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400"
              :class="{ 'p-invalid': passwordMismatch }"
              required
            />
          </div>
        </div>
        <small v-if="passwordMismatch" class="text-red-400 ml-1 -mt-2 animate-pulse">Las contraseñas no coinciden</small>

        <transition name="p-message-toggle">
          <Message v-if="auth.error" severity="error" variant="simple" size="small">
            {{ auth.error }}
          </Message>
        </transition>

        <Button 
          type="submit" 
          label="Registrarse" 
          icon="pi pi-user-plus" 
          :loading="auth.loading" 
          :disabled="passwordMismatch"
          class="w-full py-3.5 mt-4 !font-bold !text-black !bg-yellow-400 !border-b-4 !border-l-4 !border-yellow-600 hover:!bg-yellow-300 active:scale-[0.98] transition-all shadow-xl"  
        />

        <p class="text-center text-gray-400 text-sm mt-4">
          ¿Ya tienes cuenta? 
          <router-link to="/login-view/" class="text-yellow-400 font-bold hover:underline ml-1">Inicia sesión</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const form = reactive({ 
  email: '',
  username: '', 
  password: '',
  confirmPassword: ''
})

const passwordMismatch = computed(() => {
  return form.confirmPassword !== '' && form.password !== form.confirmPassword
})

function handleRegister() {
  if (passwordMismatch.value) return
  auth.register(form)
}
</script>