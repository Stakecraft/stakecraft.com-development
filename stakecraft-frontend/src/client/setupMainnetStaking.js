import { createApp, h, ref } from 'vue'
import { ConfigProvider } from 'vant'
import { useStakingModal } from '../composables/useStakingModal.js'

// Mounts the wallet-heavy staking modals in a dedicated client-only Vue app.
// Keeping this out of the main app tree prevents wallet SDKs (which reference
// browser globals at module load) from being pulled into the SSG render graph.
export async function setupMainnetStaking() {
  if (typeof window === 'undefined') return
  if (document.getElementById('mainnet-staking-modals')) return

  const { default: StakingModals } = await import('../components/StakingModals.vue')
  const { selectedNetwork, isModalVisible, closeModal } = useStakingModal()

  // Keep the modal app's theme in sync with the body theme class set by App.vue.
  const theme = ref(document.body.classList.contains('van-theme-dark') ? 'dark' : 'light')
  const observer = new MutationObserver(() => {
    theme.value = document.body.classList.contains('van-theme-dark') ? 'dark' : 'light'
  })
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

  const container = document.createElement('div')
  container.id = 'mainnet-staking-modals'
  document.body.appendChild(container)

  const app = createApp({
    setup() {
      return () =>
        h(
          ConfigProvider,
          { theme: theme.value },
          {
            default: () =>
              h(StakingModals, {
                selectedNetwork: selectedNetwork.value,
                isModalVisible: isModalVisible.value,
                onClose: closeModal
              })
          }
        )
    }
  })

  app.mount(container)
}
