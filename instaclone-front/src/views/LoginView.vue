<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FormFieldError from '@/components/common/FormFieldError.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errors = ref({})

async function handleSubmit() {
  errors.value = {}

  try {
    await authStore.login(form)
    router.push(route.query.redirect || '/feed')
  } catch (incomingErrors) {
    errors.value = incomingErrors
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="h3 mb-2">Entrar</h2>
      <p class="muted-copy mb-0">
        Use o login do backend Laravel para acessar as rotas protegidas.
      </p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label class="form-label" for="email">Email</label>
        <input id="email" v-model="form.email" type="email" class="form-control" />
        <FormFieldError :errors="errors.email" />
      </div>

      <div class="mb-3">
        <label class="form-label" for="password">Senha</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-control"
        />
        <FormFieldError :errors="errors.password" />
      </div>

      <FormFieldError :errors="errors.general" />

      <button type="submit" class="btn btn-brand w-100" :disabled="authStore.loading">
        {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="muted-copy mt-4 mb-0 text-center">
      Ainda nao tem conta?
      <RouterLink to="/cadastro" class="fw-semibold">Criar cadastro</RouterLink>
    </p>
  </div>
</template>
