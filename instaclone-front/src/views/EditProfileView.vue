<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import FormFieldError from '@/components/common/FormFieldError.vue'
import { extractErrorMessage } from '@/services/formatters'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useFeedStore } from '@/stores/feed'

const authStore = useAuthStore()
const feedStore = useFeedStore()

const profileForm = reactive({
  name: '',
  username: '',
  bio: '',
})

const avatarPreview = ref('')
const avatarFile = ref(null)
const profileErrors = ref({})
const avatarErrors = ref({})
const profileLoading = ref(false)
const avatarLoading = ref(false)
const profileMessage = ref('')
const avatarMessage = ref('')

function syncFormFromUser() {
  // Mantemos o formulario alinhado com o usuario salvo na store.
  profileForm.name = authStore.user?.name || ''
  profileForm.username = authStore.user?.username || ''
  profileForm.bio = authStore.user?.bio || ''
  avatarPreview.value = authStore.user?.avatar_url || ''
}

function handleAvatarChange(event) {
  avatarErrors.value = {}
  avatarMessage.value = ''
  cleanupPreview()
  const file = event.target.files?.[0]

  if (!file) {
    avatarFile.value = null
    return
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!validTypes.includes(file.type)) {
    avatarErrors.value = { avatar: ['Envie uma imagem JPG, JPEG, PNG ou WEBP.'] }
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    avatarErrors.value = { avatar: ['O avatar deve ter no maximo 2 MB.'] }
    return
  }

  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

function cleanupPreview() {
  if (avatarFile.value && avatarPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }
}

async function saveProfile() {
  profileErrors.value = {}
  profileMessage.value = ''
  profileLoading.value = true

  try {
    const { data } = await api.put('/users/me', {
      name: profileForm.name,
      username: profileForm.username,
      bio: profileForm.bio,
    })

    authStore.syncUser(data)
    feedStore.syncUserInPosts(data)
    syncFormFromUser()
    profileMessage.value = 'Perfil atualizado com sucesso.'
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      profileErrors.value = error.response.data.errors
    } else {
      profileErrors.value = { general: [extractErrorMessage(error, 'Nao foi possivel salvar o perfil.')] }
    }
  } finally {
    profileLoading.value = false
  }
}

async function uploadAvatar() {
  avatarErrors.value = {}
  avatarMessage.value = ''

  if (!avatarFile.value) {
    avatarErrors.value = { avatar: ['Selecione uma imagem antes de enviar.'] }
    return
  }

  avatarLoading.value = true

  try {
    const payload = new FormData()
    payload.append('avatar', avatarFile.value)

    const { data } = await api.post('/users/me/avatar', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    authStore.syncUser(data)
    feedStore.syncUserInPosts(data)
    avatarFile.value = null
    syncFormFromUser()
    avatarMessage.value = 'Avatar atualizado com sucesso.'
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      avatarErrors.value = error.response.data.errors
    } else {
      avatarErrors.value = { avatar: [extractErrorMessage(error, 'Nao foi possivel atualizar o avatar.')] }
    }
  } finally {
    avatarLoading.value = false
  }
}

onMounted(() => {
  syncFormFromUser()
})

onBeforeUnmount(() => {
  cleanupPreview()
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>Editar Perfil</h1>
        <p>Atualize suas informacoes e personalize a foto do seu perfil.</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-4">
        <div class="surface-card h-100 d-flex flex-column gap-3">
          <h2 class="h4 mb-0">Avatar</h2>
          <img
            :src="avatarPreview || 'https://placehold.co/240x240/f4ddcf/2d241a?text=%40'"
            alt="Avatar atual"
            class="post-card__image"
          />
          <input
            type="file"
            class="form-control"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            @change="handleAvatarChange"
          />
          <FormFieldError :errors="avatarErrors.avatar" />
          <div v-if="avatarMessage" class="small text-success">{{ avatarMessage }}</div>
          <button type="button" class="btn btn-brand" :disabled="avatarLoading" @click="uploadAvatar">
            {{ avatarLoading ? 'Enviando...' : 'Salvar avatar' }}
          </button>
        </div>
      </div>

      <div class="col-lg-8">
        <form class="surface-card d-flex flex-column gap-3" @submit.prevent="saveProfile">
          <h2 class="h4 mb-0">Informacoes</h2>

          <div>
            <label class="form-label" for="profile-name">Nome</label>
            <input id="profile-name" v-model="profileForm.name" type="text" class="form-control" maxlength="255" />
            <FormFieldError :errors="profileErrors.name" />
          </div>

          <div>
            <label class="form-label" for="profile-username">Username</label>
            <input
              id="profile-username"
              v-model="profileForm.username"
              type="text"
              class="form-control"
              maxlength="30"
            />
            <FormFieldError :errors="profileErrors.username" />
          </div>

          <div>
            <label class="form-label" for="profile-bio">Bio</label>
            <textarea
              id="profile-bio"
              v-model="profileForm.bio"
              rows="5"
              maxlength="500"
              class="form-control"
            ></textarea>
            <div class="small muted-copy mt-2">{{ profileForm.bio.length }} / 500</div>
            <FormFieldError :errors="profileErrors.bio" />
          </div>

          <FormFieldError :errors="profileErrors.general" />
          <div v-if="profileMessage" class="small text-success">{{ profileMessage }}</div>

          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-brand" :disabled="profileLoading">
              {{ profileLoading ? 'Salvando...' : 'Salvar perfil' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
