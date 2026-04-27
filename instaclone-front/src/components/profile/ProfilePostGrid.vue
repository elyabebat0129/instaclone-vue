<script setup>
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/router/routeNames'

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
      <RouterLink :to="{ name: ROUTE_NAMES.postDetails, params: { postId: post.id } }" class="d-block">
        <img :src="post.image_url" alt="Post" class="post-grid__image" />
      </RouterLink>
    </div>
  </div>
</template>
