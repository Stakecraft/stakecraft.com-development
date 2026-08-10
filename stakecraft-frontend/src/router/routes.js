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
  },
  {
    path: '/solana-staking',
    name: 'solana-staking',
    component: () => import('../views/NetworkStakingView.vue'),
    meta: { seoKey: 'solanaStaking', networkSlug: 'solana' }
  },
  {
    path: '/near-staking',
    name: 'near-staking',
    component: () => import('../views/NetworkStakingView.vue'),
    meta: { seoKey: 'nearStaking', networkSlug: 'near' }
  },
  {
    path: '/monad-staking',
    name: 'monad-staking',
    component: () => import('../views/NetworkStakingView.vue'),
    meta: { seoKey: 'monadStaking', networkSlug: 'monad' }
  }
]

export const prerenderRoutes = [
  '/',
  '/terms',
  '/policy',
  '/swap',
  '/solana-staking',
  '/near-staking',
  '/monad-staking',
  '/notadmin',
  '/health'
]
