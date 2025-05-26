'use client';
import { useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
// import { useRouter } from 'next/router';
import { TokenSelection } from '@/types';
import { BACKED_USD_ADDRESSES, STRK_ADDRESSES } from '@/constants/contracts';
import { constants } from 'starknet';
import { useMintStablecoin } from '@/hooks/mintstablecoin';

interface MintStablecoinProps {
  title?: string;
  tokens?: TokenSelection[];
  selectedToken?: TokenSelection;
  mintContractAddress?: string;
  defaultCollateralRatio?: number;
  minCollateralRatio?: number;
  maxCollateralRatio?: number;
  onMint?: (params: {
    collateralAmount: string;
    stablecoinAmount: string;
    collateralRatio: number;
    selectedToken: TokenSelection;
  }) => void;
  onTokenSelect?: (token: TokenSelection) => void;
  isCollateralRatioEditable?: boolean;
  isBackAvailable?: boolean;
}

const DEFAULT_TOKENS: TokenSelection[] = [
  {
    symbol: "STRK",
    decimals: 18,
    address: STRK_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
    icon: "",
    ticker_id: "STRK/USD"
  }
  // {
  //   symbol: 'BTC',
  //   address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  //   decimals: 8,
  //   icon: '₿',
  //   ticker_id: 'BTC/USD'
  // },
  // {
  //   symbol: 'ETH',
  //   address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  //   decimals: 18,
  //   icon: 'Ξ',
  //   ticker_id: 'ETH/USD'
  // }
];

const MintStablecoin = ({
  title = 'Mint abUSD',
  tokens = DEFAULT_TOKENS,
  selectedToken = DEFAULT_TOKENS[0],
  mintContractAddress = BACKED_USD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA],
  defaultCollateralRatio = 150,
  minCollateralRatio = 110,
  maxCollateralRatio = 200,
  onMint,
  onTokenSelect,
  isCollateralRatioEditable = false,
  isBackAvailable = false,
}: MintStablecoinProps) => {
  //   const router = useRouter();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [stablecoinAmount, setStablecoinAmount] = useState('');
  const [collateralRatio, setCollateralRatio] = useState(defaultCollateralRatio);


  const bgColor = useColorModeValue('gray.300', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.300');
  const inputBgColor = useColorModeValue('var(--contrast-100)', 'var(--contrast-800)');
  const inputTextColor = useColorModeValue('var(--contrast-900)', 'var(--contrast-100)');
  const inputBorderColor = useColorModeValue('var(--border)', 'var(--contrast-700)');
  const placeholderColor = useColorModeValue('var(--contrast-500)', 'var(--contrast-400)');

  const { handleDeposit } = useMintStablecoin({ contractAddress: mintContractAddress });

  const handleCollateralAmountChange = (value: string) => {
    setCollateralAmount(value);
    // Calculate stablecoin amount based on collateral ratio
    if (value) {
      const calculatedStablecoin = (parseFloat(value) * collateralRatio) / 100;
      setStablecoinAmount(calculatedStablecoin.toString());
    } else {
      setStablecoinAmount('');
    }
  };

  const handleStablecoinAmountChange = (value: string) => {
    setStablecoinAmount(value);
    // Calculate collateral amount based on collateral ratio
    if (value) {
      const calculatedCollateral = (parseFloat(value) * 100) / collateralRatio;
      setCollateralAmount(calculatedCollateral.toString());
    } else {
      setCollateralAmount('');
    }
  };

  const handleCollateralRatioChange = (value: number) => {
    setCollateralRatio(value);
    // Recalculate stablecoin amount if collateral amount exists
    if (collateralAmount) {
      const calculatedStablecoin = (parseFloat(collateralAmount) * value) / 100;
      setStablecoinAmount(calculatedStablecoin.toString());
    }
  };

  const handleMint = () => {
    if (onMint) {
      onMint({
        collateralAmount,
        stablecoinAmount,
        collateralRatio,
        selectedToken
      });
    }

    console.log('selectedToken', selectedToken);


    const tx = handleDeposit(selectedToken?.address, stablecoinAmount, selectedToken?.address);
    console.log('tx', tx);
    console.log('Minting with:', {
      collateralAmount,
      stablecoinAmount,
      collateralRatio,
      selectedToken,
      mintContractAddress
    });
  };

  return (
    <Box bg={bgColor} color={textColor}>
      <div
        className="flex size-full flex-col justify-between group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div>

          {isBackAvailable && (
            <div className="flex items-center p-4 pb-2 justify-between">
              <button
                //   onClick={() => router.back()}
                className="flex size-12 shrink-0 items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
              <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Mint</h2>
            </div>
          )}

          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{title}</h2>

          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <select
                  value={selectedToken?.symbol}
                  onChange={(e) => {
                    const token = tokens.find(t => t?.symbol === e.target.value);
                    if (token && onTokenSelect) {
                      onTokenSelect(token);
                    }
                  }}
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                  }}
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border h-14 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal transition-colors duration-200"
                >
                  {tokens.map((token, index) => (
                    <option key={index} value={token?.symbol} className="flex items-center gap-2">
                      <span>{token?.icon}</span>
                      <span>{token?.symbol}</span>
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    backgroundColor: inputBgColor,
                    color: placeholderColor,
                    borderColor: inputBorderColor,
                  }}
                  className="flex border items-center justify-center pr-4 rounded-r-lg border-l-0 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
              </div>
            </label>
          </div>

          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input
                  type="number"
                  value={collateralAmount}
                  onChange={(e) => handleCollateralAmountChange(e.target.value)}
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                  }}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border h-14 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal transition-colors duration-200"
                  placeholder={`Enter ${selectedToken?.symbol} amount`}
                />
                <div
                  style={{
                    backgroundColor: inputBgColor,
                    color: placeholderColor,
                    borderColor: inputBorderColor,
                  }}
                  className="flex border items-center justify-center pr-4 rounded-r-lg border-l-0 transition-colors duration-200"
                >
                  <span className="flex items-center gap-2">
                    <span>{selectedToken?.icon}</span>
                    <span>{selectedToken?.symbol}</span>
                  </span>
                </div>
              </div>
            </label>
          </div>

          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input
                  type="number"
                  value={stablecoinAmount}
                  onChange={(e) => handleStablecoinAmountChange(e.target.value)}
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                  }}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border h-14 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal transition-colors duration-200"
                  placeholder="Enter USD amount"
                />
                <div
                  style={{
                    backgroundColor: inputBgColor,
                    color: placeholderColor,
                    borderColor: inputBorderColor,
                  }}
                  className="flex border items-center justify-center pr-4 rounded-r-lg border-l-0 transition-colors duration-200"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM240,56H16a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H240a8,8,0,0,0,8-8V64A8,8,0,0,0,240,56ZM193.65,184H62.35A56.78,56.78,0,0,0,24,145.65v-35.3A56.78,56.78,0,0,0,62.35,72h131.3A56.78,56.78,0,0,0,232,110.35v35.3A56.78,56.78,0,0,0,193.65,184ZM232,93.37A40.81,40.81,0,0,1,210.63,72H232ZM45.37,72A40.81,40.81,0,0,1,24,93.37V72ZM24,162.63A40.81,40.81,0,0,1,45.37,184H24ZM210.63,184A40.81,40.81,0,0,1,232,162.63V184Z"></path>
                    </svg>
                    <span>USD</span>
                  </span>
                </div>
              </div>
            </label>
          </div>

          {isCollateralRatioEditable && (
            <div className="@container">
              <div className="flex w-full flex-col items-start justify-between gap-3 p-4 @[480px]:flex-row @[480px]:items-center">
                <div className="flex w-full shrink-[3] items-center justify-between">
                  <p className="text-base font-medium leading-normal">Collateralization ratio</p>
                  <p className="text-sm font-normal leading-normal @[480px]:hidden">{collateralRatio}%</p>
                </div>
                <div className="flex h-4 w-full items-center gap-4">
                  <input
                    type="range"
                    min={minCollateralRatio}
                    max={maxCollateralRatio}
                    value={collateralRatio}
                    onChange={(e) => handleCollateralRatioChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex h-1 flex-1 rounded-sm bg-[#3b4754]">
                    <div
                      className="h-full rounded-sm bg-white"
                      style={{
                        width: `${((collateralRatio - minCollateralRatio) / (maxCollateralRatio - minCollateralRatio)) * 100}%`
                      }}
                    ></div>
        
                  </div>
                </div>
              </div>
            </div>
          )}



          <div className="px-4 py-3">
            <button
              onClick={handleMint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Mint Stablecoin
            </button>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default MintStablecoin;
