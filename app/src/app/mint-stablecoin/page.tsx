"use client";
import MintStablecoin from "@/components/MintStablecoin";
import { BACKED_USD_ADDRESSES, DEFAULT_TOKENS } from "@/constants/contracts";
import { TokenSelection } from "@/types";
import { constants } from "starknet";
import { useState } from "react";
import MintStablecoinData from "@/components/MintStablecoin/Data";

export default function MintStablecoinPage() {

    const [selectedToken, setSelectedToken] = useState<TokenSelection | null>(DEFAULT_TOKENS[0]);

    const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null);
    const handleTokenSelect = (token: TokenSelection) => {
        setSelectedToken(token);
        setSelectedTokenSymbol(token?.symbol);
    }

    console.log('selectedToken', selectedToken);
    return (
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
    )


        ;
}