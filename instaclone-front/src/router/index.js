import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/feed',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      layout: 'auth',
      requiresGuest: true,
    },
  },
  {
    path: '/cadastro',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      layout: 'auth',
      requiresGuest: true,
    },
  },
  {
    path: '/feed',
    name: 'feed',
    component: () => import('@/views/FeedView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/descobrir',
    name: 'discover',
    component: () => import('@/views/DiscoverView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/criar',
    name: 'create-post',
    component: () => import('@/views/CreatePostView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/perfil',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/perfil/editar',
    name: 'edit-profile',
    component: () => import('@/views/EditProfileView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/perfil/lista/:type',
    name: 'profile-list',
    component: () => import('@/views/ProfileConnectionsView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/posts/:postId',
    name: 'post-detail',
    component: () => import('@/views/PostDetailView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      layout: 'auth',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Se existe token salvo, buscamos o usuario atual antes de validar a rota.
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchMe()
    } catch {
      // O interceptor e a store ja limpam a sessao quando necessario.
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        // Guardamos o destino para voltar a ele depois do login.
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'feed' }
  }

  return true
})

export default router
