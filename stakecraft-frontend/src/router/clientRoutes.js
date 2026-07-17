/** Client-only routes — keep separate from SSG bundle */
export const clientOnlyRoutes = [
  {
    path: '/health',
    name: 'health',
    component: () => import('../views/HealthView.vue')
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
