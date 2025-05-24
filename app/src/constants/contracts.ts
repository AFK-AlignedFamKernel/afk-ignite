import {constants, getChecksumAddress} from 'starknet';

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
