import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CONNECTION_LIST_TYPES, ROUTE_NAMES } from '@/router/routeNames'

const routes = [
  {
    path: '/',
    redirect: { name: ROUTE_NAMES.feed },
  },
  {
    path: '/login',
    name: ROUTE_NAMES.login,
    component: () => import('@/views/LoginView.vue'),
    meta: {
      layout: 'auth',
      requiresGuest: true,
    },
  },
  {
    path: '/register',
    name: ROUTE_NAMES.register,
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      layout: 'auth',
      requiresGuest: true,
    },
  },
  {
    path: '/cadastro',
    redirect: { name: ROUTE_NAMES.register },
  },
  {
    path: '/feed',
    name: ROUTE_NAMES.feed,
    component: () => import('@/views/FeedView.vue'),
    meta: {
      requiresAuth: true,
      navItem: ROUTE_NAMES.feed,
    },
  },
  {
    path: '/discover',
    name: ROUTE_NAMES.discover,
    component: () => import('@/views/DiscoverView.vue'),
    meta: {
      requiresAuth: true,
      navItem: ROUTE_NAMES.discover,
    },
  },
  {
    path: '/descobrir',
    redirect: { name: ROUTE_NAMES.discover },
  },
  {
    path: '/create',
    name: ROUTE_NAMES.create,
    component: () => import('@/views/CreatePostView.vue'),
    meta: {
      requiresAuth: true,
      navItem: ROUTE_NAMES.create,
    },
  },
  {
    path: '/criar',
    redirect: { name: ROUTE_NAMES.create },
  },
  {
    path: '/profile',
    name: ROUTE_NAMES.profile,
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      navItem: ROUTE_NAMES.profile,
    },
  },
  {
    path: '/perfil',
    redirect: (to) => ({ name: ROUTE_NAMES.profile, query: to.query }),
  },
  {
    path: '/profile/edit',
    name: ROUTE_NAMES.profileEdit,
    component: () => import('@/views/EditProfileView.vue'),
    meta: {
      requiresAuth: true,
      navItem: ROUTE_NAMES.profile,
    },
  },
  {
    path: '/perfil/editar',
    redirect: { name: ROUTE_NAMES.profileEdit },
  },
  {
    path: `/profile/list/:type(${CONNECTION_LIST_TYPES.followers}|${CONNECTION_LIST_TYPES.following})`,
    name: ROUTE_NAMES.profileList,
    component: () => import('@/views/ProfileConnectionsView.vue'),
    meta: {
      requiresAuth: true,
      navItem: ROUTE_NAMES.profile,
    },
  },
  {
    path: '/perfil/lista/:type',
    redirect: (to) => ({
      name: ROUTE_NAMES.profileList,
      params: {
        type: to.params.type === 'seguidores'
          ? CONNECTION_LIST_TYPES.followers
          : CONNECTION_LIST_TYPES.following,
      },
      query: to.query,
    }),
  },
  {
    path: '/posts/:postId',
    name: ROUTE_NAMES.postDetails,
    component: () => import('@/views/PostDetailView.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.notFound,
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

  if (authStore.token && !authStore.user) {
    try {
      await authStore.hydrateAuthState()
    } catch {
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: ROUTE_NAMES.login,
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: ROUTE_NAMES.feed }
  }

  return true
})

export default router
