<template>
  <div class="poolStake">
    <div class="poolStakeHead">
      <img v-if="logo" class="poolStakeLogo" :src="logo" :alt="tokenSymbol" />
      <div>
        <div class="poolStakeTitle">{{ title }}</div>
        <div class="poolStakeHint">
          Stake SOL on this page → receive {{ tokenSymbol }}, directed to StakeCraft.
        </div>
      </div>
    </div>

    <div v-if="!walletReady" class="poolStakeRow">
      <button class="ctaPrimary" type="button" :disabled="busy" @click="onConnect">
        {{ busy ? 'Connecting…' : 'Connect wallet' }}
      </button>
    </div>

    <template v-else>
      <div class="poolStakeMeta">
        <span>{{ shortAddress }}</span>
        <span v-if="balance != null">{{ balance.toFixed(3) }} SOL</span>
      </div>
      <div class="poolStakeRow">
        <input
          v-model="amount"
          class="poolStakeInput"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount (SOL)"
          :disabled="busy"
        />
        <button class="ctaPrimary" type="button" :disabled="busy || !amount" @click="onStake">
          {{ busy ? 'Confirm in wallet…' : `Stake → ${tokenSymbol}` }}
        </button>
      </div>
    </template>

    <p v-if="error" class="poolStakeError">{{ error }}</p>
    <p v-if="signature" class="poolStakeOk">
      Staked.
      <a
        :href="`https://explorer.solana.com/tx/${signature}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        View transaction
      </a>
    </p>
    <a
      v-if="fallbackUrl"
      class="poolStakeFallback"
      :href="fallbackUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      Open {{ poolLabel }} app instead
    </a>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import {
  POOL_STAKE_HANDLERS,
  connectWallet,
  getProvider,
  getWalletSolBalance
} from '../utils/poolDirectStake.js'

const POOL_LABELS = {
  jpool: 'JPool',
  solblaze: 'SolBlaze',
  vault: 'The Vault'
}

export default {
  name: 'PoolDirectStakeWidget',
  props: {
    pool: { type: String, required: true },
    vote: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    logo: { type: String, default: '' },
    title: { type: String, default: 'Direct stake' },
    fallbackUrl: { type: String, default: '' }
  },
  setup(props) {
    const walletReady = ref(false)
    const walletAddress = ref('')
    const balance = ref(null)
    const amount = ref('')
    const busy = ref(false)
    const error = ref('')
    const signature = ref('')

    const shortAddress = computed(() => {
      const a = walletAddress.value
      if (!a) return ''
      return `${a.slice(0, 4)}…${a.slice(-4)}`
    })
    const poolLabel = computed(() => POOL_LABELS[props.pool] || props.pool)

    const refreshBalance = async () => {
      try {
        balance.value = await getWalletSolBalance()
      } catch {
        balance.value = null
      }
    }

    const syncWallet = async () => {
      try {
        const provider = getProvider()
        if (provider?.publicKey) {
          walletReady.value = true
          walletAddress.value = provider.publicKey.toBase58()
          await refreshBalance()
        }
      } catch {
        walletReady.value = false
      }
    }

    const onConnect = async () => {
      busy.value = true
      error.value = ''
      try {
        const key = await connectWallet()
        walletReady.value = true
        walletAddress.value = key.toBase58()
        await refreshBalance()
      } catch (err) {
        error.value = err?.message || 'Could not connect wallet'
      } finally {
        busy.value = false
      }
    }

    const onStake = async () => {
      const handler = POOL_STAKE_HANDLERS[props.pool]
      if (!handler) {
        error.value = 'Unsupported pool'
        return
      }
      busy.value = true
      error.value = ''
      signature.value = ''
      try {
        const sig = await handler({
          amountSol: amount.value,
          voteAccount: props.vote
        })
        signature.value = sig
        amount.value = ''
        await refreshBalance()
      } catch (err) {
        error.value = err?.message || 'Stake failed'
      } finally {
        busy.value = false
      }
    }

    onMounted(syncWallet)

    return {
      walletReady,
      shortAddress,
      balance,
      amount,
      busy,
      error,
      signature,
      poolLabel,
      onConnect,
      onStake
    }
  }
}
</script>

<style scoped>
.poolStake {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border: 1px solid color-mix(in srgb, var(--main-color) 22%, transparent);
  background: color-mix(in srgb, var(--main-color) 6%, transparent);
}

.poolStakeHead {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.poolStakeLogo {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  object-fit: cover;
  background: #fff;
}

.poolStakeTitle {
  font-weight: 700;
  color: var(--main-color);
}

.poolStakeHint,
.poolStakeMeta,
.poolStakeFallback {
  font-size: 0.85rem;
  opacity: 0.8;
}

.poolStakeMeta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.poolStakeRow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.poolStakeInput {
  flex: 1 1 8rem;
  min-width: 8rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid color-mix(in srgb, var(--main-color) 30%, transparent);
  background: transparent;
  color: inherit;
  font: inherit;
}

.poolStakeError {
  margin: 0;
  color: #c23b3b;
  font-size: 0.9rem;
}

.poolStakeOk {
  margin: 0;
  font-size: 0.9rem;
}

.poolStakeOk a,
.poolStakeFallback {
  color: var(--main-color);
}
</style>
