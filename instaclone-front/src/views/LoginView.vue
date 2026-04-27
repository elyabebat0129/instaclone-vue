<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FormFieldError from '@/components/common/FormFieldError.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
// route le a URL atual; router faz a navegacao depois do login.
const route = useRoute()
const router = useRouter()

// reactive e usado aqui porque o formulario tem mais de um campo relacionado.
const form = reactive({
  email: '',
  password: '',
})

// errors fica separado do form para guardar mensagens vindas da API.
const errors = ref({})

async function handleSubmit() {
  // Limpa erros antigos antes de uma nova tentativa.
  errors.value = {}

  try {
    // Depois do login, respeitamos o redirect salvo pelo guard.
    await authStore.login(form)
    router.push(route.query.redirect || { name: ROUTE_NAMES.feed })
  } catch (incomingErrors) {
    // A store ja devolve os erros em formato que o template consegue exibir.
    errors.value = incomingErrors
  }
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="h3 mb-2">Entrar</h2>
      <p class="muted-copy mb-0">Acesse sua conta para ver o feed e interagir com os posts.</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- v-model liga o input ao objeto form de forma reativa. -->
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

      <!-- O loading vem da store para impedir envio duplicado durante a requisicao. -->
      <button type="submit" class="btn btn-brand w-100" :disabled="authStore.loading">
        {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="muted-copy mt-4 mb-0 text-center">
      Ainda nao tem conta?
      <RouterLink :to="{ name: ROUTE_NAMES.register }" class="fw-semibold">Criar cadastro</RouterLink>
    </p>
  </div>
</template>
