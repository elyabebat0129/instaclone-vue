<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import FormFieldError from '@/components/common/FormFieldError.vue'
import { extractErrorMessage } from '@/services/formatters'
import { useFeedStore } from '@/stores/feed'

const router = useRouter()
const feedStore = useFeedStore()

const form = reactive({
  caption: '',
})

const selectedImage = ref(null)
const previewUrl = ref('')
const errors = ref({})
const loading = ref(false)

const captionCount = computed(() => form.caption.length)
// O botao respeita a regra visual definida nas tasks.
const canSubmit = computed(() => Boolean(selectedImage.value) && form.caption.trim().length > 0 && !loading.value)

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

function setFile(file) {
  // Toda vez que a imagem muda, atualizamos a preview local.
  revokePreview()
  selectedImage.value = file

  if (file) {
    previewUrl.value = URL.createObjectURL(file)
  }
}

function handleFileChange(event) {
  errors.value = {}
  const file = event.target.files?.[0]

  if (!file) {
    setFile(null)
    return
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  // A validacao do cliente evita upload invalido antes de falar com a API.
  if (!validTypes.includes(file.type)) {
    errors.value = { image: ['Selecione uma imagem JPG, JPEG, PNG ou WEBP.'] }
    event.target.value = ''
    setFile(null)
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errors.value = { image: ['A imagem deve ter no maximo 5 MB.'] }
    event.target.value = ''
    setFile(null)
    return
  }

  setFile(file)
}

async function handleSubmit() {
  errors.value = {}

  if (!selectedImage.value) {
    errors.value = { image: ['Selecione uma imagem para publicar.'] }
    return
  }

  if (!form.caption.trim()) {
    errors.value = { caption: ['A legenda e obrigatoria nesta interface.'] }
    return
  }

  loading.value = true

  try {
    // O backend espera multipart com imagem e legenda.
    const payload = new FormData()
    payload.append('image', selectedImage.value)
    payload.append('caption', form.caption.trim())

    await feedStore.createPost(payload)
    router.push('/feed')
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

onBeforeUnmount(() => {
  // Evita manter blobs antigos vivos na memoria do navegador.
  revokePreview()
})
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

          <div v-if="previewUrl" class="mt-4">
            <img :src="previewUrl" alt="Preview do post" class="post-card__image" />
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
              maxlength="2200"
              placeholder="Escreva uma legenda para o post..."
            ></textarea>
            <div class="small muted-copy mt-2">
              {{ captionCount }} / 2200
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
