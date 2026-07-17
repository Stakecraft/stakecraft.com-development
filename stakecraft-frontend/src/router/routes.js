import HomeView from '../views/HomeView.vue'

/** Routes included in SSG prerender — no wallet/admin dependencies */
export const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { seoKey: 'home' }
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('../components/termsAndConditions/TermsAndConditions.vue'),
    meta: { seoKey: 'terms' }
  },
  {
    path: '/policy',
    name: 'policy',
    component: () => import('../components/privacyPolicy/PrivacyPolicy.vue'),
    meta: { seoKey: 'policy' }
  },
  {
    path: '/swap',
    name: 'swap',
    component: () => import('../views/Swap.vue'),
    meta: { seoKey: 'swap' }
  }
]

export const prerenderRoutes = ['/', '/terms', '/policy', '/swap', '/notadmin', '/health']
