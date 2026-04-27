<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload'
import FormFieldError from '@/components/common/FormFieldError.vue'
import { extractErrorMessage } from '@/services/api'
import { updateMyProfile, uploadMyAvatar } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth'
import { useFeedStore } from '@/stores/feed'
import {
  PROFILE_AVATAR_MAX_MB,
  PROFILE_BIO_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_USERNAME_MAX_LENGTH,
} from '@/stores/profileUtils'

const authStore = useAuthStore()
const feedStore = useFeedStore()

const profileForm = reactive({
  name: '',
  username: '',
  bio: '',
})

const profileErrors = ref({})
const avatarErrors = ref({})
const profileLoading = ref(false)
const avatarLoading = ref(false)
const profileMessage = ref('')
const avatarMessage = ref('')
const avatarTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const avatarUpload = useImageUpload({
  validTypes: avatarTypes,
  maxSizeInMb: PROFILE_AVATAR_MAX_MB,
})
const usernamePattern = /^[A-Za-z0-9._]+$/

function syncFormFromUser() {
  profileForm.name = authStore.user?.name || ''
  profileForm.username = authStore.user?.username || ''
  profileForm.bio = authStore.user?.bio || ''
  avatarUpload.previewUrl.value = authStore.user?.avatar_url || ''
}

function handleAvatarChange(event) {
  avatarErrors.value = {}
  avatarMessage.value = ''
  const validation = avatarUpload.handleFileChange(event)

  if (!validation.valid) {
    avatarErrors.value = { avatar: validation.errors }
  }
}

async function saveProfile() {
  profileErrors.value = {}
  profileMessage.value = ''

  if (profileForm.name.length > PROFILE_NAME_MAX_LENGTH) {
    profileErrors.value = { name: [`O nome deve ter no maximo ${PROFILE_NAME_MAX_LENGTH} caracteres.`] }
    return
  }

  if (profileForm.username.length > PROFILE_USERNAME_MAX_LENGTH) {
    profileErrors.value = { username: [`O username deve ter no maximo ${PROFILE_USERNAME_MAX_LENGTH} caracteres.`] }
    return
  }

  if (profileForm.username && !usernamePattern.test(profileForm.username)) {
    profileErrors.value = { username: ['Use apenas letras, numeros, ponto e underscore no username.'] }
    return
  }

  if (profileForm.bio.length > PROFILE_BIO_MAX_LENGTH) {
    profileErrors.value = { bio: [`A bio deve ter no maximo ${PROFILE_BIO_MAX_LENGTH} caracteres.`] }
    return
  }

  profileLoading.value = true

  try {
    const data = await updateMyProfile({
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

async function saveAvatar() {
  avatarErrors.value = {}
  avatarMessage.value = ''

  if (!avatarUpload.file.value) {
    avatarErrors.value = { avatar: ['Selecione uma imagem antes de enviar.'] }
    return
  }

  avatarLoading.value = true

  try {
    const payload = new FormData()
    payload.append('avatar', avatarUpload.file.value)

    const data = await uploadMyAvatar(payload)

    authStore.syncUser(data)
    feedStore.syncUserInPosts(data)
    avatarUpload.file.value = null
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
            :src="avatarUpload.previewUrl.value || 'https://placehold.co/240x240/f4ddcf/2d241a?text=%40'"
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
          <button type="button" class="btn btn-brand" :disabled="avatarLoading" @click="saveAvatar">
            {{ avatarLoading ? 'Enviando...' : 'Salvar avatar' }}
          </button>
        </div>
      </div>

      <div class="col-lg-8">
        <form class="surface-card d-flex flex-column gap-3" @submit.prevent="saveProfile">
          <h2 class="h4 mb-0">Informacoes</h2>

          <div>
            <label class="form-label" for="profile-name">Nome</label>
            <input
              id="profile-name"
              v-model="profileForm.name"
              type="text"
              class="form-control"
              :maxlength="PROFILE_NAME_MAX_LENGTH"
            />
            <FormFieldError :errors="profileErrors.name" />
          </div>

          <div>
            <label class="form-label" for="profile-username">Username</label>
            <input
              id="profile-username"
              v-model="profileForm.username"
              type="text"
              class="form-control"
              :maxlength="PROFILE_USERNAME_MAX_LENGTH"
            />
            <FormFieldError :errors="profileErrors.username" />
          </div>

          <div>
            <label class="form-label" for="profile-bio">Bio</label>
            <textarea
              id="profile-bio"
              v-model="profileForm.bio"
              rows="5"
              :maxlength="PROFILE_BIO_MAX_LENGTH"
              class="form-control"
            ></textarea>
            <div class="small muted-copy mt-2">{{ profileForm.bio.length }} / {{ PROFILE_BIO_MAX_LENGTH }}</div>
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
