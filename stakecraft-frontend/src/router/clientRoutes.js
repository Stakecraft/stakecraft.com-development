/** Client-only routes — keep separate from SSG bundle */
export const clientOnlyRoutes = [
  {
    path: '/health',
    name: 'health',
    component: () => import('../views/HealthView.vue')
  },
  {
    path: '/products',
    redirect: { path: '/', hash: '#products' }
  },
  {
    path: '/notadmin/login',
    name: 'admin-login',
    component: () => import('../views/AdminLogin.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/notadmin',
    name: 'admin',
    component: () => import('../views/AdminPanel.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]
