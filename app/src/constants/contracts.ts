import { constants, getChecksumAddress } from 'starknet';


export const AUSD_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: '', // TODO: Add mainnet escrow address

  // aUSD Contract with internal deposit/withdrawal
  // [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
  //   '0x17b3ce9c2c328ff50bd09cf349a8455ffc5d8c0e776964795b2024cf55761dd',
  // ),
  // [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
  //   '0x2c5f5088afc743cee817c3b080faac6af40b83cb21a4db30f794fc3d55928f3',
  // ),
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x1d0a23723fa124e2aebc152498ca30b6ac7fa1f1224707172b868a44293a659',
  ),
  
};

// export const USD_ADDRESSES = {
//   [constants.StarknetChainId.SN_MAIN]: '0x02f37c3e00e75ee4135b32bb60c37e0599af264076376a618f138d2f9929ac74', // TODO: Add mainnet escrow address
//   [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
//     '0x02f37c3e00e75ee4135b32bb60c37e0599af264076376a618f138d2f9929ac74',
//   ),
// }

export const USD_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: '0x053b40A647CEDfca6cA84f542A0fe36736031905A9639a7f19A3C1e66bFd5080', // TODO: Add mainnet escrow address
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x053b40A647CEDfca6cA84f542A0fe36736031905A9639a7f19A3C1e66bFd5080',
  ),
}

export const AUSD_TOKEN_AVAILABLE = [
  {
    address: USD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
    symbol: 'USDC',
    decimals: 6,
  },
  {
    address: AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
    symbol: 'aUSD',
    decimals: 6,
  },
]



export const AETH_ADDRESSES = {
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x17b3ce9c2c328ff50bd09cf349a8455ffc5d8c0e776964795b2024cf55761dd',
  ),

}

export const ESCROW_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: '', // TODO: Add mainnet escrow address
  // [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
  //   '0x078a022e6906c83e049a30f7464b939b831ecbe47029480d7e89684f20c8d263',
  // ),

  // AFL
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x7323351c9e497ef4cc59cfdacdc8ba7b07c6b4aaeb07e78dfda0988f6e8e3ee',
  ),
};

export const ETH_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: getChecksumAddress(
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  ),
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  ),
};

export const STRK_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: getChecksumAddress(
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ),
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ),
};

export const BTC_VAULT_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: getChecksumAddress(
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ),
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ),
};


export const WBTC_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: getChecksumAddress(
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ),
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ),
};

export const USDC_ADDRESSES = {
  [constants.StarknetChainId.SN_MAIN]: getChecksumAddress(
    '0x053b40A647CEDfca6cA84f542A0fe36736031905A9639a7f19A3C1e66bFd5080',
  ),
  [constants.StarknetChainId.SN_SEPOLIA]: getChecksumAddress(
    '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  ),
};

export const AVAILABLE_TOKENS = {
  [constants.StarknetChainId.SN_MAIN]: [
    {
      address: WBTC_ADDRESSES[constants.StarknetChainId.SN_MAIN],
      symbol: 'WBTC',
      decimals: 8,
      maxAmount: '1000000000000000000',
    },
  ],
};
