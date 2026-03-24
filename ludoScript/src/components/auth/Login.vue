<template>
 <div class="p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-50 font-righteous">Bienvenido de nuevo</h1>
            <p class="text-gray-50 text-sm">Ingresa tus credenciales para acceder</p>
          </div>

          <form @submit.prevent="submit" class="flex flex-col gap-5">
            
            <div class="flex flex-col gap-2">
              <label for="email" class="text-sm font-medium text-gray-50">Correo electrónico <i class="pi pi-envelope z-10"></i></label>
              <span class="p-input-icon-left w-full">
                <InputText 
                  id="email" 
                  v-model="form.email" 
                  type="email" 
                  placeholder="correo@ejemplo.com"
                  class="w-full"
                  :class="{ 'p-invalid': auth.error }"
                  required 
                />
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <label for="pass" class="text-sm font-medium text-gray-50">Contraseña</label>
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
              class="!bg-yellow-400 !text-black px-8 py-3 !border-b-3 !border-l-3 !border-yellow-600 !font-bold hover:bg-yellow-300 transition-colors text-center"
            />
          </form>
          <p class="text-center text-gray-50 text-sm mt-4">
            ¿No tienes cuenta todavía?
            <router-link to="/register-view/" class="font-bold underline">Crear Cuenta</router-link>
          </p>
        </div>
</template>
<script setup>
  // Componentes de PrimeVue
  import InputText from 'primevue/inputtext'
  import Password from 'primevue/password'
  import Button from 'primevue/button'
  import Message from 'primevue/message'
    
  import { useAuthStore } from '@/stores/auth.store'
  import { reactive } from 'vue'

    function submit() {
      auth.login(form)
      console.log("se ha iniciado sesion con exito")
    }

    const auth = useAuthStore()
    const form = reactive({ 
    email: '', 
    password: '' 
    })
</script>