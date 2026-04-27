<script setup>
import PostCommentItem from '@/components/feed/PostCommentItem.vue'

defineProps({
  comments: {
    type: Array,
    default: () => [],
  },
  currentUserId: {
    type: Number,
    default: null,
  },
})

defineEmits(['delete'])
</script>

<template>
  <div v-if="comments.length" class="d-flex flex-column gap-3">
    <PostCommentItem
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      :can-delete="comment.user_id === currentUserId"
      @delete="$emit('delete', $event)"
    />
  </div>
  <div v-else class="empty-state py-4">
    Nenhum comentario ainda. Seja a primeira pessoa a comentar.
  </div>
</template>
