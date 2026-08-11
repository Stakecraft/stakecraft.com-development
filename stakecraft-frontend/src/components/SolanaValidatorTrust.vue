<template>
  <div class="trustStrip" aria-label="StakeCraft Solana validator credentials">
    <div class="keysRow">
      <button
        type="button"
        class="keyChip"
        :title="identity || 'Identity'"
        @click="copy(identity, 'identity')"
      >
        <span class="keyLabel">Identity</span>
        <code class="keyValue">{{ identityShort }}</code>
        <span class="copyHint">{{ copied === 'identity' ? 'Copied' : 'Copy' }}</span>
      </button>
      <button
        type="button"
        class="keyChip"
        :title="vote || 'Vote'"
        @click="copy(vote, 'vote')"
      >
        <span class="keyLabel">Vote</span>
        <code class="keyValue">{{ voteShort }}</code>
        <span class="copyHint">{{ copied === 'vote' ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>

    <div v-if="loading" class="metricsRow skeletonRow" aria-hidden="true">
      <span v-for="n in 7" :key="n" class="metricChip skeleton" />
    </div>
    <div v-else-if="stats" class="metricsRow">
      <span class="metricChip"><span class="metricLabel">Stake</span>{{ stats.totalStakeLabel }}</span>
      <span class="metricChip"><span class="metricLabel">Commission</span>{{ stats.commissionLabel }}</span>
      <span class="metricChip"><span class="metricLabel">MEV</span>{{ stats.mevCommissionLabel }}</span>
      <span class="metricChip"><span class="metricLabel">APY</span>{{ stats.apyLabel }}</span>
      <span class="metricChip"><span class="metricLabel">Uptime</span>{{ stats.uptimeLabel }}</span>
      <span class="metricChip"><span class="metricLabel">Location</span>{{ stats.location }}</span>
      <span class="metricChip"><span class="metricLabel">IBRL</span>{{ stats.ibrlLabel }}</span>
    </div>

    <div v-if="stats?.pools?.length" class="poolsRow">
      <span class="rowLabel">Pools</span>
      <div class="poolList">
        <button
          v-for="pool in stats.pools"
          :key="pool.id"
          type="button"
          class="poolChip"
          :class="{ selectable: Boolean(pool.tabId) }"
          :title="
            pool.tabId
              ? `${pool.name} · ${pool.stakeLabel} — open stake tab`
              : `${pool.name} · ${pool.stakeLabel}`
          "
          @click="onPoolClick(pool)"
        >
          <img v-if="pool.logo" class="poolLogo" :src="pool.logo" :alt="pool.symbol" loading="lazy" />
          <span class="poolSymbol">{{ pool.symbol }}</span>
        </button>
      </div>
    </div>

    <div v-if="stats?.ranks?.length" class="ranksRow">
      <span class="rowLabel">Ranks</span>
      <div class="rankList">
        <a
          v-for="rank in stats.ranks"
          :key="rank.id"
          class="rankChip"
          :href="rank.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="rankLabel">{{ rank.label }}</span>
          <span class="rankValue">{{ rank.value }}</span>
        </a>
      </div>
    </div>

    <p v-if="error && !stats" class="trustError">Live validator stats unavailable right now.</p>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { fetchSolanaValidatorStats, truncateKey } from '../services/solanaValidatorStats.js'

export default {
  name: 'SolanaValidatorTrust',
  props: {
    vote: { type: String, required: true },
    identity: { type: String, default: '' }
  },
  emits: ['select-pool'],
  setup(props, { emit }) {
    const stats = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const copied = ref('')

    const identity = computed(() => stats.value?.identity || props.identity || '')
    const vote = computed(() => stats.value?.vote || props.vote || '')
    const identityShort = computed(
      () => stats.value?.identityShort || truncateKey(identity.value) || '—'
    )
    const voteShort = computed(() => stats.value?.voteShort || truncateKey(vote.value) || '—')

    const copy = async (value, key) => {
      if (!value || !navigator?.clipboard) return
      try {
        await navigator.clipboard.writeText(value)
        copied.value = key
        setTimeout(() => {
          if (copied.value === key) copied.value = ''
        }, 1500)
      } catch {
        /* ignore */
      }
    }

    const onPoolClick = (pool) => {
      if (pool.tabId) {
        emit('select-pool', pool.tabId)
        return
      }
      if (pool.url) window.open(pool.url, '_blank', 'noopener,noreferrer')
    }

    onMounted(async () => {
      try {
        stats.value = await fetchSolanaValidatorStats(props.vote)
      } catch (err) {
        error.value = err
        console.error(err)
      } finally {
        loading.value = false
      }
    })

    return {
      stats,
      loading,
      error,
      copied,
      identity,
      vote,
      identityShort,
      voteShort,
      copy,
      onPoolClick
    }
  }
}
</script>

<style scoped>
.trustStrip {
  margin-top: 28px;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.keysRow,
.metricsRow,
.poolsRow,
.ranksRow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.poolsRow,
.ranksRow {
  align-items: flex-start;
}

.rowLabel {
  flex: 0 0 auto;
  min-width: 52px;
  margin-top: 6px;
  font-family: poppins;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--van-mainnet-color);
  opacity: 0.72;
}

.poolList,
.rankList {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.keyChip,
.metricChip,
.poolChip,
.rankChip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 14px;
  border: 1px solid var(--van-border-color);
  background: var(--van-mainnet-network-background);
  color: var(--van-mainnet-color);
  font-family: poppins;
  text-decoration: none;
}

.keyChip {
  cursor: pointer;
  background: var(--van-seconday-color);
  border-color: var(--van-seconday-color);
  color: #111217;
}

.keyChip:hover {
  border-color: #111217;
}

.keyChip .keyLabel,
.keyChip .copyHint {
  color: #111217;
  opacity: 0.72;
}

.keyChip .keyValue {
  color: #111217;
}

.keyLabel,
.metricLabel,
.rankLabel {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--van-mainnet-color);
  opacity: 0.7;
}

.keyValue {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--van-seconday-color);
}

.copyHint {
  font-size: 11px;
  font-weight: 600;
  color: var(--van-mainnet-color);
  opacity: 0.65;
}

.metricChip {
  font-size: 13px;
  font-weight: 600;
  gap: 6px;
}

.poolChip {
  flex: 0 0 auto;
  padding: 6px 10px;
  transition: border-color 0.2s, transform 0.2s;
  white-space: nowrap;
  cursor: pointer;
  font: inherit;
}

.poolChip.selectable:hover {
  border-color: var(--van-seconday-color);
}

.poolChip:hover,
.rankChip:hover {
  border-color: var(--van-seconday-color);
}

.poolLogo {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  background: #111217;
}

.poolSymbol {
  font-size: 13px;
  font-weight: 600;
}

.rankChip {
  gap: 6px;
}

.rankValue {
  font-size: 13px;
  font-weight: 700;
  color: var(--van-seconday-color);
}

.skeletonRow .skeleton {
  width: 88px;
  height: 34px;
  opacity: 0.35;
  animation: pulse 1.2s ease-in-out infinite;
}

.trustError {
  margin: 0;
  font-family: poppins;
  font-size: 13px;
  opacity: 0.65;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.5;
  }
}

@media only screen and (max-width: 900px) {
  .trustStrip {
    max-width: 100%;
  }

  .ranksRow .rowLabel {
    width: 100%;
    margin-top: 0;
  }
}
</style>
