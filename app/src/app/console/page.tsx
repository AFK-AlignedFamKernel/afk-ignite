"use client";
import MintStablecoin from "@/components/MintStablecoin";
import { BACKED_USD_ADDRESSES, DEFAULT_TOKENS } from "@/constants/contracts";
import { TokenSelection } from "@/types";
import { constants } from "starknet";
import { useState } from "react";
import ConsoleComponent from "@/components/Console/Console";

export default function ConsolePage() {

    const [selectedToken, setSelectedToken] = useState<TokenSelection | null>(DEFAULT_TOKENS[0]);


    const [activeTab, setActiveTab] = useState<'mint' | 'peggedcoin' | 'wallet' | 'bridge'>("mint");
    const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null);
    const handleTokenSelect = (token: TokenSelection) => {
        setSelectedToken(token);
        setSelectedTokenSymbol(token?.symbol);
    }
    return (
        <ConsoleComponent />
    )
}