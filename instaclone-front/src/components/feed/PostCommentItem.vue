<script setup>
import { computed } from 'vue'
import { formatRelative } from '@/utils/dates'
import { defaultAuthor } from '@/stores/profileUtils'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['delete'])

const author = computed(() => defaultAuthor(props.comment.user))
</script>

<template>
  <article class="post-comment-card">
    <div class="d-flex justify-content-between align-items-start gap-3">
      <div>
        <div class="fw-semibold">@{{ author.username }}</div>
        <div class="small muted-copy">{{ formatRelative(comment.created_at) }}</div>
      </div>
      <button
        v-if="canDelete"
        type="button"
        class="btn btn-sm btn-outline-danger"
        @click="$emit('delete', comment.id)"
      >
        Excluir
      </button>
    </div>
    <p class="mb-0 mt-2">{{ comment.body }}</p>
  </article>
</template>
