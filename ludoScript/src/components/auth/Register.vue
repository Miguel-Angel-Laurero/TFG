<template>
  <div class="p-8">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-50 font-righteous">Crea tu cuenta</h1>
    </div>

    <form @submit.prevent="handleRegister" class="flex flex-col gap-5">
      
      <div class="flex flex-col gap-2">
        <label for="email" class="text-sm font-medium text-gray-50">Correo electrónico</label>
        <InputText 
          id="email" 
          v-model="form.email" 
          type="email" 
          placeholder="ejemplo@correo.com"
          class="w-full"
          :class="{ 'p-invalid': auth.error }"
          required 
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="username" class="text-sm font-medium text-gray-50">Nombre de usuario</label>
        <InputText 
          id="username" 
          v-model="form.username" 
          type="text" 
          placeholder="Tu apodo"
          class="w-full"
          required 
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="pass" class="text-sm font-medium text-gray-50">Contraseña</label>
        <Password 
          id="pass" 
          v-model="form.password" 
          toggleMask 
          placeholder="••••••••"
          class="w-full"
          input-class="w-full p-3"
          :class="{ 'p-invalid': auth.error }"
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="confirmPass" class="text-sm font-medium text-gray-50">Confirmar Contraseña</label>
        <Password 
          id="confirmPass" 
          v-model="form.confirmPassword" 
          :feedback="false"
          toggleMask 
          placeholder="••••••••"
          class="w-full"
          input-class="w-full p-3"
          :class="{ 'p-invalid': passwordMismatch }"
          required
        />
        <small v-if="passwordMismatch" class="text-red-400">Las contraseñas no coinciden</small>
      </div>

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
        class="w-full py-3 mt-2 font-bold !text-black hover:shadow-lg transition-all !bg-yellow-400 !border-yellow-600"  
      />

      <p class="text-center text-gray-50 text-sm mt-4">
        ¿Ya tienes cuenta? 
        <router-link to="/login-view/" class="font-bold underline">Inicia sesión</router-link>
      </p>
    </form>
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

// Validación simple de coincidencia de contraseñas
const passwordMismatch = computed(() => {
  return form.confirmPassword !== '' && form.password !== form.confirmPassword
})

function handleRegister() {
  if (passwordMismatch.value) return
  
  // Llamamos a la función de registro de tu store
  auth.register(form)
}
</script>