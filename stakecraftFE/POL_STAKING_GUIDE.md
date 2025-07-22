# POL Staking Implementation Guide

## Key Changes Made

Based on the official Polygon documentation, I've updated your POL staking implementation with the following corrections:

### 1. Network Configuration

- **POL staking happens on Ethereum mainnet**, not Polygon network
- All staking transactions must be executed on Ethereum
- Gas fees are paid in ETH, not POL

### 2. Contract Addresses (Ethereum Mainnet)

```javascript
const POL_ADDRESS = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' // POL Token
const STAKE_MANAGER_PROXY = '0x5e3Ef299fDDf15eAa0432E6e66473ace8c13D908' // StakeManager
```

### 3. Removed Deprecated Dependencies

- Removed `@maticnetwork/maticjs` (outdated)
- Using direct `ethers.js` contract interaction instead
- Simplified implementation with official contract ABIs

### 4. Updated Functions

#### `getPolygonBalance(address)`

- Now gets POL token balance from Ethereum mainnet
- Simplified parameter (removed unused signer)
- Proper error handling

#### `delegateTokens(signer, validatorId, amountEth)`

- Two-step process: approve POL → delegate via `buyVoucher`
- Proper transaction waiting and confirmation
- Returns transaction hash

#### `undelegateStake(signer, validatorId, amountEth)`

- Uses `sellVoucher_new` function from StakeManager
- Includes unbonding period notice (80 checkpoints ≈ 3-4 days)
- Returns transaction hash

#### `getTotalStakedAmount(address)`

- Updated to use official Polygon staking API
- Endpoint: `https://staking-api.polygon.technology/api/v3/delegators/{address}`

## How to Use

### 1. Connect Wallet

```javascript
const { provider, signer, address } = await connectWallet()
```

### 2. Get POL Balance

```javascript
const balance = await getPolygonBalance(address)
const balanceInPOL = formatEther(balance)
```

### 3. Delegate POL Tokens

```javascript
const txHash = await delegateTokens(signer, validatorId, amountToStake)
```

### 4. Undelegate POL Tokens

```javascript
const txHash = await undelegateStake(signer, validatorId, amountToUnstake)
```

### 5. Get Staked Amount

```javascript
const stakedAmount = await getTotalStakedAmount(address)
```

## Important Notes

1. **Network Requirement**: Users must be connected to Ethereum mainnet
2. **POL Tokens**: Users need POL tokens on Ethereum (not Polygon)
3. **Gas Fees**: Users need ETH for transaction fees
4. **Validator ID**: Must be a valid Polygon validator ID (not address)
5. **Unbonding Period**: Unstaked tokens have ~3-4 day waiting period

## Validator Information

- Use https://staking.polygon.technology/ to find valid validator IDs
- Validator addresses are different from validator IDs
- Check validator performance before delegating

## API References

- Official Staking Portal: https://staking.polygon.technology/
- Staking API: https://staking-api.polygon.technology/api/v3/delegators/{address}
- Polygon Documentation: https://docs.polygon.technology/

## Error Handling

All functions now include proper error handling and will throw errors that should be caught by the calling component. The Vue component has been updated to handle these errors appropriately.
