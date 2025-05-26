'use client';
import { useState } from 'react';
import { Box, useColorModeValue, Button, VStack, HStack, Text, Select } from '@chakra-ui/react';

interface BridgeProps {
  title?: string;
  onBridge?: (params: {
    amount: string;
    fromChain: string;
    toChain: string;
  }) => void;
}

const BridgeAtomiq = ({
  title = 'Bridge BTC to Starknet',
  onBridge
}: BridgeProps) => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('bitcoin');
  const [toChain, setToChain] = useState('starknet');
  const [isConnected, setIsConnected] = useState(false);

  const [activeTab, setActiveTab] = useState<'garden' | 'atomiq' | 'internal'>('atomiq');

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

          <VStack spacing={6} p={4}>
            {!isConnected ? (
              <Button
                onClick={handleConnectWallet}
                colorScheme="blue"
                size="lg"
                width="full"
              >
                Connect Bitcoin Wallet
              </Button>
            ) : (
              <>
                <HStack width="full" spacing={4}>
                  <Select
                    value={fromChain}
                    onChange={(e) => setFromChain(e.target.value)}
                    bg={inputBgColor}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  >
                    <option value="bitcoin">Bitcoin</option>
                    <option value="starknet">Starknet</option>
                  </Select>
                  <Text>→</Text>
                  <Select
                    value={toChain}
                    onChange={(e) => setToChain(e.target.value)}
                    bg={inputBgColor}
                    color={inputTextColor}
                    borderColor={inputBorderColor}
                  >
                    <option value="starknet">Starknet</option>
                    <option value="bitcoin">Bitcoin</option>
                  </Select>
                </HStack>

                <Box width="full">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      backgroundColor: inputBgColor,
                      color: inputTextColor,
                      borderColor: inputBorderColor,
                    }}
                    className="form-input w-full rounded-lg focus:outline-0 focus:ring-0 border h-14 p-4 text-base font-normal leading-normal transition-colors duration-200"
                    placeholder="Enter amount"
                  />
                </Box>

                <Button
                  onClick={handleBridge}
                  colorScheme="blue"
                  size="lg"
                  width="full"
                >
                  Bridge {fromChain === 'bitcoin' ? 'BTC' : 'ETH'} to {toChain === 'starknet' ? 'Starknet' : 'Bitcoin'}
                </Button>
              </>
            )}
          </VStack>


        </div>
      </div>
    </Box>
  );
};

export default BridgeAtomiq;
