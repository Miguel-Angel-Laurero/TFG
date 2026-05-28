<template>
  <div class="min-h-[80vh] w-full mx-auto flex items-center justify-center px-4 py-8">
    <div
      class="w-full max-w-[600px] bg-blue-900/60 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-3xl shadow-2xl"
    >
      <div class="text-center mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-50 font-righteous">
          Crea tu cuenta
        </h1>
        <p class="text-gray-400 text-sm mt-2">
          Únete a la aventura de aprender a programar
        </p>
      </div>

      <form
        class="flex flex-col gap-5"
        @submit.prevent="handleRegister"
      >
        <div class="flex flex-col gap-1.5">
          <label
            for="email"
            class="text-xs md:text-sm font-medium text-gray-200 ml-1"
          >Correo electrónico</label>
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
          <label
            for="username"
            class="text-xs md:text-sm font-medium text-gray-200 ml-1"
          >Nombre de usuario</label>
          <InputText
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Tu apodo"
            class="w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label
              for="pass"
              class="text-xs md:text-sm font-medium text-gray-200 ml-1"
            >Contraseña</label>
            <Password
              id="pass"
              v-model="form.password"
              toggle-mask
              placeholder="••••••••"
              class="w-full"
              :pt="{
                input: { class: 'w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400' }
              }"
              :class="{ 'p-invalid': auth.error }"
              required
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="confirmPass"
              class="text-xs md:text-sm font-medium text-gray-200 ml-1"
            >Confirmar</label>
            <Password
              id="confirmPass"
              v-model="form.confirmPassword"
              :feedback="false"
              toggle-mask
              placeholder="••••••••"
              class="w-full"
              :pt="{
                input: { class: 'w-full p-3 !bg-white/5 !border-white/20 !text-white focus:!border-yellow-400' }
              }"
              :class="{ 'p-invalid': passwordMismatch }"
              required
            />
          </div>
        </div>

        <small
          v-if="usernameTooShort"
          class="text-red-400 ml-1 -mt-2 animate-pulse text-xs"
        >
          El nombre de usuario debe tener al menos 3 caracteres
        </small>
        <small
          v-if="passwordTooShort"
          class="text-red-400 ml-1 -mt-2 animate-pulse text-xs"
        >
          La contraseña debe tener al menos 8 caracteres
        </small>
        <small
          v-if="passwordMismatch"
          class="text-red-400 ml-1 -mt-2 animate-pulse text-xs"
        >
          Las contraseñas no coinciden
        </small>

        <transition name="p-message-toggle">
          <Message
            v-if="auth.error"
            severity="error"
            variant="simple"
            size="small"
          >
            {{ auth.error }}
          </Message>
        </transition>

        <Button
          type="submit"
          label="Registrarse"
          icon="pi pi-user-plus"
          :loading="auth.loading"
          :disabled="passwordMismatch || passwordTooShort || usernameTooShort"
          class="w-full py-4 mt-2 !font-bold !text-black !bg-yellow-400 !border-b-4 !border-l-4 !border-yellow-600 hover:!bg-yellow-300 active:scale-[0.98] active:border-b-0 active:border-l-0 transition-all shadow-xl"
        />

        <p class="text-center text-gray-400 text-sm mt-2">
          ¿Ya tienes cuenta?
          <router-link
            to="/login-view/"
            class="text-yellow-400 font-bold hover:underline ml-1"
          >
            Inicia
            sesión
          </router-link>
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

const passwordTooShort = computed(() => {
  return form.password !== '' && form.password.length < 8
})

const usernameTooShort = computed(() => {
  return form.username !== '' && form.username.length < 3
})

function handleRegister() {
  if (passwordMismatch.value || passwordTooShort.value || usernameTooShort.value) return
  auth.register({ username: form.username, email: form.email, password: form.password })
}
</script>