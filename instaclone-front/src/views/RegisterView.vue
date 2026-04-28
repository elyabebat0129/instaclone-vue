<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import FormFieldError from '@/components/common/FormFieldError.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = ref({})

async function handleSubmit() {
  errors.value = {}

  try {
    await authStore.register(form)
    router.push({ name: ROUTE_NAMES.feed })
  } catch (incomingErrors) {
    errors.value = incomingErrors
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="h3 mb-2">Criar conta</h2>
      <p class="muted-copy mb-0">Crie seu perfil para publicar, seguir pessoas e montar seu feed.</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label class="form-label" for="name">Nome</label>
        <input id="name" v-model="form.name" type="text" class="form-control" />
        <FormFieldError :errors="errors.name" />
      </div>

      <div class="mb-3">
        <label class="form-label" for="username">Username</label>
        <input id="username" v-model="form.username" type="text" class="form-control" />
        <FormFieldError :errors="errors.username" />
      </div>

      <div class="mb-3">
        <label class="form-label" for="register-email">Email</label>
        <input
          id="register-email"
          v-model="form.email"
          type="email"
          class="form-control"
        />
        <FormFieldError :errors="errors.email" />
      </div>

      <div class="mb-3">
        <label class="form-label" for="register-password">Senha</label>
        <input
          id="register-password"
          v-model="form.password"
          type="password"
          class="form-control"
        />
        <FormFieldError :errors="errors.password" />
      </div>

      <div class="mb-3">
        <label class="form-label" for="password-confirmation">Confirmar senha</label>
        <input
          id="password-confirmation"
          v-model="form.password_confirmation"
          type="password"
          class="form-control"
        />
      </div>

      <FormFieldError :errors="errors.general" />

      <button type="submit" class="btn btn-brand w-100" :disabled="authStore.loading">
        {{ authStore.loading ? 'Criando conta...' : 'Criar conta' }}
      </button>
    </form>

    <p class="muted-copy mt-4 mb-0 text-center">
      Ja tem conta?
      <RouterLink :to="{ name: ROUTE_NAMES.login }" class="fw-semibold">Entrar</RouterLink>
    </p>
  </div>
</template>
