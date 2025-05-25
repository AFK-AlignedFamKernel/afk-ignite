'use client';
import { useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
// import { useRouter } from 'next/router';

const MintStablecoin = () => {
//   const router = useRouter();
  const [btcAmount, setBtcAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [collateralRatio, setCollateralRatio] = useState(32);

  const bgColor = useColorModeValue('gray.300', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.300');
  const inputBgColor = useColorModeValue('var(--contrast-100)', 'var(--contrast-800)');
  const inputTextColor = useColorModeValue('var(--contrast-900)', 'var(--contrast-100)');
  const inputBorderColor = useColorModeValue('var(--border)', 'var(--contrast-700)');
  const placeholderColor = useColorModeValue('var(--contrast-500)', 'var(--contrast-400)');

  const handleMint = () => {
    // Add minting logic here
    console.log('Minting with:', { btcAmount, usdAmount, collateralRatio });
  };

  return (
    <Box bg={bgColor} color={textColor}>
      <div
        className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div>
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

          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Mint from BTC</h2>

          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input
                  type="number"
                  value={btcAmount}
                  onChange={(e) => setBtcAmount(e.target.value)}
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                    borderColor: inputBorderColor,
                  }}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border h-14 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal transition-colors duration-200"
                  placeholder="Enter BTC amount"
                />
                <div 
                  style={{
                    backgroundColor: inputBgColor,
                    color: placeholderColor,
                    borderColor: inputBorderColor,
                  }}
                  className="flex border items-center justify-center pr-4 rounded-r-lg border-l-0 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M170.48,115.7A44,44,0,0,0,144,40.19V24a8,8,0,0,0-16,0V40H112V24a8,8,0,0,0-16,0V40H64a8,8,0,0,0,0,16h8V192H64a8,8,0,0,0,0,16H96v16a8,8,0,0,0,16,0V208h16v16a8,8,0,0,0,16,0V208h8a48,48,0,0,0,18.48-92.3ZM168,84a28,28,0,0,1-28,28H88V56h52A28,28,0,0,1,168,84ZM152,192H88V128h64a32,32,0,0,1,0,64Z"></path>
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
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM240,56H16a8,8,0,0,0-8,8V192a8,8,0,0,0,8,8H240a8,8,0,0,0,8-8V64A8,8,0,0,0,240,56ZM193.65,184H62.35A56.78,56.78,0,0,0,24,145.65v-35.3A56.78,56.78,0,0,0,62.35,72h131.3A56.78,56.78,0,0,0,232,110.35v35.3A56.78,56.78,0,0,0,193.65,184ZM232,93.37A40.81,40.81,0,0,1,210.63,72H232ZM45.37,72A40.81,40.81,0,0,1,24,93.37V72ZM24,162.63A40.81,40.81,0,0,1,45.37,184H24ZM210.63,184A40.81,40.81,0,0,1,232,162.63V184Z"></path>
                  </svg>
                </div>
              </div>
            </label>
          </div>

          <div className="@container">
            <div className="relative flex w-full flex-col items-start justify-between gap-3 p-4 @[480px]:flex-row @[480px]:items-center">
              <div className="flex w-full shrink-[3] items-center justify-between">
                <p className="text-base font-medium leading-normal">Collateralization ratio</p>
                <p className="text-sm font-normal leading-normal @[480px]:hidden">{collateralRatio}%</p>
              </div>
              <div className="flex h-4 w-full items-center gap-4">
                <div className="flex h-1 flex-1 rounded-sm bg-[#3b4754]">
                  <div className="h-full rounded-sm bg-white" style={{ width: `${collateralRatio}%` }}></div>
                  <div className="relative">
                    <div className="absolute -left-2 -top-1.5 size-4 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default MintStablecoin;
