<template>
  <div>
    <solana-staking
      v-if="props.selectedNetwork?.title === 'Solana'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <kava-staking
      v-if="props.selectedNetwork?.title === 'Kava'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <koii-staking
      v-if="props.selectedNetwork?.title === 'Koii'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <agoric-staking
      v-if="props.selectedNetwork?.title === 'Agoric'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <band-staking
      v-if="props.selectedNetwork?.title === 'Band Protocol'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <stargaze-staking
      v-if="props.selectedNetwork?.title === 'Stargaze'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <bitsong-staking
      v-if="props.selectedNetwork?.title === 'Bitsong'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <aura-staking
      v-if="props.selectedNetwork?.title === 'Aura Network'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <juno-staking
      v-if="props.selectedNetwork?.title === 'Juno'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <zeta-staking
      v-if="props.selectedNetwork?.title === 'Zetachain'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <ki-staking
      v-if="props.selectedNetwork?.title === 'Ki Foundation'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <supra-staking
      v-if="props.selectedNetwork?.title === 'Supra Oracles'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <near-staking
      v-if="props.selectedNetwork?.title === 'Near Protocol'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <zeta-staking
      v-if="props.selectedNetwork?.title === 'Zachain'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <polygon-staking
      v-if="props.selectedNetwork?.title === 'Polygon'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <moonriver-staking
      v-if="props.selectedNetwork?.title === 'Moonriver'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <graph-staking
      v-if="props.selectedNetwork?.title === 'The Graph'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <centrifuge-staking
      v-if="props.selectedNetwork?.title === 'Centrifuge'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <altair-staking
      v-if="props.selectedNetwork?.title === 'Altair'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <stafi-staking
      v-if="props.selectedNetwork?.title === 'Stafi'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <aura-staking
      v-if="props.selectedNetwork?.title === 'Aura Network'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <QProtocolStaking
      v-if="props.selectedNetwork?.title === 'Q Protocol'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <CovalentStaking
      v-if="props.selectedNetwork?.title === 'Covalent'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <SubQueryStaking
      v-if="props.selectedNetwork?.title === 'SubQuery'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <BitsCrunchStaking
      v-if="props.selectedNetwork?.title === 'BitsCrunch'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <RedbellyStaking
      v-if="props.selectedNetwork?.title === 'Redbelly'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <WalrusStaking
      v-if="props.selectedNetwork?.title === 'Walrus'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <MonadStaking
      v-if="props.selectedNetwork?.title === 'Monad'"
      :network="props.selectedNetwork"
      @close="emitClose"
    />
    <modal
      v-if="
        ![
          'Solana',
          'Kava',
          'Koii',
          'Agoric',
          'Band Protocol',
          'Stargaze',
          'Bitsong',
          'Juno',
          'Zetachain',
          'Ki Foundation',
          'Supra Oracles',
          'Near Protocol',
          'Polygon',
          'Moonriver',
          'The Graph',
          'Centrifuge',
          'Altair',
          'Stafi',
          'Aura Network',
          'Q Protocol',
          'Covalent',
          'SubQuery',
          'BitsCrunch',
          'Redbelly',
          'Walrus',
          'Monad'
        ].includes(props.selectedNetwork?.title)
      "
      v-show="props.isModalVisible"
      @close="emitClose"
      :network="props.selectedNetwork"
    />
  </div>
</template>

<script>
import modal from './Modal.vue'
import SolanaStaking from './stakingViews/SolanaStaking.vue'
import KavaStaking from './stakingViews/KavaStaking.vue'
import NearStaking from './stakingViews/NearStaking.vue'
import SupraStaking from './stakingViews/SupraStaking.vue'
import AgoricStaking from './stakingViews/AgoricStaking.vue'
import BandStaking from './stakingViews/BandStaking.vue'
import StargazeStaking from './stakingViews/StargazeStaking.vue'
import BitsongStaking from './stakingViews/BitsongStaking.vue'
import JunoStaking from './stakingViews/JunoStaking.vue'
import KiStaking from './stakingViews/KiStaking.vue'
import PolygonStaking from './stakingViews/PolygonStaking.vue'
import KoiiStaking from './stakingViews/KoiiStaking.vue'
import ZetaStaking from './stakingViews/ZetaStaking.vue'
import MoonriverStaking from './stakingViews/MoonriverStaking.vue'
import GraphStaking from './stakingViews/GraphStaking.vue'
import CentrifugeStaking from './stakingViews/CentrifugeStaking.vue'
import AltairStaking from './stakingViews/AltairStaking.vue'
import StafiStaking from './stakingViews/StafiStaking.vue'
import AuraStaking from './stakingViews/AuraStaking.vue'
import QProtocolStaking from './stakingViews/QProtocolStaking.vue'
import CovalentStaking from './stakingViews/CovalentStaking.vue'
import SubQueryStaking from './stakingViews/SubQueryStaking.vue'
import BitsCrunchStaking from './stakingViews/BitsCrunchStaking.vue'
import RedbellyStaking from './stakingViews/RedbellyStaking.vue'
import WalrusStaking from './stakingViews/WalrusStaking.vue'
import MonadStaking from './stakingViews/MonadStaking.vue'

export default {
  name: 'StakingModals',
  components: {
    SolanaStaking,
    KavaStaking,
    SupraStaking,
    NearStaking,
    KoiiStaking,
    AgoricStaking,
    BandStaking,
    StargazeStaking,
    BitsongStaking,
    JunoStaking,
    ZetaStaking,
    KiStaking,
    modal,
    PolygonStaking,
    MoonriverStaking,
    GraphStaking,
    CentrifugeStaking,
    AltairStaking,
    StafiStaking,
    AuraStaking,
    QProtocolStaking,
    CovalentStaking,
    SubQueryStaking,
    BitsCrunchStaking,
    RedbellyStaking,
    WalrusStaking,
    MonadStaking
  },
  props: {
    selectedNetwork: { type: Object, default: null },
    isModalVisible: { type: Boolean, default: false }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const emitClose = () => emit('close')
    return { props, emitClose }
  }
}
</script>
