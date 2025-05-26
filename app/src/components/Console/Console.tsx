"use client";
import MintStablecoin from "@/components/MintStablecoin";
import { BACKED_USD_ADDRESSES, DEFAULT_TOKENS } from "@/constants/contracts";
import { TokenSelection } from "@/types";
import { constants } from "starknet";
import { useState } from "react";
import MintStablecoinData from "@/components/MintStablecoin/Data";
import { PeggedList } from "@/components/VaultMint/PeggedList";
import Bridge from "@/components/Bridge";
import WalletComponents from "@/components/Wallet";

export default function ConsoleComponent() {

    const [selectedToken, setSelectedToken] = useState<TokenSelection | null>(DEFAULT_TOKENS[0]);

    const [activeTab, setActiveTab] = useState<'mint' | 'peggedcoin' | 'wallet' | 'bridge'>("mint");
    const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null);
    const handleTokenSelect = (token: TokenSelection) => {
        setSelectedToken(token);
        setSelectedTokenSymbol(token?.symbol);
    }

    console.log('selectedToken', selectedToken);
    return (
        <div className="m-4">
            <div className="flex flex-row gap-4 mx-2">
                <button className={`${activeTab === 'mint' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} px-4 py-2 rounded-md`} onClick={() => setActiveTab('mint')}>Mint</button>
                <button className={`${activeTab === 'peggedcoin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} px-4 py-2 rounded-md`} onClick={() => setActiveTab('peggedcoin')}>Pegged Coin</button>
                <button className={`${activeTab === 'wallet' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} px-4 py-2 rounded-md`} onClick={() => setActiveTab('wallet')}>Wallet</button>
                <button className={`${activeTab === 'bridge' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} px-4 py-2 rounded-md`} onClick={() => setActiveTab('bridge')}>Bridge</button>
            </div>


            {activeTab === 'mint' && (
                <>
                <MintStablecoin
                    mintContractAddress={BACKED_USD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA]}
                    selectedToken={selectedToken}
                    onTokenSelect={handleTokenSelect}
                />
                <MintStablecoinData
                    mintContractAddress={BACKED_USD_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA]}
                    tokenAddress={selectedToken?.address}
                />  
                </>
            )}
            {activeTab === 'peggedcoin' && (
                <PeggedList
                />
            )}
            {activeTab === 'wallet' && (
                <WalletComponents
                />
            )}

            {activeTab === 'bridge' && (
                <Bridge
                />
            )}

        </div>
    )
}