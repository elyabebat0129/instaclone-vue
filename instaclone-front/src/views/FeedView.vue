<script setup>
import { onMounted } from 'vue'
import { useFeedStore } from '@/stores/feed'

const feedStore = useFeedStore()

onMounted(() => {
  if (!feedStore.items.length) {
    feedStore.fetchFeed().catch(() => {})
  }
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <h1>Feed</h1>
        <p>Vamos consumir o endpoint real <code>/feed</code> e expandir esta tela no proximo passo.</p>
      </div>
    </div>

    <div class="surface-card">
      <div v-if="feedStore.loading" class="muted-copy">Carregando feed...</div>
      <div v-else-if="feedStore.items.length" class="d-flex flex-column gap-3">
        <article
          v-for="post in feedStore.items"
          :key="post.id"
          class="border rounded-4 p-3"
        >
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong>@{{ post.user?.username }}</strong>
            <span class="muted-copy small">{{ post.likes_count }} curtidas</span>
          </div>
          <p class="mb-0">{{ post.caption || 'Post sem legenda.' }}</p>
        </article>
      </div>
      <div v-else class="empty-state">
        Nenhum post no feed ainda. Isso pode acontecer se a conta nao seguir ninguem.
      </div>
    </div>
  </div>
</template>
