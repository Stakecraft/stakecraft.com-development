/**
 * List of networks that have dedicated staking components
 */
const NETWORKS_WITH_STAKING_COMPONENTS = [
  'Solana',
  'Kava',
  'Koii',
  'Agoric',
  'Band Protocol',
  'Stargaze',
  'Bitsong',
  'Aura Network',
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
  'Q Protocol',
  'Covalent',
  'SubQuery',
  'BitsCrunch',
  'Redbelly',
  'Walrus',
  'Monad'
]

/**
 * Check if a network has a validator address configured
 * @param {Object} network - The network object
 * @returns {boolean} - True if validator address is available
 */
function hasValidatorAddress(network) {
  if (!network) return false
  
  // Check for validator field (can be string, array, or object)
  if (network.validator) {
    if (Array.isArray(network.validator) && network.validator.length > 0) {
      return network.validator[0] && network.validator[0].trim() !== ''
    }
    if (typeof network.validator === 'string') {
      return network.validator.trim() !== ''
    }
  }
  
  // Check for validatorId field (some networks use this)
  if (network.validatorId) {
    return true
  }
  
  return false
}

/**
 * Check if a network is ready for staking
 * @param {Object} network - The network object
 * @returns {Object} - Object with isReady flag and reason if not ready
 */
export function isNetworkReadyForStaking(network) {
  if (!network || !network.title) {
    return {
      isReady: false,
      reason: 'Network data is missing'
    }
  }

  const networkTitle = network.title

  // Check if network has a staking component
  const hasStakingComponent = NETWORKS_WITH_STAKING_COMPONENTS.includes(networkTitle)

  if (!hasStakingComponent) {
    return {
      isReady: false,
      reason: 'Staking component is not available for this network'
    }
  }

  // Check if network has validator address
  if (!hasValidatorAddress(network)) {
    return {
      isReady: false,
      reason: 'Validator address is not configured'
    }
  }

  // Network is ready
  return {
    isReady: true,
    reason: null
  }
}

