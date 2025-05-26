'use client';
import { useState } from 'react';
import { Box, useColorModeValue, Button, VStack, HStack, Text, Select } from '@chakra-ui/react';
import BridgeAtomiq from './BridgeAtomiq';

interface BridgeProps {
  title?: string;
  onBridge?: (params: {
    amount: string;
    fromChain: string;
    toChain: string;
  }) => void;
}

const Bridge = ({
  title = 'Bridge BTC to Starknet',
  onBridge
}: BridgeProps) => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('bitcoin');
  const [toChain, setToChain] = useState('starknet');
  const [isConnected, setIsConnected] = useState(false);

  const [activeTab, setActiveTab] = useState<'garden' | 'atomiq' | 'internal' | 'layerswap' | 'onramp'>('atomiq');

  const bgColor = useColorModeValue('gray.300', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.300');
  const inputBgColor = useColorModeValue('var(--contrast-100)', 'var(--contrast-800)');
  const inputTextColor = useColorModeValue('var(--contrast-900)', 'var(--contrast-100)');
  const inputBorderColor = useColorModeValue('var(--border)', 'var(--contrast-700)');

  const handleConnectWallet = () => {
    // Implement wallet connection logic here
    setIsConnected(true);
  };

  const handleBridge = () => {
    if (onBridge) {
      onBridge({
        amount,
        fromChain,
        toChain
      });
    }
    console.log('Bridging:', { amount, fromChain, toChain });
  };

  return (
    <Box bg={bgColor} color={textColor}>
      <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden">
        <div>
          <div className="flex items-center p-4 pb-2 justify-between">
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{title}</h2>
          </div>

          <div>

            <div className='flex flex-row gap-2'>
              <button className={`${activeTab === 'atomiq' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} px-4 py-2 rounded-md`} onClick={() => setActiveTab('atomiq')}>Atomiq</button>
              <button className={`${activeTab === 'garden' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} px-4 py-2 rounded-md`} onClick={() => setActiveTab('garden')}>Garden</button>
              <button className={`${activeTab === 'internal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} px-4 py-2 rounded-md`} onClick={() => setActiveTab('internal')}>Internal</button>
            </div>


            <div className='h-[80vh]'>

              {activeTab === 'atomiq' && (
                <iframe src="https://app.atomiq.exchange" width="100%" height="100%" loading="lazy"></iframe>
              )}
              {activeTab === 'garden' && (
                <iframe src="https://app.garden.finance/swap?input-chain=bitcoin&input-asset=BTC&output-chain=starknet&output-asset=WBTC" width="100%" height="100%" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe>
              )}

              {activeTab === 'internal' && (
                <BridgeAtomiq />
              )}

              {activeTab === 'layerswap' && (
                <iframe src="https://app.garden.finance/swap?input-chain=bitcoin&input-asset=BTC&output-chain=starknet&output-asset=WBTC" width="100%" height="100%" loading="lazy" sandbox="allow-scripts allow-same-origin"></iframe>

              )}


              {activeTab === 'onramp' && (
                <iframe src="https://onramp.money/main/swap/?appId=1"></iframe>
              )}

            </div>


          </div>
        </div>
      </div>
    </Box>
  );
};

export default Bridge;
