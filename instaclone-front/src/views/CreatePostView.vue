<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useImageUpload } from '@/composables/useImageUpload'
import FormFieldError from '@/components/common/FormFieldError.vue'
import { ROUTE_NAMES } from '@/router/routeNames'
import { extractErrorMessage } from '@/services/api'
import { POST_CAPTION_MAX_LENGTH, POST_IMAGE_MAX_MB } from '@/utils/profile'
import { useFeedStore } from '@/stores/feed'

const router = useRouter()
const feedStore = useFeedStore()

const form = reactive({
  caption: '',
})

const errors = ref({})
const loading = ref(false)
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const imageUpload = useImageUpload({
  validTypes,
  maxSizeInMb: POST_IMAGE_MAX_MB,
})

const captionCount = computed(() => form.caption.length)
const canSubmit = computed(() => imageUpload.hasFile.value && form.caption.trim().length > 0 && !loading.value)

function handleFileChange(event) {
  errors.value = {}
  const validation = imageUpload.handleFileChange(event)

  if (!validation.valid) {
    errors.value = { image: validation.errors }
  }
}

async function handleSubmit() {
  errors.value = {}

  if (!imageUpload.file.value) {
    errors.value = { image: ['Selecione uma imagem para publicar.'] }
    return
  }

  if (!form.caption.trim()) {
    errors.value = { caption: ['A legenda e obrigatoria nesta interface.'] }
    return
  }

  loading.value = true

  try {
    const payload = new FormData()
    payload.append('image', imageUpload.file.value)
    payload.append('caption', form.caption.trim())

    await feedStore.createPost(payload)
    router.push({ name: ROUTE_NAMES.feed })
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errors.value = { general: [extractErrorMessage(error, 'Nao foi possivel publicar o post.')] }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>Criar Post</h1>
        <p>Compartilhe uma imagem com legenda e publique no seu perfil.</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-5">
        <div class="surface-card h-100">
          <h2 class="h4 mb-3">Imagem</h2>

          <input
            type="file"
            class="form-control"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            @change="handleFileChange"
          />
          <FormFieldError :errors="errors.image" />

          <div v-if="imageUpload.previewUrl.value" class="mt-4">
            <img :src="imageUpload.previewUrl.value" alt="Preview do post" class="post-card__image" />
          </div>
          <div v-else class="empty-state mt-4">
            A preview aparece aqui depois que voce seleciona uma imagem.
          </div>
        </div>
      </div>

      <div class="col-lg-7">
        <form class="surface-card h-100 d-flex flex-column gap-3" @submit.prevent="handleSubmit">
          <div>
            <h2 class="h4 mb-1">Legenda</h2>
            <p class="muted-copy mb-0">
              Limite de 2200 caracteres, com contador visivel.
            </p>
          </div>

          <div>
            <label class="form-label" for="caption">Legenda</label>
            <textarea
              id="caption"
              v-model="form.caption"
              class="form-control"
              rows="8"
              :maxlength="POST_CAPTION_MAX_LENGTH"
              placeholder="Escreva uma legenda para o post..."
            ></textarea>
            <div class="small muted-copy mt-2">
              {{ captionCount }} / {{ POST_CAPTION_MAX_LENGTH }}
            </div>
            <FormFieldError :errors="errors.caption" />
          </div>

          <FormFieldError :errors="errors.general" />

          <div class="d-flex justify-content-between align-items-center gap-3 mt-auto">
            <div class="muted-copy small">
              O botao so libera com imagem e legenda.
            </div>
            <button type="submit" class="btn btn-brand" :disabled="!canSubmit">
              {{ loading ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
