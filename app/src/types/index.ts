export type ChainString = 'KAKAROT' | 'STARKNET' | 'SEPOLIA' | 'STARKNET_SEPOLIA';
export type Token = 'ETH' | 'STRK' | 'USDC';
export enum GiftType {
  'INTERNAL',
  'EXTERNAL_PRIVATE_KEY',
  'API',
}

export interface TokenSelection {
  symbol: string;
  address: string;
  decimals: number;
  icon: string;
  ticker_id: string;
}
