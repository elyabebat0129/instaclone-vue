<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue', 'submit'])
</script>

<template>
  <form class="d-flex flex-column gap-2" @submit.prevent="$emit('submit')">
    <textarea
      :value="modelValue"
      class="form-control"
      rows="3"
      maxlength="2200"
      placeholder="Adicione um comentario..."
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <div class="d-flex justify-content-between align-items-center gap-3">
      <div v-if="error" class="small text-danger">{{ error }}</div>
      <div v-else class="small muted-copy">Converse com quem tambem viu este post.</div>
      <button type="submit" class="btn btn-brand" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Comentar' }}
      </button>
    </div>
  </form>
</template>
