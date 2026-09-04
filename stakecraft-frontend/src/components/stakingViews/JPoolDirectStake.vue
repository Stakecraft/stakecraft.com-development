<template>
  <div class="stake-embed jpool-embed">
    <div class="embed-container">
      <div class="modal-content">
        <div class="modal-header" :class="{ 'header-compact': walletConnected }">
          <h2 class="modal-title">Stake via JPool</h2>
          <div v-if="walletConnected" class="header-wallet">
            <span class="wallet-pill" :title="walletAddress">
              {{ connectedWalletType }} · {{ truncateAddress(walletAddress) }}
            </span>
            <button type="button" class="disconnect-link" @click="disconnectWallet">
              Disconnect
            </button>
          </div>
        </div>

        <div v-if="walletError" class="wallet-warning">
          <p class="warning-message">
            Install Phantom or Solflare to stake SOL through JPool on this page.
          </p>
        </div>

        <div v-if="!walletConnected" class="wallet-connection">
          <p class="network-blurb">
            Direct-stake to StakeCraft and receive JSOL. JPool matches directed deposits onto our
            validator.
          </p>
          <button
            type="button"
            class="primary-button full-width"
            :disabled="isConnecting"
            @click="connect"
          >
            {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
          </button>
        </div>

        <div v-else class="connected-body">
          <div v-if="txSignature" class="compact-tx">
            <a
              :href="`https://explorer.solana.com/tx/${txSignature}?cluster=mainnet`"
              target="_blank"
              rel="noopener noreferrer"
              class="link-primary"
            >
              View transaction
            </a>
          </div>

          <div class="tab-container">
            <button
              type="button"
              class="tab-button"
              :class="{ 'tab-active': activeTab === 'stake' }"
              @click="activeTab = 'stake'"
            >
              Stake
            </button>
            <button
              type="button"
              class="tab-button"
              :class="{ 'tab-active': activeTab === 'unstake' }"
              @click="activeTab = 'unstake'"
            >
              Unstake
            </button>
          </div>

          <div class="tab-panels tab-panels-stacked">
            <div class="tab-content" :class="{ 'is-active': activeTab === 'stake' }">
              <form class="staking-form-compact" @submit.prevent="stake">
                <div class="stats-inline">
                  <span class="info-label">Balance</span>
                  <span>{{ formatSol(solBalance) }} SOL</span>
                  <span class="stats-sep">·</span>
                  <span class="info-label">JSOL</span>
                  <span>{{ formatSol(jsolBalance) }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="jpool-stake-amount">Amount (SOL)</label>
                  <div class="input-row">
                    <input
                      id="jpool-stake-amount"
                      v-model="stakeAmount"
                      type="number"
                      min="0"
                      step="any"
                      class="form-input"
                      placeholder="0.0"
                      :disabled="isStaking"
                    />
                    <button
                      type="button"
                      class="max-button"
                      :disabled="isStaking || solBalance <= 0"
                      @click="setMaxStake"
                    >
                      Max
                    </button>
                  </div>
                  <p v-if="estimatedJsol != null" class="input-hint">
                    ≈ {{ formatSol(estimatedJsol) }} JSOL
                    <template v-if="depositFeePct != null">
                      · fee {{ depositFeePct }}%
                    </template>
                  </p>
                </div>

                <div class="validator-inline">
                  <span class="info-label">Validator</span>
                  <span class="validator-short" :title="vote">StakeCraft · {{ truncateAddress(vote) }}</span>
                </div>

                <p v-if="stakeError" class="error-message">{{ stakeError }}</p>
                <p v-if="stakeSuccess" class="success-message">{{ stakeSuccess }}</p>

                <button
                  type="submit"
                  class="primary-button full-width"
                  :disabled="isStaking || !canStake"
                >
                  {{ isStaking ? 'Confirm in wallet…' : 'Stake SOL' }}
                </button>

                <p class="compact-note">
                  You receive JSOL while JPool directs your stake (plus matching) to StakeCraft.
                </p>
              </form>
            </div>

            <div class="tab-content" :class="{ 'is-active': activeTab === 'unstake' }">
              <form class="staking-form-compact" @submit.prevent="unstake">
                <div class="stats-inline">
                  <span class="info-label">JSOL balance</span>
                  <span>{{ formatSol(jsolBalance) }} JSOL</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="jpool-unstake-amount">Amount (JSOL)</label>
                  <div class="input-row">
                    <input
                      id="jpool-unstake-amount"
                      v-model="unstakeAmount"
                      type="number"
                      min="0"
                      step="any"
                      class="form-input"
                      placeholder="0.0"
                      :disabled="isUnstaking"
                    />
                    <button
                      type="button"
                      class="max-button"
                      :disabled="isUnstaking || jsolBalance <= 0"
                      @click="setMaxUnstake"
                    >
                      Max
                    </button>
                  </div>
                  <p v-if="estimatedSol != null" class="input-hint">
                    ≈ {{ formatSol(estimatedSol) }} SOL
                    <template v-if="withdrawFeePct != null">
                      · fee {{ withdrawFeePct }}%
                    </template>
                  </p>
                </div>

                <p v-if="unstakeError" class="error-message">{{ unstakeError }}</p>
                <p v-if="unstakeSuccess" class="success-message">{{ unstakeSuccess }}</p>

                <button
                  type="submit"
                  class="primary-button full-width"
                  :disabled="isUnstaking || !canUnstake"
                >
                  {{ isUnstaking ? 'Confirm in wallet…' : 'Unstake for SOL' }}
                </button>

                <p class="compact-note">
                  Instant unstake burns JSOL for SOL from the pool reserve (fees may apply).
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  STAKECRAFT_VOTE,
  connectWallet,
  WalletDisconnect,
  getSolBalance,
  getJsolBalance,
  getPoolQuote,
  depositSolDirect,
  withdrawSol,
  estimateJsolFromSol,
  estimateSolFromJsol
} from '../../utils/jpoolStaking.js'

const FEE_BUFFER_SOL = 0.005

export default {
  name: 'JPoolDirectStake',
  props: {
    vote: {
      type: String,
      default: STAKECRAFT_VOTE
    },
    network: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const walletConnected = ref(false)
    const walletAddress = ref('')
    const connectedWalletType = ref('Wallet')
    const walletError = ref(false)
    const isConnecting = ref(false)

    const activeTab = ref('stake')
    const solBalance = ref(0)
    const jsolBalance = ref(0)
    const poolRate = ref(null)
    const depositFeePct = ref(null)
    const withdrawFeePct = ref(null)

    const stakeAmount = ref('')
    const unstakeAmount = ref('')
    const isStaking = ref(false)
    const isUnstaking = ref(false)
    const stakeError = ref('')
    const unstakeError = ref('')
    const stakeSuccess = ref('')
    const unstakeSuccess = ref('')
    const txSignature = ref('')

    const vote = computed(() => props.vote || props.network?.validator || STAKECRAFT_VOTE)

    const estimatedJsol = computed(() =>
      estimateJsolFromSol(Number(stakeAmount.value), poolRate.value)
    )
    const estimatedSol = computed(() =>
      estimateSolFromJsol(Number(unstakeAmount.value), poolRate.value)
    )

    const canStake = computed(() => {
      const n = Number(stakeAmount.value)
      return Number.isFinite(n) && n > 0 && n <= solBalance.value
    })
    const canUnstake = computed(() => {
      const n = Number(unstakeAmount.value)
      return Number.isFinite(n) && n > 0 && n <= jsolBalance.value
    })

    const truncateAddress = (addr) => {
      if (!addr || addr.length < 10) return addr || ''
      return `${addr.slice(0, 4)}…${addr.slice(-4)}`
    }

    const formatSol = (n) => {
      if (n == null || !Number.isFinite(Number(n))) return '—'
      return Number(n).toLocaleString(undefined, {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0
      })
    }

    const detectWalletType = () => {
      if (typeof window === 'undefined') return 'Wallet'
      if (window.solana?.isPhantom) return 'Phantom'
      if (window.solflare) return 'Solflare'
      return 'Wallet'
    }

    const refreshBalances = async () => {
      if (!walletAddress.value) return
      const [solResult, jsolResult, quoteResult] = await Promise.allSettled([
        getSolBalance(walletAddress.value),
        getJsolBalance(walletAddress.value),
        getPoolQuote()
      ])
      if (solResult.status === 'fulfilled') {
        const sol = solResult.value
        solBalance.value = typeof sol === 'number' ? sol : Number(sol) || 0
      } else {
        console.warn('JPool SOL balance failed:', solResult.reason?.message || solResult.reason)
      }
      if (jsolResult.status === 'fulfilled') {
        jsolBalance.value = jsolResult.value
      } else {
        console.warn('JPool JSOL balance failed:', jsolResult.reason?.message || jsolResult.reason)
      }
      if (quoteResult.status === 'fulfilled' && quoteResult.value) {
        const quote = quoteResult.value
        poolRate.value = quote.rate
        depositFeePct.value =
          quote.depositFee != null ? Number((quote.depositFee * 100).toFixed(2)) : null
        withdrawFeePct.value =
          quote.withdrawFee != null ? Number((quote.withdrawFee * 100).toFixed(2)) : null
      } else if (quoteResult.status === 'rejected') {
        console.warn('JPool pool quote failed:', quoteResult.reason?.message || quoteResult.reason)
      }
    }

    const connect = async () => {
      walletError.value = false
      isConnecting.value = true
      try {
        const pubkey = await connectWallet()
        walletAddress.value = pubkey.toBase58()
        connectedWalletType.value = detectWalletType()
        walletConnected.value = true
        await refreshBalances()
      } catch (err) {
        console.error(err)
        walletError.value = true
        walletConnected.value = false
      } finally {
        isConnecting.value = false
      }
    }

    const disconnectWallet = async () => {
      try {
        await WalletDisconnect()
      } catch {
        /* ignore */
      }
      walletConnected.value = false
      walletAddress.value = ''
      solBalance.value = 0
      jsolBalance.value = 0
      stakeAmount.value = ''
      unstakeAmount.value = ''
      stakeError.value = ''
      unstakeError.value = ''
      stakeSuccess.value = ''
      unstakeSuccess.value = ''
      txSignature.value = ''
    }

    const setMaxStake = () => {
      const max = Math.max(0, solBalance.value - FEE_BUFFER_SOL)
      stakeAmount.value = max > 0 ? String(Number(max.toFixed(6))) : ''
    }

    const setMaxUnstake = () => {
      unstakeAmount.value =
        jsolBalance.value > 0 ? String(Number(jsolBalance.value.toFixed(6))) : ''
    }

    const stake = async () => {
      stakeError.value = ''
      stakeSuccess.value = ''
      txSignature.value = ''
      isStaking.value = true
      try {
        const sig = await depositSolDirect(Number(stakeAmount.value), vote.value)
        txSignature.value = sig
        stakeSuccess.value = 'Stake submitted — you received JSOL directed to StakeCraft.'
        stakeAmount.value = ''
        await refreshBalances()
      } catch (err) {
        stakeError.value = err?.message || 'Stake failed'
      } finally {
        isStaking.value = false
      }
    }

    const unstake = async () => {
      unstakeError.value = ''
      unstakeSuccess.value = ''
      txSignature.value = ''
      isUnstaking.value = true
      try {
        const sig = await withdrawSol(Number(unstakeAmount.value))
        txSignature.value = sig
        unstakeSuccess.value = 'Unstake submitted — SOL returned to your wallet.'
        unstakeAmount.value = ''
        await refreshBalances()
      } catch (err) {
        unstakeError.value = err?.message || 'Unstake failed'
      } finally {
        isUnstaking.value = false
      }
    }

    let balanceTimer = null
    onMounted(() => {
      if (typeof window !== 'undefined' && !window.solana && !window.solflare) {
        walletError.value = true
      }
      balanceTimer = setInterval(() => {
        if (walletConnected.value) refreshBalances()
      }, 30000)
    })

    onBeforeUnmount(() => {
      if (balanceTimer) clearInterval(balanceTimer)
    })

    watch(activeTab, () => {
      stakeError.value = ''
      unstakeError.value = ''
    })

    return {
      vote,
      walletConnected,
      walletAddress,
      connectedWalletType,
      walletError,
      isConnecting,
      activeTab,
      solBalance,
      jsolBalance,
      depositFeePct,
      withdrawFeePct,
      stakeAmount,
      unstakeAmount,
      isStaking,
      isUnstaking,
      stakeError,
      unstakeError,
      stakeSuccess,
      unstakeSuccess,
      txSignature,
      estimatedJsol,
      estimatedSol,
      canStake,
      canUnstake,
      truncateAddress,
      formatSol,
      connect,
      disconnectWallet,
      setMaxStake,
      setMaxUnstake,
      stake,
      unstake
    }
  }
}
</script>

<style scoped>
.jpool-embed.stake-embed {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: poppins, Helvetica, sans-serif;
  color: #111217;
}

.embed-container,
.modal-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
}

.modal-content {
  background: #ffffff;
  border: 1px solid #ebedf0;
  border-radius: 20px;
  padding: 22px;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-header.header-compact {
  margin-bottom: 12px;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111217;
}

.header-wallet {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.wallet-pill {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f0f0f0;
  border: 1px solid #ebedf0;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.disconnect-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 0.75rem;
  color: #111217;
  opacity: 0.65;
  cursor: pointer;
  text-decoration: underline;
}

.network-blurb {
  margin: 0 0 16px;
  font-size: 0.9rem;
  line-height: 1.45;
  opacity: 0.75;
}

.wallet-connection {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wallet-warning {
  margin-bottom: 12px;
}

.warning-message {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.connected-body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.compact-tx {
  margin-bottom: 10px;
}

.link-primary {
  color: #111217;
  font-size: 0.85rem;
  font-weight: 600;
}

.tab-container {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.tab-button {
  flex: 1;
  border: 1px solid #ebedf0;
  background: #f0f0f0;
  border-radius: 12px;
  padding: 8px 12px;
  font: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  color: #111217;
  cursor: pointer;
}

.tab-button.tab-active {
  background: #35f6df;
  border-color: #35f6df;
}

.tab-panels-stacked {
  position: relative;
  flex: 1 1 auto;
  display: grid;
  min-height: 0;
}

.tab-panels-stacked > .tab-content {
  grid-area: 1 / 1;
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
}

.tab-panels-stacked > .tab-content.is-active {
  visibility: visible;
  pointer-events: auto;
  opacity: 1;
}

.staking-form-compact {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.stats-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 8px;
  font-size: 0.8rem;
}

.stats-inline .info-label {
  opacity: 0.55;
  font-weight: 500;
}

.stats-sep {
  opacity: 0.35;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.7;
}

.input-row {
  display: flex;
  gap: 8px;
}

.form-input {
  flex: 1;
  min-width: 0;
  border: 1px solid #ebedf0;
  background: #f0f0f0;
  border-radius: 14px;
  padding: 12px 14px;
  font: inherit;
  font-size: 1rem;
  color: #111217;
}

.form-input:focus {
  outline: none;
  border-color: #35f6df;
}

.max-button {
  border: 1px solid #ebedf0;
  background: #ffffff;
  border-radius: 14px;
  padding: 0 14px;
  font: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  color: #111217;
}

.max-button:hover:not(:disabled) {
  border-color: #35f6df;
}

.max-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.input-hint {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.6;
}

.validator-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  padding: 10px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  border: 1px solid #ebedf0;
}

.validator-inline .info-label {
  opacity: 0.55;
  font-weight: 500;
}

.validator-short {
  font-weight: 600;
}

.primary-button {
  border: none;
  border-radius: 20px;
  background: #35f6df;
  color: #111217;
  font: inherit;
  font-weight: 700;
  padding: 14px 18px;
  cursor: pointer;
}

.primary-button:hover:not(:disabled) {
  filter: brightness(0.97);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
}

.compact-note {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  opacity: 0.6;
}

.error-message {
  margin: 0;
  font-size: 0.8rem;
  color: #c0392b;
}

.success-message {
  margin: 0;
  font-size: 0.8rem;
  color: #1e7a45;
}
</style>
