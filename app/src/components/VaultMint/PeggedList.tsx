import { useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { constants } from 'starknet';
import { Icon } from '../small/icon-component';
import { AUSD_TOKEN_AVAILABLE, AUSD_ADDRESSES, ETH_ADDRESSES, STRK_ADDRESSES } from '../../constants/contracts';
import { useUIStore } from '@/store/uiStore';
import { WalletConnectButton } from '../account/WalletConnectButton';
import { VaultMint } from '.';


export const PeggedList: React.FC = () => {

    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

    const [activeToken, setActiveToken] = useState<{
        address: string;
        symbol: string;
        decimals?: number;
        maxAmount?: string;
    }>(AUSD_TOKEN_AVAILABLE[0]);


    const [pool, setPool] = useState<'aUSD' | 'aETH' | "aBTC">('aUSD');

    return (
        <div className="flex flex-col gap-4 p-6 rounded-lg">

            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setPool('aUSD')}
                        className={`px-4 py-2 rounded-lg ${pool === 'aUSD' ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                    >
                        aUSD
                    </button>
                    <button
                        onClick={() => setPool('aETH')}
                        className={`px-4 py-2 rounded-lg ${pool === 'aETH' ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                    >
                        aETH
                    </button>
                    <button
                        onClick={() => setPool('aBTC')}
                        className={`px-4 py-2 rounded-lg ${pool === 'aBTC' ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                    >
                        aBTC
                    </button>
                </div>


            </div>

            <div className="flex flex-col gap-4">

                {pool === 'aUSD' && (
                    <VaultMint availableTokens={[
                        AUSD_TOKEN_AVAILABLE[0],
                        AUSD_TOKEN_AVAILABLE[1],
                    ]}
                        contractAddress={AUSD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA]}
                    />

                )}


            </div>

        </div>
    );
};
