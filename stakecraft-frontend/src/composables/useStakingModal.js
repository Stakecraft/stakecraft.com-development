import { ref } from 'vue'

// Shared singleton state so the SSR-safe network cards (MainnetStatic) and the
// client-only staking modal app (setupMainnetStaking) talk to each other
// without pulling any wallet code into the SSR/SSG render graph.
const selectedNetwork = ref(null)
const isModalVisible = ref(false)
/** CMS network object for the inline Solana stake card on /solana-staking. */
const embedNetwork = ref(null)

export function useStakingModal() {
  const openModal = (network) => {
    selectedNetwork.value = network
    isModalVisible.value = true
  }

  const closeModal = () => {
    isModalVisible.value = false
    selectedNetwork.value = null
  }

  const setEmbedNetwork = (network) => {
    embedNetwork.value = network || null
  }

  return {
    selectedNetwork,
    isModalVisible,
    embedNetwork,
    openModal,
    closeModal,
    setEmbedNetwork
  }
}
