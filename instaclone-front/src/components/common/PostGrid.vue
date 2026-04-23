<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  posts: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="row g-3">
    <div v-for="post in posts" :key="post.id" class="col-6 col-md-4">
      <RouterLink :to="`/posts/${post.id}`" class="d-block">
        <img :src="post.image_url" alt="Post" class="post-grid__image" />
      </RouterLink>
    </div>
  </div>
</template>
