// export const StakingContractABI = [
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'validator',
//         type: 'address'
//       },
//       {
//         internalType: 'uint256',
//         name: 'amount',
//         type: 'uint256'
//       }
//     ],
//     name: 'delegate',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function'
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'validator',
//         type: 'address'
//       }
//     ],
//     name: 'undelegate',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function'
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'validator',
//         type: 'address'
//       }
//     ],
//     name: 'claimRewards',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function'
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'delegator',
//         type: 'address'
//       },
//       {
//         internalType: 'address',
//         name: 'validator',
//         type: 'address'
//       }
//     ],
//     name: 'delegations',
//     outputs: [
//       {
//         components: [
//           {
//             internalType: 'uint256',
//             name: 'amount',
//             type: 'uint256'
//           },
//           {
//             internalType: 'uint256',
//             name: 'reward',
//             type: 'uint256'
//           }
//         ],
//         internalType: 'struct IStaking.Delegation',
//         name: '',
//         type: 'tuple'
//       }
//     ],
//     stateMutability: 'view',
//     type: 'function'
//   }
// ]

/*  Polygon PoS - StakeManager (proxy at 0x5e3E…D908 on Ethereum)          *
 *  Only the fragments you call; keeps bundle size <1 KB.                  */

export const StakingContractABI = [
  /* view */
  'function delegatorStake(address _delegator, uint256 _validatorId) view ' +
    'returns (uint256 amount, uint256 reward)',

  /* writes you use */
  'function delegate(uint256 _validatorId, uint256 _amount)', // stake
  'function unstake(uint256 _validatorId)', // undelegate
  'function withdrawRewards(uint256 _validatorId)', // claim

  /* handy events (optional) */
  'event Staked(address indexed delegator, uint256 indexed validatorId, uint256 amount)',
  'event Unstaked(address indexed delegator, uint256 indexed validatorId, uint256 amount)',
  'event RewardClaimed(address indexed delegator, uint256 indexed validatorId, uint256 reward)'
]
