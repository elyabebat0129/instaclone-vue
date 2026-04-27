<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CONNECTION_LIST_TYPES, ROUTE_NAMES } from '@/router/routeNames'

const props = defineProps({
  username: {
    type: String,
    default: '',
  },
  postsCount: {
    type: Number,
    default: 0,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
})

const query = computed(() => (
  props.isOwnProfile || !props.username
    ? undefined
    : { user: props.username }
))
</script>

<template>
  <div class="d-flex flex-wrap gap-3">
    <div class="surface-chip"><strong>{{ postsCount }}</strong> posts</div>
    <RouterLink
      :to="{ name: ROUTE_NAMES.profileList, params: { type: CONNECTION_LIST_TYPES.followers }, query }"
      class="surface-chip"
    >
      <strong>{{ followersCount }}</strong> seguidores
    </RouterLink>
    <RouterLink
      :to="{ name: ROUTE_NAMES.profileList, params: { type: CONNECTION_LIST_TYPES.following }, query }"
      class="surface-chip"
    >
      <strong>{{ followingCount }}</strong> seguindo
    </RouterLink>
  </div>
</template>
